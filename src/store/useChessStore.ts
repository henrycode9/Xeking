import { create } from 'zustand';
import { Chess, Square } from 'chess.js';
import { io, Socket } from 'socket.io-client';
import { GameMode, PlayerColor, GameStatus, MoveLog, Reaction } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TIME = 600; // 10 minutes
const MAX_REACTIONS = 10;
const REACTION_TTL_MS = 4000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateRoomId = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

/**
 * Evaluates end-of-game state after a move.
 * Single source of truth — used by both local and remote move handlers.
 */
function resolveGameEnd(
  chess: Chess,
  moverColor: PlayerColor
): { status: GameStatus; winner: PlayerColor | 'draw' | null } | null {
  if (chess.isCheckmate()) {
    return { status: 'checkmate', winner: moverColor };
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return { status: 'draw', winner: 'draw' };
  }
  return null;
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface ChessStore {
  // Board state
  chess: Chess;
  fen: string;
  turn: PlayerColor;
  selectedSquare: Square | null;
  hoveredSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  history: MoveLog[];

  // Game setup & multiplayer
  gameMode: GameMode;
  myColor: PlayerColor;
  roomId: string;
  socket: Socket | null;
  isOpponentConnected: boolean;
  playerName: string;
  opponentName: string;

  // UI
  isSoundMuted: boolean;
  gameStatus: GameStatus;
  winner: PlayerColor | 'draw' | null;

  // Clocks
  whiteTime: number;
  blackTime: number;
  isTimerRunning: boolean;

  // Reactions
  reactions: Reaction[];

  // Pawn promotion
  pendingPromotion: { from: Square; to: Square } | null;

  // Actions
  initGame: (mode?: GameMode, customRoomId?: string) => void;
  selectSquare: (square: Square | null) => void;
  setHoveredSquare: (square: Square | null) => void;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  setPendingPromotion: (promo: { from: Square; to: Square } | null) => void;
  toggleSound: () => void;
  sendReaction: (emoji: string) => void;
  setGameMode: (mode: GameMode) => void;
  requestRematch: () => void;
  resignGame: () => void;
  updateClocks: () => void;
  resetGame: () => void;
  expireReactions: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChessStore = create<ChessStore>((set, get) => ({
  chess: new Chess(),
  fen: new Chess().fen(),
  turn: 'w',
  selectedSquare: null,
  hoveredSquare: null,
  legalMoves: [],
  lastMove: null,
  history: [],

  gameMode: 'multiplayer',
  myColor: 'w',
  roomId: '',
  socket: null,
  isOpponentConnected: false,
  playerName: 'Criador',
  opponentName: 'Oponente',

  isSoundMuted: false,
  gameStatus: 'waiting',
  winner: null,

  whiteTime: DEFAULT_TIME,
  blackTime: DEFAULT_TIME,
  isTimerRunning: false,

  reactions: [],
  pendingPromotion: null,

  // ── initGame ────────────────────────────────────────────────────────────────
  initGame: (mode = 'multiplayer', customRoomId) => {
    // Tear down any existing socket
    const { socket: prev } = get();
    if (prev) {
      prev.removeAllListeners();
      prev.disconnect();
    }

    const chess = new Chess();
    const targetRoomId = customRoomId ?? generateRoomId();

    const baseState = {
      chess,
      fen: chess.fen(),
      turn: 'w' as PlayerColor,
      selectedSquare: null as Square | null,
      legalMoves: [] as Square[],
      lastMove: null,
      history: [] as MoveLog[],
      gameMode: mode,
      roomId: targetRoomId,
      gameStatus: (mode === 'multiplayer' ? 'waiting' : 'playing') as GameStatus,
      winner: null,
      whiteTime: DEFAULT_TIME,
      blackTime: DEFAULT_TIME,
      isOpponentConnected: false,
      reactions: [] as Reaction[],
    };

    // pass-and-play — no socket needed
    if (mode === 'pass-and-play') {
      set({ ...baseState, socket: null, myColor: 'w', isTimerRunning: true });
      return;
    }

    // multiplayer — create socket
    const socket = io({ autoConnect: true, reconnection: true });
    set({ ...baseState, socket, isTimerRunning: false });

    socket.emit('join-room', { roomId: targetRoomId });

    socket.on('room-joined', ({ myColor, roomState }: { myColor: PlayerColor; roomState: { whiteTime: number; blackTime: number } }) => {
      set({
        myColor,
        whiteTime: roomState.whiteTime ?? DEFAULT_TIME,
        blackTime: roomState.blackTime ?? DEFAULT_TIME,
      });
    });

    socket.on('room-updated', (roomState: { players?: { w?: { name: string }; b?: { name: string } } }) => {
      const hasBlack = !!roomState.players?.b;
      const hasWhite = !!roomState.players?.w;
      const isReady = hasBlack && hasWhite;
      const { myColor } = get();
      set({
        isOpponentConnected: isReady,
        gameStatus: isReady ? 'playing' : 'waiting',
        isTimerRunning: isReady,
        opponentName: myColor === 'w'
          ? (roomState.players?.b?.name ?? 'Convidado')
          : (roomState.players?.w?.name ?? 'Criador'),
      });
    });

    // Server is now authoritative — trust the FEN that comes from move-made
    socket.on('move-made', ({
      fen, turn, lastMove, inCheck, endStatus, winner
    }: {
      fen: string;
      turn: PlayerColor;
      lastMove: { from: Square; to: Square };
      inCheck: boolean;
      endStatus: GameStatus | null;
      winner: PlayerColor | 'draw' | null;
    }) => {
      const { chess } = get();
      chess.load(fen);

      set({
        fen,
        turn,
        lastMove,
        selectedSquare: null,
        legalMoves: [],
      });

      if (endStatus) {
        set({ gameStatus: endStatus, winner, isTimerRunning: false });
        sound.playCheckmateSound();
        if (winner === get().myColor) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
      } else if (inCheck) {
        sound.playCheckSound();
      } else {
        sound.playMoveSound();
      }
    });

    socket.on('reaction-received', (reaction: Reaction) => {
      set((state) => ({
        reactions: [...state.reactions.slice(-MAX_REACTIONS), { ...reaction, createdAt: Date.now() }],
      }));
      sound.playReactionSound();
    });

    socket.on('rematch-started', () => {
      const newChess = new Chess();
      set({
        chess: newChess,
        fen: newChess.fen(),
        turn: 'w',
        selectedSquare: null,
        legalMoves: [],
        lastMove: null,
        history: [],
        gameStatus: 'playing',
        winner: null,
        whiteTime: DEFAULT_TIME,
        blackTime: DEFAULT_TIME,
        isTimerRunning: true,
      });
    });

    socket.on('game-resigned', ({ winner }: { winner: PlayerColor }) => {
      set({ gameStatus: 'checkmate', winner, isTimerRunning: false });
      sound.playCheckmateSound();
    });

    socket.on('player-disconnected', () => {
      set({ isOpponentConnected: false, gameStatus: 'waiting', isTimerRunning: false });
    });
  },

  // ── selectSquare ────────────────────────────────────────────────────────────
  selectSquare: (square) => {
    const { chess, turn, myColor, gameMode, gameStatus, selectedSquare } = get();
    if (gameStatus !== 'playing') return;
    if (gameMode === 'multiplayer' && turn !== myColor) return;

    if (!square) {
      set({ selectedSquare: null, legalMoves: [] });
      return;
    }

    if (selectedSquare) {
      if (selectedSquare === square) {
        set({ selectedSquare: null, legalMoves: [] });
        return;
      }

      const moves = chess.moves({ square: selectedSquare, verbose: true });
      const target = moves.find((m) => m.to === square);
      if (target) {
        if (target.promotion) {
          set({ pendingPromotion: { from: selectedSquare, to: square } });
        } else {
          get().makeMove(selectedSquare, square);
        }
        return;
      }
    }

    const piece = chess.get(square);
    if (piece && piece.color === turn) {
      const legalMoves = chess
        .moves({ square, verbose: true })
        .map((m) => m.to as Square);
      set({ selectedSquare: square, legalMoves });
      sound.playSelectSound();
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  // ── setHoveredSquare ─────────────────────────────────────────────────────────
  setHoveredSquare: (hoveredSquare) => set({ hoveredSquare }),

  // ── makeMove ─────────────────────────────────────────────────────────────────
  makeMove: (from, to, promotion = 'q') => {
    const { chess, gameMode, roomId, socket, myColor } = get();

    try {
      const pieceOnTarget = chess.get(to);
      const move = chess.move({ from, to, promotion });
      if (!move) return false;

      const newFen  = chess.fen();
      const newTurn = chess.turn() as PlayerColor;

      // Sound feedback
      if (chess.inCheck()) {
        sound.playCheckSound();
      } else if (pieceOnTarget || move.captured) {
        sound.playCaptureSound();
      } else {
        sound.playMoveSound();
      }

      // End-of-game detection — single source via resolveGameEnd
      const end = resolveGameEnd(chess, myColor);

      const moveRecord: MoveLog = {
        from, to,
        piece: move.piece,
        captured: move.captured,
        san: move.san,
        fen: newFen,
        timestamp: Date.now(),
        player: move.color as PlayerColor,
      };

      set((state) => ({
        fen: newFen,
        turn: newTurn,
        selectedSquare: null,
        legalMoves: [],
        lastMove: { from, to },
        history: [...state.history, moveRecord],
        gameStatus: end ? end.status : 'playing',
        winner: end ? end.winner : null,
        ...(end ? { isTimerRunning: false } : {}),
      }));

      if (end) {
        sound.playCheckmateSound();
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }

      if (gameMode === 'multiplayer' && socket) {
        socket.emit('make-move', { roomId, from, to, promotion });
      }

      return true;
    } catch {
      return false;
    }
  },

  // ── setPendingPromotion ──────────────────────────────────────────────────────
  setPendingPromotion: (pendingPromotion) => set({ pendingPromotion }),

  // ── toggleSound ──────────────────────────────────────────────────────────────
  toggleSound: () => {
    const isMuted = !get().isSoundMuted;
    sound.muted = isMuted;
    set({ isSoundMuted: isMuted });
  },

  // ── sendReaction ─────────────────────────────────────────────────────────────
  sendReaction: (emoji) => {
    const { socket, roomId, myColor } = get();
    const newReaction: Reaction = {
      id: crypto.randomUUID(),
      emoji,
      senderColor: myColor,
      createdAt: Date.now(),
    };
    set((state) => ({
      reactions: [...state.reactions.slice(-MAX_REACTIONS), newReaction],
    }));
    sound.playReactionSound();
    socket?.emit('send-reaction', { roomId, emoji, senderColor: myColor });
  },

  // ── expireReactions ──────────────────────────────────────────────────────────
  expireReactions: () => {
    const cutoff = Date.now() - REACTION_TTL_MS;
    set((state) => ({
      reactions: state.reactions.filter((r) => r.createdAt > cutoff),
    }));
  },

  // ── setGameMode ──────────────────────────────────────────────────────────────
  setGameMode: (mode) => get().initGame(mode),

  // ── requestRematch ───────────────────────────────────────────────────────────
  requestRematch: () => {
    const { socket, roomId, gameMode } = get();
    if (gameMode === 'multiplayer' && socket) {
      socket.emit('request-rematch', { roomId });
    } else {
      get().resetGame();
    }
  },

  // ── resignGame ───────────────────────────────────────────────────────────────
  resignGame: () => {
    const { socket, roomId, myColor, gameMode } = get();
    const winner: PlayerColor = myColor === 'w' ? 'b' : 'w';
    set({ gameStatus: 'checkmate', winner, isTimerRunning: false });
    sound.playCheckmateSound();
    if (gameMode === 'multiplayer' && socket) {
      socket.emit('resign', { roomId, resigningColor: myColor });
    }
  },

  // ── updateClocks ─────────────────────────────────────────────────────────────
  updateClocks: () => {
    const { isTimerRunning, turn, whiteTime, blackTime, gameStatus } = get();
    if (!isTimerRunning || gameStatus !== 'playing') return;

    if (turn === 'w') {
      if (whiteTime <= 1) {
        set({ gameStatus: 'timeout', winner: 'b', isTimerRunning: false });
        sound.playCheckmateSound();
      } else {
        set({ whiteTime: whiteTime - 1 });
      }
    } else {
      if (blackTime <= 1) {
        set({ gameStatus: 'timeout', winner: 'w', isTimerRunning: false });
        sound.playCheckmateSound();
      } else {
        set({ blackTime: blackTime - 1 });
      }
    }
  },

  // ── resetGame ────────────────────────────────────────────────────────────────
  resetGame: () => {
    const newChess = new Chess();
    set({
      chess: newChess,
      fen: newChess.fen(),
      turn: 'w',
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      history: [],
      gameStatus: 'playing',
      winner: null,
      whiteTime: DEFAULT_TIME,
      blackTime: DEFAULT_TIME,
      isTimerRunning: true,
    });
  },
}));
