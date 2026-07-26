export type GameMode = 'multiplayer' | 'pass-and-play';
export type PlayerColor = 'w' | 'b';
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type GameStatus = 'waiting' | 'playing' | 'check' | 'checkmate' | 'draw' | 'stalemate' | 'timeout';
export type ThemeMode = 'pro-light';

export interface MoveLog {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  san: string;
  fen: string;
  timestamp: number;
  player: PlayerColor;
}

export interface PlayerInfo {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
}

export interface Reaction {
  id: number;
  emoji: string;
  senderColor: PlayerColor;
}

