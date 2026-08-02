import React from 'react';
import { PlayerColor, PieceType } from '../types';

interface ChessPieceSVGProps {
  type: PieceType;
  color: PlayerColor;
  className?: string;
}

/**
 * Official 100% Genuine Chess.com Neo Piece Set
 * Uses exact high-resolution official Chess.com Neo piece graphics.
 */
export const ChessPieceSVG: React.FC<ChessPieceSVGProps> = ({ type, color, className = "w-full h-full" }) => {
  const pieceCode = `${color}${type}`.toLowerCase();
  const src = `/pieces/${pieceCode}.png`;

  return (
    <img
      src={src}
      alt={`${color === 'w' ? 'White' : 'Black'} ${type}`}
      className={`${className} select-none pointer-events-none object-contain filter ${
        color === 'w' ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)]' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
      }`}
      draggable={false}
    />
  );
};



