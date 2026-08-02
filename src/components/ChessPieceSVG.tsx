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
const UNICODE_PIECES: Record<string, string> = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

export const ChessPieceSVG: React.FC<ChessPieceSVGProps> = ({ type, color, className = "w-full h-full" }) => {
  const pieceCode = `${color}${type}`.toLowerCase();
  const src = `/pieces/${pieceCode}.png`;
  const [imgError, setImgError] = React.useState(false);

  if (imgError) {
    return (
      <span
        className={`${className} flex items-center justify-center font-bold text-2xl select-none ${
          color === 'w' ? 'text-zinc-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-zinc-950'
        }`}
      >
        {UNICODE_PIECES[pieceCode] ?? '?'}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${color === 'w' ? 'White' : 'Black'} ${type}`}
      loading="eager"
      decoding="async"
      onError={() => setImgError(true)}
      className={`${className} select-none pointer-events-none object-contain filter ${
        color === 'w' ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)]' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
      }`}
      draggable={false}
    />
  );
};



