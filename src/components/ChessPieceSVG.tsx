import React from 'react';
import { PlayerColor, PieceType } from '../types';

interface ChessPieceSVGProps {
  type: PieceType;
  color: PlayerColor;
  className?: string;
}

/**
 * Chess.com (Neo/Staunton Style) Master Vector Chess Piece Set
 * Pristine legibility, iconic left-facing knight, elegant proportions, crisp outlines.
 * Preserves current high-contrast black & white color palette.
 */
export const ChessPieceSVG: React.FC<ChessPieceSVGProps> = ({ type, color, className = "w-full h-full" }) => {
  const isWhite = color === 'w';

  // Master Contrast Palette (Pure Crisp White & Deep Rich Charcoal)
  const fill = isWhite ? "#ffffff" : "#18181b";
  const stroke = isWhite ? "#18181b" : "#ffffff";
  const detail = isWhite ? "#18181b" : "#ffffff";

  const renderPaths = () => {
    switch (type) {
      case 'p': // Master Pawn (Chess.com / Staunton Neo Style)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 11.5 40.5 L 33.5 40.5 L 32.5 37 L 12.5 37 Z" />
            <path d="M 12.5 37 C 14 34.5 31 34.5 32.5 37 Z" />
            {/* Sculpted Waist Column */}
            <path d="M 15 34.5 C 16.5 26.5 28.5 26.5 30 34.5 Z" />
            {/* Collar Ring */}
            <path d="M 16.5 21.5 C 16.5 19.5 28.5 19.5 28.5 21.5 C 28.5 23.5 16.5 23.5 16.5 21.5 Z" />
            {/* Spherical Head */}
            <circle cx="22.5" cy="12.5" r="5.75" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </g>
        );

      case 'r': // Master Rook (Chess.com / Staunton Neo Style)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5 31 34.5 32.5 37 Z" />
            {/* Main Column */}
            <path d="M 14 34.5 L 15.5 17 L 29.5 17 L 31 34.5 Z" />
            {/* Battlements Crown */}
            <path d="M 12 17 L 12 9 L 16.5 9 L 16.5 12.5 L 20.5 12.5 L 20.5 9 L 24.5 9 L 24.5 12.5 L 28.5 12.5 L 28.5 9 L 33 9 L 33 17 Z" />
            {/* Detail Line */}
            <line x1="13.5" y1="22" x2="31.5" y2="22" stroke={detail} strokeWidth="1.3" />
          </g>
        );

      case 'n': // Master Knight (Chess.com / Staunton Neo Style - Facing Left)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5 31 34.5 32.5 37 Z" />

            {/* Horse Head & Neck Body (Left-Facing Iconic Silhouette) */}
            <path d="M 13.5 34.5
                     C 13.5 31.5 14.5 28 16.5 25.5
                     C 14.5 24.5 13 23 12.5 21.5
                     C 11.5 20 11.5 18.5 13 17.5
                     C 15.5 16 18 14 19.5 11.5
                     C 18.5 10 19 9 20.5 8.5
                     C 22 8 23.5 8.5 24.5 9.5
                     C 25.5 8.5 27 8 28.5 9
                     C 30 10 30 12.5 29.5 15
                     C 31.5 19 32.5 24.5 31.5 34.5 Z" />

            {/* Eye */}
            <circle cx="20" cy="14" r="1.3" fill={detail} stroke="none" />

            {/* Nostril */}
            <circle cx="14.2" cy="19.2" r="0.9" fill={detail} stroke="none" />

            {/* Muzzle / Mouth Slit */}
            <path d="M 12.5 20.5 C 14 21.2 16 21.2 17 20.5" stroke={detail} strokeWidth="1.2" fill="none" />

            {/* Mane Waves */}
            <path d="M 24 13.5 C 25.5 16.5 25.5 19.5 23.5 22.5" stroke={detail} strokeWidth="1.2" fill="none" />
            <path d="M 26.5 19.5 C 28 22.5 28 25.5 26 28.5" stroke={detail} strokeWidth="1.2" fill="none" />

            {/* Jawline Contour */}
            <path d="M 19 20.5 C 20.5 18.5 21.5 16.5 22 14.5" stroke={detail} strokeWidth="1.2" fill="none" />
          </g>
        );

      case 'b': // Master Bishop (Chess.com / Staunton Neo Style)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5 31 34.5 32.5 37 Z" />
            {/* Waist */}
            <path d="M 14 34.5 C 15.5 27 29.5 27 31 34.5 Z" />
            {/* Mitre Head */}
            <path d="M 22.5 9 C 26.5 9 29.5 12.5 29.5 17 C 29.5 22 26.5 24.5 22.5 24.5 C 18.5 24.5 15.5 22 15.5 17 C 15.5 12.5 18.5 9 22.5 9 Z" />
            {/* Top Orb */}
            <circle cx="22.5" cy="6" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
            {/* Mitre Cut Slash */}
            <path d="M 19 13.5 L 24.5 18.5" stroke={detail} strokeWidth="1.5" strokeLinecap="round" />
            {/* Detail Line */}
            <line x1="14" y1="23" x2="31" y2="23" stroke={detail} strokeWidth="1.3" />
          </g>
        );

      case 'q': // Master Queen (Chess.com / Staunton Neo Style)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5 31 34.5 32.5 37 Z" />
            {/* Waist */}
            <path d="M 13.5 34.5 C 15 27 30 27 31.5 34.5 Z" />
            {/* Crown Spikes Body */}
            <path d="M 12 23 L 8.5 11.5 L 15.5 17.5 L 22.5 9.5 L 29.5 17.5 L 36.5 11.5 L 33 23 Z" />
            {/* 5 Pearls on Crown Tips */}
            <circle cx="8.5" cy="9.5" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="15.5" cy="15.5" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="22.5" cy="7.5" r="1.8" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="29.5" cy="15.5" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <circle cx="36.5" cy="9.5" r="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
            {/* Detail Collar Line */}
            <line x1="13.5" y1="23" x2="31.5" y2="23" stroke={detail} strokeWidth="1.3" />
          </g>
        );

      case 'k': // Master King (Chess.com / Staunton Neo Style)
        return (
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            {/* Royal Cross on Top */}
            <line x1="22.5" y1="2.5" x2="22.5" y2="9.5" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="19" y1="5.5" x2="26" y2="5.5" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="22.5" y1="2.5" x2="22.5" y2="9.5" stroke={fill} strokeWidth="1.2" strokeLinecap="round" />
            <line x1="19" y1="5.5" x2="26" y2="5.5" stroke={fill} strokeWidth="1.2" strokeLinecap="round" />

            {/* Base */}
            <path d="M 10.5 40.5 L 34.5 40.5 L 33 37 L 12 37 Z" />
            <path d="M 12.5 37 C 14 34.5 31 34.5 32.5 37 Z" />
            {/* Waist */}
            <path d="M 13.5 34.5 C 15 27 30 27 31.5 34.5 Z" />
            {/* Dome Crown */}
            <path d="M 12.5 23 C 12.5 15 16.5 9.5 22.5 9.5 C 28.5 9.5 32.5 15 32.5 23 Z" />
            {/* Crown Inner Arches */}
            <path d="M 17.5 23 C 17.5 17 19.5 13 22.5 13 C 25.5 13 27.5 17 27.5 23" stroke={detail} strokeWidth="1.2" fill="none" />
            {/* Detail Line */}
            <line x1="13.5" y1="23" x2="31.5" y2="23" stroke={detail} strokeWidth="1.3" />
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

