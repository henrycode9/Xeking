import React from 'react';
import { Square } from 'chess.js';
import { useChessStore } from '../store/useChessStore';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Unicode Chess Symbols
const PIECE_SYMBOLS: Record<string, string> = {
  'w-k': '♔', 'w-q': '♕', 'w-r': '♖', 'w-b': '♗', 'w-n': '♘', 'w-p': '♙',
  'b-k': '♚', 'b-q': '♛', 'b-r': '♜', 'b-b': '♝', 'b-n': '♞', 'b-p': '♟',
};

export const ChessBoard2D: React.FC = () => {
  const {
    chess,
    selectedSquare,
    legalMoves,
    lastMove,
    selectSquare,
    makeMove,
    pendingPromotion,
    setPendingPromotion,
    turn,
    myColor
  } = useChessStore();

  const board = chess.board();

  // If user plays black, invert board orientation
  const displayedFiles = myColor === 'b' ? [...FILES].reverse() : FILES;
  const displayedRanks = myColor === 'b' ? [...RANKS].reverse() : RANKS;

  const getTileStyle = (isDark: boolean, isSelected: boolean, isLastMove: boolean) => {
    if (isSelected) {
      return 'bg-blue-600 text-white ring-4 ring-blue-400 scale-[0.96] z-10 shadow-lg';
    }
    if (isLastMove) {
      return 'bg-amber-300/80 ring-2 ring-amber-400';
    }

    return isDark
      ? 'bg-slate-300 hover:bg-slate-400/80 text-slate-900 border border-slate-300/50'
      : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/80';
  };

  const getPieceColorClass = (color: 'w' | 'b') => {
    return color === 'w' 
      ? 'text-amber-500 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' 
      : 'text-slate-900 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]';
  };

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    e.dataTransfer.setData('text/plain', square);
    selectSquare(square);
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain') as Square;
    if (fromSquare && fromSquare !== targetSquare) {
      const moves = chess.moves({ square: fromSquare, verbose: true });
      const targetMove = moves.find((m) => m.to === targetSquare);

      if (targetMove) {
        if (targetMove.promotion) {
          setPendingPromotion({ from: fromSquare, to: targetSquare });
        } else {
          makeMove(fromSquare, targetSquare);
        }
      }
    }
  };

  const PROMOTION_PIECES = [
    { type: 'q', symbol: turn === 'w' ? '♕' : '♛', name: 'Rainha' },
    { type: 'r', symbol: turn === 'w' ? '♖' : '♜', name: 'Torre' },
    { type: 'b', symbol: turn === 'w' ? '♗' : '♝', name: 'Bispo' },
    { type: 'n', symbol: turn === 'w' ? '♘' : '♞', name: 'Cavalo' },
  ];

  return (
    <div className="h-full max-h-full aspect-square mx-auto flex flex-col justify-center items-center transition-all duration-300 pro-card p-2 sm:p-3 min-h-0 overflow-hidden shadow-xl relative">
      
      {/* Pawn Promotion Overlay Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xl text-center max-w-xs w-full animate-bounce">
            <h3 className="text-sm font-bold text-slate-900 mb-1 font-pro">Promoção do Peão</h3>
            <p className="text-xs text-slate-500 mb-4">Escolha a peça para promover:</p>
            <div className="grid grid-cols-4 gap-2">
              {PROMOTION_PIECES.map((p) => (
                <button
                  key={p.type}
                  onClick={() => {
                    makeMove(pendingPromotion.from, pendingPromotion.to, p.type);
                    setPendingPromotion(null);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-200 transition-all transform hover:scale-110 cursor-pointer text-slate-900 group"
                  title={p.name}
                >
                  <span className="text-4xl leading-none">{p.symbol}</span>
                  <span className="text-[10px] font-semibold mt-1 group-hover:text-white">{p.name}</span>
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

      <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 rounded-2xl overflow-hidden p-1.5 bg-slate-200 border border-slate-300 shadow-inner">
        {displayedRanks.map((rank, rIdx) =>
          displayedFiles.map((file, fIdx) => {
            const square = `${file}${rank}` as Square;
            
            // Get actual piece from chess.js matrix
            const actualRIdx = 8 - parseInt(rank);
            const actualCIdx = FILES.indexOf(file);
            const piece = board[actualRIdx]?.[actualCIdx];

            const isDark = (actualRIdx + actualCIdx) % 2 === 1;
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            const isLastMove = lastMove?.from === square || lastMove?.to === square;

            const pieceKey = piece ? `${piece.color}-${piece.type}` : null;
            const symbol = pieceKey ? PIECE_SYMBOLS[pieceKey] : null;

            return (
              <button
                key={square}
                onClick={() => selectSquare(square)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center transition-all duration-150 aspect-square rounded-xl select-none cursor-pointer group font-pro ${getTileStyle(isDark, isSelected, isLastMove)}`}
              >
                {/* File/Rank Label */}
                {fIdx === 0 && (
                  <span className="absolute top-1 left-1.5 text-[10px] font-mono font-bold text-slate-500 pointer-events-none">
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span className="absolute bottom-1 right-1.5 text-[10px] font-mono font-bold text-slate-500 pointer-events-none">
                    {file}
                  </span>
                )}

                {/* Legal Move Indicator Dot */}
                {isLegalMove && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div
                      className={`rounded-full transition-transform duration-200 group-hover:scale-125 ${
                        piece
                          ? 'w-full h-full border-4 border-emerald-500 rounded-xl animate-pulse'
                          : 'w-4 h-4 bg-emerald-500 shadow-md shadow-emerald-500/40'
                      }`}
                    />
                  </div>
                )}

                {/* Piece Rendering */}
                {symbol && (
                  <span
                    draggable={!!piece && piece.color === turn}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none transition-transform duration-150 ${
                      isSelected ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'
                    } ${getPieceColorClass(piece!.color)} ${piece?.color === turn ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    {symbol}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};



