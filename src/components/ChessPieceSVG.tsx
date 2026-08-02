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

      case 'n': // Canonical Knight (Classic Cburnett Staunton Horse)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Main Horse Head & Body Silhouette */}
            <path d="M 22 10 C 22.5 10 23 10.5 23 11.5 C 23 11.5 23 12 22.5 12.5 C 22.5 12.5 24.5 12 25.5 13.5 C 26.5 15 26.5 17 26 19 C 27 18 28.5 17 29 17 C 29.5 17 30 17.5 30 18 C 30 18.5 29 19.5 28 20.5 C 28.5 21.5 29 22.5 29 24 C 29 26.5 27.5 29 26.5 31 C 28 32 30 32 32.5 32 C 32.5 32 33 36 33 36 L 12 36 C 12 36 12.5 32 12.5 32 C 15 32 17 32 18.5 31 C 17.5 29 16 26.5 16 24 C 16 22.5 16.5 21.5 17 20.5 C 16 19.5 15 18.5 15 18 C 15 17.5 15.5 17 16 17 C 16.5 17 18 18 19 19 C 18.5 17 18.5 15 19.5 13.5 C 20.5 12 22.5 12.5 22.5 12.5 C 22 12 22 11.5 22 10 Z" />

            {/* Base Step */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 36 L 12 36 Z" />
            <path d="M 12 36 C 14 34 31 34 33 36 Z" />

            {/* Eye Dot */}
            <circle cx="20" cy="13.5" r="1.3" fill={detail} stroke="none" />
            {/* Nostril Dot */}
            <circle cx="15.5" cy="17.5" r="1" fill={detail} stroke="none" />
            {/* Mane & Throat Accent Lines */}
            <path d="M 24.5 15 C 26 17.5 26 20.5 24.5 23" stroke={detail} strokeWidth="1.2" fill="none" />
            <path d="M 17.5 21 C 18.5 23 18.5 25.5 17.5 27.5" stroke={detail} strokeWidth="1.2" fill="none" />
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


