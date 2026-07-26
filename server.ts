import express from "express";
import http from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

interface Player {
  id: string;
  color: 'w' | 'b';
  name: string;
}

interface RoomData {
  id: string;
  fen: string;
  history: any[];
  turn: 'w' | 'b';
  players: {
    w?: Player;
    b?: Player;
  };
  timeLimit: number; // in seconds, e.g. 600 for 10m
  whiteTime: number;
  blackTime: number;
  timerStarted: boolean;
  lastMoveTimestamp?: number;
  status: 'waiting' | 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'timeout';
}

const rooms = new Map<string, RoomData>();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", activeRooms: rooms.size });
  });

  // Gemini AI Coach Hint Endpoint
  app.post("/api/ai-hint", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({
          error: "GEMINI_API_KEY não configurada no servidor."
        });
      }

      const { fen, turn, history, difficulty } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `És um Grande Mestre de Xadrez e treinador tático. 
Analisa a seguinte posição no formato FEN: "${fen}".
É a vez das ${turn === 'w' ? 'Brancas (Brancas a jogar)' : 'Pretas (Pretas a jogar)'}.
Histórico de jogadas recentes: ${JSON.stringify(history?.slice(-6) || [])}.
Nível do jogador: ${difficulty || 'intermédio'}.

Fornece uma análise em PORTUGUÊS com a seguinte estrutura em formato JSON estrito:
{
  "bestMove": "Melhor jogada em notação SAN (ex: Nf3, e4, Qh5)",
  "explanation": "Explicação tática concisa de 2 frases sobre a melhor jogada",
  "threat": "O principal perigo ou oportunidade na posição atual",
  "evaluation": "Avaliação geral da posição (ex: 'Igualado', 'Vantagem Brancas (+1.5)', 'Ataque perigoso')"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const analysis = JSON.parse(text);
      res.json(analysis);
    } catch (err: any) {
      console.error("AI Hint Error:", err);
      res.status(500).json({ error: err.message || "Erro ao consultar o Mestre AI." });
    }
  });

  // Socket.IO Real-Time Management
  io.on("connection", (socket: Socket) => {
    let currentRoomId: string | null = null;

    socket.on("join-room", ({ roomId, playerName }: { roomId: string; playerName?: string }) => {
      currentRoomId = roomId;
      socket.join(roomId);

      let room = rooms.get(roomId);
      if (!room) {
        room = {
          id: roomId,
          fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          history: [],
          turn: 'w',
          players: {},
          timeLimit: 600,
          whiteTime: 600,
          blackTime: 600,
          timerStarted: false,
          status: 'waiting'
        };
        rooms.set(roomId, room);
      }

      // Assign color
      let assignedColor: 'w' | 'b' = 'w';
      if (!room.players.w) {
        assignedColor = 'w';
        room.players.w = { id: socket.id, color: 'w', name: playerName || 'Jogador 1 (Criador)' };
      } else if (!room.players.b && room.players.w.id !== socket.id) {
        assignedColor = 'b';
        room.players.b = { id: socket.id, color: 'b', name: playerName || 'Convidado (Jogador 2)' };
        room.status = 'playing';
      } else if (room.players.w.id === socket.id) {
        assignedColor = 'w';
      } else if (room.players.b?.id === socket.id) {
        assignedColor = 'b';
      }

      // Emit room initialization to the connecting client
      socket.emit("room-joined", {
        roomId,
        myColor: assignedColor,
        roomState: room
      });

      // Broadcast room update to everyone in the room
      io.to(roomId).emit("room-updated", room);
    });

    socket.on("make-move", ({ roomId, from, to, promotion, fen, san, moveObj }: any) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.fen = fen;
      room.turn = room.turn === 'w' ? 'b' : 'w';
      room.history.push({ from, to, promotion, san, moveObj, timestamp: Date.now() });

      if (!room.timerStarted && room.players.w && room.players.b) {
        room.timerStarted = true;
      }

      // Broadcast move to other player and room
      io.to(roomId).emit("move-made", {
        from,
        to,
        promotion,
        fen,
        san,
        turn: room.turn,
        history: room.history,
        lastMove: { from, to }
      });
    });

    socket.on("send-reaction", ({ roomId, emoji, senderColor }: { roomId: string; emoji: string; senderColor: 'w' | 'b' }) => {
      io.to(roomId).emit("reaction-received", { emoji, senderColor, id: Math.random() });
    });

    socket.on("request-rematch", ({ roomId }: { roomId: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Reset room state for new game
      room.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      room.history = [];
      room.turn = 'w';
      room.whiteTime = room.timeLimit;
      room.blackTime = room.timeLimit;
      room.status = 'playing';

      io.to(roomId).emit("rematch-started", room);
    });

    socket.on("game-over", ({ roomId, status, winner }: { roomId: string; status: string; winner?: 'w' | 'b' | 'draw' }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.status = status as any;
      }
      io.to(roomId).emit("game-ended", { status, winner });
    });

    socket.on("disconnect", () => {
      if (currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          if (room.players.w?.id === socket.id) {
            delete room.players.w;
          }
          if (room.players.b?.id === socket.id) {
            delete room.players.b;
          }
          if (!room.players.w && !room.players.b) {
            rooms.delete(currentRoomId);
          } else {
            room.status = 'waiting';
            io.to(currentRoomId).emit("player-disconnected", { room });
          }
        }
      }
    });
  });

  // Vite Middleware in dev, Static Files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
