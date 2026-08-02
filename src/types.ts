export type GameMode    = 'multiplayer';
export type PlayerColor = 'w' | 'b';
export type PieceType   = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type GameStatus  = 'waiting' | 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'timeout';

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

