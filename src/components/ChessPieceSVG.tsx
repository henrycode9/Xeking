import React from 'react';
import { PlayerColor, PieceType } from '../types';

interface ChessPieceSVGProps {
  type: PieceType;
  color: PlayerColor;
  className?: string;
}

/**
 * Official Staunton / Cburnett Vector Chess Piece Set (Chess.com & Lichess standard)
 * Preserves high-contrast black & white color palette with crisp vector geometry.
 */
export const ChessPieceSVG: React.FC<ChessPieceSVGProps> = ({ type, color, className = "w-full h-full" }) => {
  const isWhite = color === 'w';

  // Master Contrast Palette (Pure Crisp White & Deep Rich Charcoal)
  const fill = isWhite ? "#ffffff" : "#18181b";
  const stroke = isWhite ? "#18181b" : "#ffffff";
  const detail = isWhite ? "#18181b" : "#ffffff";

  const renderPaths = () => {
    switch (type) {
      case 'p': // Canonical Pawn
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 22.5 9 C 19.8 9 17.6 11.2 17.6 13.9 C 17.6 14.8 17.9 15.6 18.4 16.3 C 16.9 17.4 15.5 19.5 15.5 21.9 C 15.5 24 16.5 25.8 17.9 27 C 15 28.1 11.5 32 11.5 36.5 L 33.5 36.5 C 33.5 32 30 28.1 27.1 27 C 28.5 25.8 29.5 24 29.5 21.9 C 29.5 19.4 28.1 17.4 26.6 16.3 C 27.1 15.6 27.4 14.8 27.4 13.9 C 27.4 11.2 25.2 9 22.5 9 Z" />
            <path d="M 10.5 40.5 L 34.5 40.5 L 33.5 36.5 L 11.5 36.5 Z" />
            <path d="M 15.5 22 L 29.5 22" stroke={detail} strokeWidth="1.3" />
          </g>
        );

      case 'r': // Canonical Rook
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 12 36.5 L 12 13.5 L 9 13.5 L 9 9 L 13.5 9 L 13.5 11.5 L 18 11.5 L 18 9 L 22.5 9 L 22.5 11.5 L 27 11.5 L 27 9 L 31.5 9 L 31.5 11.5 L 36 11.5 L 36 9 L 36 13.5 L 33 13.5 L 33 36.5 Z" />
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 36.5 L 12 36.5 Z" />
            <path d="M 9 13.5 L 36 13.5" stroke={detail} strokeWidth="1.3" />
          </g>
        );

      case 'n': // Sleek Equestrian Horse Knight (Long Slender Face, Sharp Pointed Ears, Arched Neck)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Horse Silhouette (Long Horse Snout, Sharp Pointed Ears, Arched Neck) */}
            <path d="M 13.5 36.5
                     C 15.5 31 16.5 27 17 24
                     C 15 23.5 13 23 11.5 22.5
                     C 10.5 22 10.5 20.5 11 19.5
                     C 12.5 17.5 15.5 14.5 18 11.5
                     C 18 9 19.5 7 21 6.5
                     C 22.5 6 23.5 7.5 24 9
                     C 25 7.5 26.5 7 28 7.5
                     C 29.5 8.5 29.5 11 29 14.5
                     C 31 18.5 32.5 24.5 32 36.5 Z" />

            {/* Base Step */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 36.5 L 12 36.5 Z" />
            <path d="M 12 36.5 C 14 34.5 31 34.5 33 36.5 Z" />

            {/* Eye */}
            <circle cx="19.5" cy="12.5" r="1.3" fill={detail} stroke="none" />

            {/* Nostril */}
            <circle cx="13" cy="18.5" r="0.9" fill={detail} stroke="none" />

            {/* Mouth / Snout Line */}
            <path d="M 11.5 20 C 13 20.8 15 20.8 16 20.2" stroke={detail} strokeWidth="1.2" fill="none" />

            {/* Mane Accent Waves */}
            <path d="M 24 12 C 25.5 15 25.5 18 23.5 21" stroke={detail} strokeWidth="1.2" fill="none" />
            <path d="M 26.5 17.5 C 28 20.5 28 23.5 26 26.5" stroke={detail} strokeWidth="1.2" fill="none" />

            {/* Jawline Contour */}
            <path d="M 18.5 19 C 20 17 21 15 21.5 13" stroke={detail} strokeWidth="1.2" fill="none" />
          </g>
        );

      case 'b': // Canonical Bishop
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 9 36 C 9 36 9 28 12 26 C 10 24 9 21.5 9 18.5 C 9 13.5 13.5 9 22.5 9 C 31.5 9 36 13.5 36 18.5 C 36 21.5 35 24 33 26 C 36 28 36 36 36 36 Z" />
            <circle cx="22.5" cy="6" r="2.2" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M 17.5 15.5 L 27.5 20.5" stroke={detail} strokeWidth="1.5" />
            <path d="M 12 26 L 33 26" stroke={detail} strokeWidth="1.3" />
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 36 L 12 36 Z" />
          </g>
        );

      case 'q': // Canonical Queen
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 9 26 C 9 28 11.5 32 11.5 36 L 33.5 36 C 33.5 32 36 28 36 26 C 36 26 36 20 33 19 C 33 19 33 14 36 11.5 L 29.5 15.5 L 22.5 7.5 L 15.5 15.5 L 9 11.5 C 12 14 12 19 12 19 C 9 20 9 26 9 26 Z" />
            <path d="M 12 26 C 12 26 18 28.5 22.5 28.5 C 27 28.5 33 26 33 26" stroke={detail} strokeWidth="1.3" />
            <circle cx="9" cy="10" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="15.5" cy="14" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="22.5" cy="6" r="1.8" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="29.5" cy="14" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="36" cy="10" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <path d="M 10.5 40.5 L 34.5 40.5 L 33.5 36 L 11.5 36 Z" />
          </g>
        );

      case 'k': // Canonical King
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Royal Cross */}
            <line x1="22.5" y1="2" x2="22.5" y2="8" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="19.5" y1="4.5" x2="25.5" y2="4.5" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="22.5" y1="2" x2="22.5" y2="8" stroke={fill} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="19.5" y1="4.5" x2="25.5" y2="4.5" stroke={fill} strokeWidth="1.2" strokeLinecap="round" />

            <path d="M 22.5 11.5 C 20 8.5 13.5 9 13.5 16 C 13.5 20.5 16 23.5 16 26 C 12 28 11.5 36 11.5 36 L 33.5 36 C 33.5 36 33 28 29 26 C 29 23.5 31.5 20.5 31.5 16 C 31.5 9 25 8.5 22.5 11.5 Z" />
            <path d="M 16 26 C 16 26 20 27.5 22.5 27.5 C 25 27.5 29 26 29 26" stroke={detail} strokeWidth="1.3" />
            <path d="M 10.5 40.5 L 34.5 40.5 L 33.5 36 L 11.5 36 Z" />
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


