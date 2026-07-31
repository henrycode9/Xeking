import React from 'react';
import { PlayerColor, PieceType } from '../types';

interface ChessPieceSVGProps {
  type: PieceType;
  color: PlayerColor;
  className?: string;
}

/**
 * Master-Grade Sculpted Vector Chess Piece Set
 * Pristine legibility, elegant proportions, crisp outlines, zero noise.
 */
export const ChessPieceSVG: React.FC<ChessPieceSVGProps> = ({ type, color, className = "w-full h-full" }) => {
  const isWhite = color === 'w';

  // Master Contrast Palette (Pure Crisp White & Deep Rich Charcoal)
  const fill = isWhite ? "#ffffff" : "#18181b";
  const stroke = isWhite ? "#18181b" : "#ffffff";
  const detail = isWhite ? "#18181b" : "#ffffff";

  const renderPaths = () => {
    switch (type) {
      case 'p': // Master Pawn
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            {/* Double Base */}
            <path d="M 11 40.5 L 34 40.5 L 32.5 37 L 12.5 37 Z" />
            <path d="M 12.5 37 C 14 34.5, 31 34.5, 32.5 37 Z" />
            {/* Sculpted Waist Column */}
            <path d="M 14.5 34.5 C 16.5 27, 28.5 27, 30.5 34.5 Z" />
            {/* Collar Disk */}
            <path d="M 16.5 20.5 L 28.5 20.5 L 27.5 18 L 17.5 18 Z" />
            {/* Spherical Head */}
            <circle cx="22.5" cy="12.5" r="5.5" fill={fill} stroke={stroke} strokeWidth="1.6" />
          </g>
        );

      case 'r': // Master Rook
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5, 31 34.5, 32.5 37 Z" />
            {/* Main Column */}
            <path d="M 14 34.5 L 15.5 17 L 29.5 17 L 31 34.5 Z" />
            <line x1="13.5" y1="23" x2="31.5" y2="23" stroke={detail} strokeWidth="1.3" />
            {/* Battlements Crown */}
            <path d="M 13 17 L 13 9.5 L 17 9.5 L 17 12.5 L 21 12.5 L 21 9.5 L 24 9.5 L 24 12.5 L 28 12.5 L 28 9.5 L 32 9.5 L 32 17 Z" />
          </g>
        );

      case 'n': // Master Knight (Majestic, beautifully sculpted horse head)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5, 31 34.5, 32.5 37 Z" />
            {/* Horse Body, Neck & Ears */}
            <path d="M 13.5 34.5 C 13.5 29, 14.5 23.5, 16.5 19 C 17.5 16, 16.5 12.5, 17.5 10 C 19 7.5, 23 7, 27 7.5 C 28.5 8, 29 10, 29.5 13.5 C 30.5 18.5, 31.5 26.5, 31 34.5 Z" />
            {/* Snout, Nostril & Muzzle Line */}
            <path d="M 27 7.5 C 25 8.5, 22.5 10.5, 20.5 12 C 18.5 13.5, 17.5 15.5, 19.5 17.5 C 22 19, 25 18.5, 27.5 16.5 C 29 15, 29.5 13.5, 29.5 13.5 Z" />
            {/* Eye */}
            <circle cx="24" cy="11.5" r="1.3" fill={detail} stroke="none" />
            {/* Mane Detail */}
            <path d="M 18.5 12 C 20.5 14, 22.5 15.5, 24.5 16" stroke={detail} strokeWidth="1.2" fill="none" />
          </g>
        );

      case 'b': // Master Bishop
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5, 31 34.5, 32.5 37 Z" />
            {/* Waist Column */}
            <path d="M 14 34.5 C 15.5 28, 29.5 28, 31 34.5 Z" />
            <line x1="14" y1="23" x2="31" y2="23" stroke={detail} strokeWidth="1.3" />
            {/* Mitre Head */}
            <path d="M 22.5 9 C 26.5 9, 29 12.5, 29 17 C 29 22, 26 24, 22.5 24 C 19 24, 16 22, 16 17 C 16 12.5, 18.5 9, 22.5 9 Z" />
            {/* Top Ball */}
            <circle cx="22.5" cy="6.5" r="2" fill={fill} stroke={stroke} strokeWidth="1.6" />
            {/* Slash */}
            <path d="M 20 14 L 25 18" stroke={detail} strokeWidth="1.4" />
          </g>
        );

      case 'q': // Master Queen
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5, 31 34.5, 32.5 37 Z" />
            {/* Waist Column */}
            <path d="M 13.5 34.5 C 15 28, 30 28, 31.5 34.5 Z" />
            <line x1="13.5" y1="23" x2="31.5" y2="23" stroke={detail} strokeWidth="1.3" />
            {/* Crown Spikes */}
            <path d="M 12 23 L 8.5 11.5 L 15.5 17.5 L 22.5 10 L 29.5 17.5 L 36.5 11.5 L 33 23 Z" />
            {/* Pearls on tips */}
            <circle cx="8.5" cy="9.5" r="1.5" />
            <circle cx="15.5" cy="15.5" r="1.5" />
            <circle cx="22.5" cy="8" r="1.8" />
            <circle cx="29.5" cy="15.5" r="1.5" />
            <circle cx="36.5" cy="9.5" r="1.5" />
          </g>
        );

      case 'k': // Master King
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            {/* Cross */}
            <path d="M 22.5 10.5 L 22.5 3.5 M 18.5 7 L 26.5 7" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 22.5 10.5 L 22.5 3.5 M 18.5 7 L 26.5 7" stroke={fill} strokeWidth="1" strokeLinecap="round" />
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5, 31 34.5, 32.5 37 Z" />
            {/* Waist Column */}
            <path d="M 13.5 34.5 C 15 28, 30 28, 31.5 34.5 Z" />
            <line x1="13.5" y1="23" x2="31.5" y2="23" stroke={detail} strokeWidth="1.3" />
            {/* Dome Crown */}
            <path d="M 12.5 23 C 12.5 15.5, 16.5 11, 22.5 11 C 28.5 11, 32.5 15.5, 32.5 23 Z" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 45 45"
      className={`${className} select-none pointer-events-none filter ${
        isWhite ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)]' : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
      }`}
    >
      {renderPaths()}
    </svg>
  );
};
