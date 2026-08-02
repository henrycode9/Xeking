import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { Server, Socket } from "socket.io";
import { createServer as createViteServer } from "vite";
import { Chess } from "chess.js";
import dotenv from "dotenv";

dotenv.config();

// ─── Types ────────────────────────────────────────────────────────────────────

type Color = 'w' | 'b';
type GameStatus = 'waiting' | 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'timeout';

interface Player {
  id: string;
  color: Color;
  name: string;
}

interface RoomData {
  id: string;
  fen: string;
  history: MoveRecord[];
  turn: Color;
  players: { w?: Player; b?: Player };
  timeLimit: number;
  whiteTime: number;
  blackTime: number;
  timerStarted: boolean;
  lastActivity: number;
  status: GameStatus;
}

interface MoveRecord {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  timestamp: number;
}

// Socket.IO event payloads
interface JoinRoomPayload  { roomId: string; playerName?: string }
interface MakeMovePayload  { roomId: string; from: string; to: string; promotion?: string }
interface RematchPayload   { roomId: string }
interface ResignPayload    { roomId: string; resigningColor: Color }
interface GameOverPayload  { roomId: string; status: GameStatus; winner?: Color | 'draw' }

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const DEFAULT_TIME_LIMIT = 600; // 10 minutes
const ROOM_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const ROOM_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes

// ─── State ────────────────────────────────────────────────────────────────────

const rooms = new Map<string, RoomData>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createRoom(roomId: string): RoomData {
  return {
    id: roomId,
    fen: INITIAL_FEN,
    history: [],
    turn: 'w',
    players: {},
    timeLimit: DEFAULT_TIME_LIMIT,
    whiteTime: DEFAULT_TIME_LIMIT,
    blackTime: DEFAULT_TIME_LIMIT,
    timerStarted: false,
    lastActivity: Date.now(),
    status: 'waiting',
  };
}

/** Periodically remove rooms that have been inactive for ROOM_TTL_MS */
function startRoomCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    rooms.forEach((room, id) => {
      if (now - room.lastActivity > ROOM_TTL_MS) {
        rooms.delete(id);
        cleaned++;
      }
    });
    if (cleaned > 0) {
      console.log(`[cleanup] Removed ${cleaned} stale room(s). Active: ${rooms.size}`);
    }
  }, ROOM_CLEANUP_INTERVAL_MS);
}

// ─── Server bootstrap ─────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "*";

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
    },
  });

  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // ── REST: Health ────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", activeRooms: rooms.size });
  });



  // ── Socket.IO ───────────────────────────────────────────────────────────────
  io.on("connection", (socket: Socket) => {
    let currentRoomId: string | null = null;

    // ── join-room ─────────────────────────────────────────────────────────────
    socket.on("join-room", ({ roomId, playerName }: JoinRoomPayload) => {
      if (!roomId || typeof roomId !== 'string' || roomId.length > 32) return;

      currentRoomId = roomId;
      socket.join(roomId);

      let room = rooms.get(roomId) ?? createRoom(roomId);
      rooms.set(roomId, room);
      room.lastActivity = Date.now();

      // Assign color deterministically & handle mobile reconnection
      let assignedColor: Color = 'w';
      if (!room.players.w || room.players.w.id === socket.id) {
        assignedColor = 'w';
        room.players.w = { id: socket.id, color: 'w', name: playerName ?? 'Criador' };
      } else if (!room.players.b || room.players.b.id === socket.id) {
        assignedColor = 'b';
        room.players.b = { id: socket.id, color: 'b', name: playerName ?? 'Convidado' };
      } else {
        assignedColor = 'b';
        room.players.b = { id: socket.id, color: 'b', name: playerName ?? 'Convidado' };
      }

      if (room.players.w && room.players.b) {
        room.status = 'playing';
      }

      socket.emit("room-joined", { roomId, myColor: assignedColor, roomState: room });
      io.to(roomId).emit("room-updated", room);
    });

    // ── make-move (server-authoritative validation) ───────────────────────────
    socket.on("make-move", ({ roomId, from, to, promotion }: MakeMovePayload) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing') return;

      // Verify it's the correct player's turn
      const movingPlayer =
        room.turn === 'w' ? room.players.w : room.players.b;
      if (movingPlayer?.id !== socket.id) return;

      // Validate move on the server using chess.js
      const chess = new Chess(room.fen);
      let move;
      try {
        move = chess.move({ from, to, promotion: promotion ?? 'q' });
      } catch {
        // Illegal move — silently ignore
        return;
      }
      if (!move) return;

      const newFen = chess.fen();
      room.fen = newFen;
      room.turn = chess.turn() as Color;
      room.lastActivity = Date.now();

      const record: MoveRecord = {
        from,
        to,
        promotion,
        san: move.san,
        timestamp: Date.now(),
      };
      room.history.push(record);

      // Detect end-of-game
      let endStatus: GameStatus | null = null;
      let winner: Color | 'draw' | null = null;

      if (chess.isCheckmate()) {
        endStatus = 'checkmate';
        winner = move.color as Color; // the player who just moved wins
        room.status = 'checkmate';
      } else if (chess.isDraw()) {
        endStatus = 'draw';
        winner = 'draw';
        room.status = 'draw';
      } else if (chess.isStalemate()) {
        endStatus = 'stalemate';
        winner = 'draw';
        room.status = 'stalemate';
      }

      // Broadcast authoritative move to both players
      io.to(roomId).emit("move-made", {
        from,
        to,
        promotion,
        fen: newFen,
        san: move.san,
        turn: room.turn,
        history: room.history,
        lastMove: { from, to },
        inCheck: chess.inCheck(),
        endStatus,
        winner,
      });
    });

    // ── request-rematch ───────────────────────────────────────────────────────
    socket.on("request-rematch", ({ roomId }: RematchPayload) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.fen = INITIAL_FEN;
      room.history = [];
      room.turn = 'w';
      room.whiteTime = room.timeLimit;
      room.blackTime = room.timeLimit;
      room.status = 'playing';
      room.timerStarted = false;
      room.lastActivity = Date.now();

      io.to(roomId).emit("rematch-started", room);
    });

    // ── resign ────────────────────────────────────────────────────────────────
    socket.on("resign", ({ roomId, resigningColor }: ResignPayload) => {
      const room = rooms.get(roomId);
      const winner: Color = resigningColor === 'w' ? 'b' : 'w';
      if (room) {
        room.status = 'checkmate';
        room.lastActivity = Date.now();
      }
      io.to(roomId).emit("game-resigned", { winner, resigningColor });
    });

    // ── game-over (client-initiated, e.g. draw agreement) ────────────────────
    socket.on("game-over", ({ roomId, status, winner }: GameOverPayload) => {
      const room = rooms.get(roomId);
      if (room) {
        room.status = status;
        room.lastActivity = Date.now();
      }
      io.to(roomId).emit("game-ended", { status, winner });
    });

    // ── disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;

      if (room.players.w?.id === socket.id) delete room.players.w;
      if (room.players.b?.id === socket.id) delete room.players.b;

      if (!room.players.w && !room.players.b) {
        rooms.delete(currentRoomId);
      } else {
        room.lastActivity = Date.now();
        io.to(currentRoomId).emit("player-disconnected", { room });
      }
    });
  });

  // ── Static / Vite middleware ─────────────────────────────────────────────────
  const distPath = path.join(process.cwd(), "dist");
  const publicPath = path.join(process.cwd(), "public");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  // Explicitly serve static piece assets from public or dist
  if (fs.existsSync(publicPath)) {
    app.use("/pieces", express.static(path.join(publicPath, "pieces")));
  }

  if (hasDist) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  startRoomCleanup();

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] Listening on http://0.0.0.0:${PORT}`);
    console.log(`[server] CORS origin: ${allowedOrigin}`);
    console.log(`[server] Room TTL: ${ROOM_TTL_MS / 60000}min | Cleanup: ${ROOM_CLEANUP_INTERVAL_MS / 60000}min`);
  });
}

startServer();
