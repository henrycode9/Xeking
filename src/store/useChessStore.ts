import { create } from 'zustand';
import { Chess, Square } from 'chess.js';
import { io, Socket } from 'socket.io-client';
import { GameMode, PlayerColor, GameStatus, ThemeMode, MoveLog, Reaction } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ChessStore {
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
  
  // UI & Theme
  themeMode: ThemeMode;
  isSoundMuted: boolean;
  gameStatus: GameStatus;
  winner: PlayerColor | 'draw' | null;
  
  // Clocks
  timeLimit: number; // in seconds (e.g. 600 = 10 mins)
  whiteTime: number;
  blackTime: number;
  isTimerRunning: boolean;
  
  // Reactions
  reactions: Reaction[];

  // Pawn Promotion state
  pendingPromotion: { from: Square; to: Square } | null;
  setPendingPromotion: (promo: { from: Square; to: Square } | null) => void;
  
  // Actions
  initGame: (mode?: GameMode, customRoomId?: string) => void;
  selectSquare: (square: Square | null) => void;
  setHoveredSquare: (square: Square | null) => void;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  setThemeMode: (theme: ThemeMode) => void;
  toggleSound: () => void;
  sendReaction: (emoji: string) => void;
  setGameMode: (mode: GameMode) => void;
  requestRematch: () => void;
  resignGame: () => void;
  updateClocks: () => void;
  resetGame: () => void;
}

const generateRoomId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export const useChessStore = create<ChessStore>((set, get) => ({
  chess: new Chess(),
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
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
  
  themeMode: 'pro-light',
  isSoundMuted: false,
  gameStatus: 'waiting',
  winner: null,
  
  timeLimit: 600,
  whiteTime: 600,
  blackTime: 600,
  isTimerRunning: false,
  
  reactions: [],
  pendingPromotion: null,
  setPendingPromotion: (pendingPromotion) => set({ pendingPromotion }),

  initGame: (mode = 'multiplayer', customRoomId) => {
    const { socket: existingSocket } = get();
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const chess = new Chess();
    const targetRoomId = customRoomId || generateRoomId();

    const socket = io({
      autoConnect: true,
      reconnection: true
    });

    set({
      chess,
      fen: chess.fen(),
      turn: 'w',
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      history: [],
      gameMode: mode,
      roomId: targetRoomId,
      socket,
      gameStatus: mode === 'multiplayer' ? 'waiting' : 'playing',
      winner: null,
      whiteTime: 600,
      blackTime: 600,
      isTimerRunning: mode !== 'multiplayer'
    });

    if (mode === 'multiplayer') {
      socket.emit('join-room', { roomId: targetRoomId });

      socket.on('room-joined', ({ myColor, roomState }: any) => {
        set({
          myColor,
          whiteTime: roomState.whiteTime || 600,
          blackTime: roomState.blackTime || 600
        });
      });

      socket.on('room-updated', (roomState: any) => {
        const hasBlack = !!roomState.players?.b;
        const hasWhite = !!roomState.players?.w;
        const isReady = hasBlack && hasWhite;

        set({
          isOpponentConnected: isReady,
          gameStatus: isReady ? 'playing' : 'waiting',
          isTimerRunning: isReady,
          opponentName: get().myColor === 'w' 
            ? (roomState.players?.b?.name || 'Convidado')
            : (roomState.players?.w?.name || 'Criador')
        });
      });

      socket.on('move-made', ({ from, to, fen, san, turn, history, lastMove }: any) => {
        const { chess, myColor } = get();
        chess.load(fen);

        set({
          fen,
          turn,
          lastMove,
          selectedSquare: null,
          legalMoves: []
        });

        // Play appropriate sound
        if (chess.inCheck()) {
          sound.playCheckSound();
        } else if (lastMove) {
          sound.playMoveSound();
        }

        // Check for game end
        if (chess.isCheckmate()) {
          const winningColor = chess.turn() === 'w' ? 'b' : 'w';
          set({ gameStatus: 'checkmate', winner: winningColor, isTimerRunning: false });
          sound.playCheckmateSound();
          if (winningColor === myColor) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
        } else if (chess.isDraw() || chess.isStalemate()) {
          set({ gameStatus: 'draw', winner: 'draw', isTimerRunning: false });
        }
      });

      socket.on('reaction-received', (reaction: Reaction) => {
        set((state) => ({
          reactions: [...state.reactions.slice(-10), reaction]
        }));
        sound.playReactionSound();
      });

      socket.on('rematch-started', (roomState: any) => {
        const chess = new Chess();
        set({
          chess,
          fen: chess.fen(),
          turn: 'w',
          selectedSquare: null,
          legalMoves: [],
          lastMove: null,
          history: [],
          gameStatus: 'playing',
          winner: null,
          whiteTime: 600,
          blackTime: 600,
          isTimerRunning: true
        });
      });

      socket.on('game-resigned', ({ winner }: any) => {
        set({ gameStatus: 'checkmate', winner, isTimerRunning: false });
        sound.playCheckmateSound();
      });

      socket.on('player-disconnected', () => {
        set({ isOpponentConnected: false, gameStatus: 'waiting', isTimerRunning: false });
      });
    }
  },

  selectSquare: (square: Square | null) => {
    const { chess, turn, myColor, gameMode, gameStatus, selectedSquare } = get();

    if (gameStatus !== 'playing') return;

    // Check if it's my turn in multiplayer
    if (gameMode === 'multiplayer' && turn !== myColor) return;

    if (!square) {
      set({ selectedSquare: null, legalMoves: [] });
      return;
    }

    // If a square is already selected and clicked on a target square, attempt move
    if (selectedSquare) {
      if (selectedSquare === square) {
        set({ selectedSquare: null, legalMoves: [] });
        return;
      }

      const moves = chess.moves({ square: selectedSquare, verbose: true });
      const targetMove = moves.find((m) => m.to === square);

      if (targetMove) {
        if (targetMove.promotion) {
          set({ pendingPromotion: { from: selectedSquare, to: square } });
        } else {
          get().makeMove(selectedSquare, square);
        }
        return;
      }
    }

    // Select piece if it belongs to current player turn
    const piece = chess.get(square);
    if (piece && piece.color === turn) {
      const moves = chess.moves({ square, verbose: true });
      const legalMoves = moves.map((m) => m.to as Square);
      set({ selectedSquare: square, legalMoves });
      sound.playSelectSound();
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  setHoveredSquare: (square: Square | null) => {
    set({ hoveredSquare: square });
  },

  makeMove: (from: Square, to: Square, promotion = 'q') => {
    const { chess, gameMode, roomId, socket, myColor } = get();

    try {
      const pieceOnTarget = chess.get(to);
      const move = chess.move({ from, to, promotion });

      if (!move) return false;

      const newFen = chess.fen();
      const newTurn = chess.turn() as PlayerColor;

      // Play sound
      if (chess.inCheck()) {
        sound.playCheckSound();
      } else if (pieceOnTarget || move.captured) {
        sound.playCaptureSound();
      } else {
        sound.playMoveSound();
      }

      // Check end game
      let newStatus: GameStatus = 'playing';
      let winner: PlayerColor | 'draw' | null = null;

      if (chess.isCheckmate()) {
        newStatus = 'checkmate';
        winner = myColor;
        sound.playCheckmateSound();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else if (chess.isDraw() || chess.isStalemate()) {
        newStatus = 'draw';
        winner = 'draw';
      }

      const moveRecord: MoveLog = {
        from,
        to,
        piece: move.piece,
        captured: move.captured,
        san: move.san,
        fen: newFen,
        timestamp: Date.now(),
        player: move.color as PlayerColor
      };

      set((state) => ({
        fen: newFen,
        turn: newTurn,
        selectedSquare: null,
        legalMoves: [],
        lastMove: { from, to },
        history: [...state.history, moveRecord],
        gameStatus: newStatus,
        winner
      }));

      // If multiplayer, emit to socket
      if (gameMode === 'multiplayer' && socket) {
        socket.emit('make-move', {
          roomId,
          from,
          to,
          promotion,
          fen: newFen,
          san: move.san,
          moveObj: move
        });
      }

      return true;
    } catch (e) {
      console.error('Invalid move:', e);
      return false;
    }
  },

  setThemeMode: (themeMode) => set({ themeMode }),
  toggleSound: () => {
    const isMuted = !get().isSoundMuted;
    sound.muted = isMuted;
    set({ isSoundMuted: isMuted });
  },

  sendReaction: (emoji) => {
    const { socket, roomId, myColor } = get();
    const newReaction: Reaction = { id: Math.random(), emoji, senderColor: myColor };

    set((state) => ({
      reactions: [...state.reactions.slice(-10), newReaction]
    }));
    sound.playReactionSound();

    if (socket) {
      socket.emit('send-reaction', { roomId, emoji, senderColor: myColor });
    }
  },

  setGameMode: (mode) => {
    get().initGame(mode);
  },

  requestRematch: () => {
    const { socket, roomId, gameMode } = get();
    if (gameMode === 'multiplayer' && socket) {
      socket.emit('request-rematch', { roomId });
    } else {
      get().resetGame();
    }
  },

  resignGame: () => {
    const { socket, roomId, myColor, gameMode } = get();
    const winner = myColor === 'w' ? 'b' : 'w';
    set({
      gameStatus: 'checkmate',
      winner,
      isTimerRunning: false
    });
    sound.playCheckmateSound();

    if (gameMode === 'multiplayer' && socket) {
      socket.emit('resign', { roomId, resigningColor: myColor });
    }
  },

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

  resetGame: () => {
    const chess = new Chess();
    set({
      chess,
      fen: chess.fen(),
      turn: 'w',
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      history: [],
      gameStatus: 'playing',
      winner: null,
      whiteTime: 600,
      blackTime: 600,
      isTimerRunning: true
    });
  }
}));

