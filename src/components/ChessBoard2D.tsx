import React, { useMemo, useState, useCallback } from 'react';
import { Square } from 'chess.js';
import { useChessStore } from '../store/useChessStore';
import { ChessPieceSVG } from './ChessPieceSVG';
import { PieceType, PlayerColor } from '../types';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

const PROMOTION_PIECES: { type: PieceType; name: string }[] = [
  { type: 'q', name: 'Rainha' },
  { type: 'r', name: 'Torre'  },
  { type: 'b', name: 'Bispo'  },
  { type: 'n', name: 'Cavalo' },
];

interface SquareTileProps {
  square: Square;
  file: string;
  rank: string;
  fIdx: number;
  rIdx: number;
  piece: { type: string; color: string } | null;
  isDark: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isKingInCheck: boolean;
  isRightClickHl: boolean;
  turn: PlayerColor;
  onSquareClick: (sq: Square) => void;
  onRightClick: (e: React.MouseEvent, sq: Square) => void;
  onDragStart: (e: React.DragEvent, sq: Square) => void;
  onDrop: (e: React.DragEvent, sq: Square) => void;
}

const SquareTile = React.memo<SquareTileProps>(({
  square,
  file,
  rank,
  fIdx,
  rIdx,
  piece,
  isDark,
  isSelected,
  isLegalMove,
  isLastMove,
  isKingInCheck,
  isRightClickHl,
  turn,
  onSquareClick,
  onRightClick,
  onDragStart,
  onDrop,
}) => {
  // High-Contrast Monochromatic Board Palette
  let tileBgStyle = isDark ? '#27272a' : '#ffffff';

  if (isSelected) {
    tileBgStyle = '#52525b'; // Deep Zinc Selected Tile
  } else if (isKingInCheck) {
    tileBgStyle = '#dc2626'; // Vivid Red King Check Alert
  } else if (isLastMove) {
    tileBgStyle = isDark ? '#3f3f46' : '#e4e4e7'; // Crisp Last Move Accent
  }

  return (
    <button
      onClick={() => onSquareClick(square)}
      onContextMenu={(e) => onRightClick(e, square)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, square)}
      style={{
        backgroundColor: tileBgStyle,
        transform: 'translateZ(0)',
      }}
      className="relative aspect-square w-full h-full flex items-center justify-center cursor-pointer overflow-hidden transition-none select-none active:scale-[0.98] touch-none"
    >
      {/* Right-click highlight */}
      {isRightClickHl && (
        <div className="absolute inset-0 bg-amber-400/40 z-0 pointer-events-none" />
      )}

      {/* Rank label */}
      {fIdx === 0 && (
        <span className={`absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-extrabold pointer-events-none z-20 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {rank}
        </span>
      )}

      {/* File label */}
      {rIdx === 7 && (
        <span className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-extrabold pointer-events-none z-20 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {file}
        </span>
      )}

      {/* High-Contrast Vivid Legal Move Indicators (Satisfying Emerald Accent) */}
      {isLegalMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {piece ? (
            <div className="w-full h-full border-[4px] sm:border-[5px] border-emerald-500/80 rounded-full animate-pulse" />
          ) : (
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/80 border border-white shadow-sm" />
          )}
        </div>
      )}

      {/* Chess piece with high legibility */}
      {piece && (
        <div
          draggable={piece.color === turn}
          onDragStart={(e) => onDragStart(e, square)}
          className={`w-full h-full p-0.5 sm:p-1.5 flex items-center justify-center z-10 ${
            isSelected ? 'scale-110 -translate-y-1' : ''
          } ${piece.color === turn ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <ChessPieceSVG type={piece.type as PieceType} color={piece.color as PlayerColor} />
        </div>
      )}
    </button>
  );
});

SquareTile.displayName = 'SquareTile';

export const ChessBoard2D: React.FC = () => {
  const chess            = useChessStore((s) => s.chess);
  const fen              = useChessStore((s) => s.fen);
  const selectedSquare   = useChessStore((s) => s.selectedSquare);
  const legalMoves       = useChessStore((s) => s.legalMoves);
  const lastMove         = useChessStore((s) => s.lastMove);
  const turn             = useChessStore((s) => s.turn);
  const myColor          = useChessStore((s) => s.myColor);
  const pendingPromotion = useChessStore((s) => s.pendingPromotion);
  const selectSquare     = useChessStore((s) => s.selectSquare);
  const makeMove         = useChessStore((s) => s.makeMove);
  const setPendingPromotion = useChessStore((s) => s.setPendingPromotion);

  const [highlightedSquares, setHighlightedSquares] = useState<Set<Square>>(new Set());

  const board = useMemo(() => chess.board(), [fen]);

  const kingInCheckSquare = useMemo<Square | null>(() => {
    if (!chess.inCheck()) return null;
    const currentTurn = chess.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          return `${FILES[c]}${RANKS[r]}` as Square;
        }
      }
    }
    return null;
  }, [fen]);

  const displayedFiles = useMemo(
    () => (myColor === 'b' ? [...FILES].reverse() : [...FILES]),
    [myColor]
  );
  const displayedRanks = useMemo(
    () => (myColor === 'b' ? [...RANKS].reverse() : [...RANKS]),
    [myColor]
  );

  const handleDragStart = useCallback((e: React.DragEvent, square: Square) => {
    e.dataTransfer.setData('text/plain', square);
    selectSquare(square);
    setHighlightedSquares(new Set());
  }, [selectSquare]);

  const handleDrop = useCallback((e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain') as Square;
    if (!fromSquare || fromSquare === targetSquare) return;

    const moves = chess.moves({ square: fromSquare, verbose: true });
    const target = moves.find((m) => m.to === targetSquare);
    if (!target) return;

    if (target.promotion) {
      setPendingPromotion({ from: fromSquare, to: targetSquare });
    } else {
      makeMove(fromSquare, targetSquare);
    }
  }, [chess, makeMove, setPendingPromotion]);

  const handleRightClick = useCallback((e: React.MouseEvent, square: Square) => {
    e.preventDefault();
    setHighlightedSquares((prev) => {
      const next = new Set(prev);
      if (next.has(square)) {
        next.delete(square);
      } else {
        next.add(square);
      }
      return next;
    });
  }, []);

  const handleSquareClick = useCallback((square: Square) => {
    setHighlightedSquares(new Set());
    selectSquare(square);
  }, [selectSquare]);

  return (
    <div className="w-full max-w-[min(96vw,calc(100dvh-170px))] sm:max-w-lg aspect-square mx-auto flex items-center justify-center relative select-none shrink-0">

      {/* Pawn Promotion Overlay */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 rounded-3xl animate-fadeIn">
          <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-2xl text-center max-w-xs w-full">
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Promover Peão</h3>
            <p className="text-xs text-zinc-500 mb-4">Escolha a nova peça:</p>
            <div className="grid grid-cols-4 gap-2">
              {PROMOTION_PIECES.map((p) => (
                <button
                  key={p.type}
                  onClick={() => {
                    makeMove(pendingPromotion.from, pendingPromotion.to, p.type);
                    setPendingPromotion(null);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 transition-all cursor-pointer group active:scale-95 shadow-sm"
                  title={p.name}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <ChessPieceSVG type={p.type} color={turn} />
                  </div>
                  <span className="text-[10px] font-semibold mt-1 text-zinc-700 group-hover:text-white">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPendingPromotion(null)}
              className="mt-4 text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Borderless High-Contrast Board Grid (Zero Black Border Frame) */}
      <div className="w-full aspect-square grid grid-cols-8 grid-rows-8 rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.08)] bg-white border-0">
        {displayedRanks.map((rank, rIdx) =>
          displayedFiles.map((file, fIdx) => {
            const square      = `${file}${rank}` as Square;
            const actualRIdx  = 8 - parseInt(rank);
            const actualCIdx  = FILES.indexOf(file as typeof FILES[number]);
            const piece       = board[actualRIdx]?.[actualCIdx];

            const isDark          = (actualRIdx + actualCIdx) % 2 === 1;
            const isSelected      = selectedSquare === square;
            const isLegalMove     = legalMoves.includes(square);
            const isLastMove      = lastMove?.from === square || lastMove?.to === square;
            const isKingInCheck   = kingInCheckSquare === square;
            const isRightClickHl  = highlightedSquares.has(square);

            return (
              <SquareTile
                key={square}
                square={square}
                file={file}
                rank={rank}
                fIdx={fIdx}
                rIdx={rIdx}
                piece={piece}
                isDark={isDark}
                isSelected={isSelected}
                isLegalMove={isLegalMove}
                isLastMove={isLastMove}
                isKingInCheck={isKingInCheck}
                isRightClickHl={isRightClickHl}
                turn={turn}
                onSquareClick={handleSquareClick}
                onRightClick={handleRightClick}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
