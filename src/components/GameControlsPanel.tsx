import React, { useMemo } from 'react';
import { useChessStore } from '../store/useChessStore';
import { RotateCcw, History, Flag } from 'lucide-react';
import { ChessPieceSVG } from './ChessPieceSVG';
import { PieceType } from '../types';

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const INITIAL_COUNTS: Record<string, number> = { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 };

export const GameControlsPanel: React.FC = () => {
  const fen        = useChessStore((s) => s.fen);
  const chess      = useChessStore((s) => s.chess);
  const history    = useChessStore((s) => s.history);
  const turn       = useChessStore((s) => s.turn);
  const gameStatus = useChessStore((s) => s.gameStatus);
  const gameMode   = useChessStore((s) => s.gameMode);
  const resetGame  = useChessStore((s) => s.resetGame);
  const resignGame = useChessStore((s) => s.resignGame);

  const capturedData = useMemo(() => {
    const board = chess.board();
    const current: Record<string, number> = {};

    board.forEach((row) =>
      row.forEach((piece) => {
        if (piece) {
          const key = `${piece.color}-${piece.type}`;
          current[key] = (current[key] ?? 0) + 1;
        }
      })
    );

    const whiteCaptured: PieceType[] = [];
    const blackCaptured: PieceType[] = [];
    let whiteScore = 0;
    let blackScore = 0;

    (['p', 'n', 'b', 'r', 'q'] as PieceType[]).forEach((type) => {
      const initial = INITIAL_COUNTS[type];

      const lostBlack = initial - (current[`b-${type}`] ?? 0);
      for (let i = 0; i < lostBlack; i++) {
        whiteCaptured.push(type);
        whiteScore += PIECE_VALUES[type];
      }

      const lostWhite = initial - (current[`w-${type}`] ?? 0);
      for (let i = 0; i < lostWhite; i++) {
        blackCaptured.push(type);
        blackScore += PIECE_VALUES[type];
      }
    });

    return { whiteCaptured, blackCaptured, materialDiff: whiteScore - blackScore };
  }, [fen]);

  const inCheck = chess.inCheck();

  return (
    <div className="w-full h-full flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200/80 text-zinc-900 min-h-0 overflow-hidden space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

      {/* Status Header */}
      <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${turn === 'w' ? 'bg-white border border-zinc-900' : 'bg-zinc-950'}`} />
          <span className="text-xs font-bold text-zinc-900">
            {gameStatus === 'checkmate'
              ? 'Xeque-Mate!'
              : inCheck
              ? '⚠️ Xeque!'
              : `Vez das ${turn === 'w' ? 'Brancas' : 'Pretas'}`}
          </span>
        </div>
        {capturedData.materialDiff !== 0 && (
          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-950 text-white">
            {capturedData.materialDiff > 0 ? `+${capturedData.materialDiff}` : capturedData.materialDiff}
          </span>
        )}
      </div>

      {/* Captured Trays */}
      <div className="grid grid-cols-2 gap-2.5 text-xs shrink-0">
        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
          <p className="text-[10px] text-zinc-500 font-bold mb-1">Capturas Brancas</p>
          <div className="flex flex-wrap gap-1 min-h-[22px] items-center">
            {capturedData.whiteCaptured.map((piece, i) => (
              <div key={i} className="w-4 h-4">
                <ChessPieceSVG type={piece} color="b" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
          <p className="text-[10px] text-zinc-500 font-bold mb-1">Capturas Pretas</p>
          <div className="flex flex-wrap gap-1 min-h-[22px] items-center">
            {capturedData.blackCaptured.map((piece, i) => (
              <div key={i} className="w-4 h-4">
                <ChessPieceSVG type={piece} color="w" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Move Log */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-zinc-600 font-sans text-xs font-bold pb-2 border-b border-zinc-200 sticky top-0 bg-zinc-50 z-10">
          <History className="w-3.5 h-3.5 text-zinc-700" />
          <span>Histórico de Lances</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-zinc-400 italic pt-4 text-center">
            Aguardando primeira jogada...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1.5">
            {Array.from({ length: Math.ceil(history.length / 2) }).map((_, idx) => {
              const whiteMove = history[idx * 2];
              const blackMove = history[idx * 2 + 1];
              return (
                <React.Fragment key={idx}>
                  <div className="flex items-center space-x-1.5 text-xs py-0.5 px-1 rounded-md hover:bg-zinc-200/60">
                    <span className="text-zinc-400 text-[10px] font-bold w-4">{idx + 1}.</span>
                    <span className="font-bold text-zinc-900">{whiteMove?.san}</span>
                  </div>
                  <div className="text-zinc-600 text-xs py-0.5 px-1 rounded-md hover:bg-zinc-200/60 font-medium">
                    {blackMove?.san ?? ''}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="shrink-0 pt-0.5">
        {gameStatus === 'playing' ? (
          <button
            onClick={resignGame}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Flag className="w-4 h-4" />
            <span>Desistir da Partida</span>
          </button>
        ) : (
          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Novo Jogo / Reiniciar</span>
          </button>
        )}
      </div>
    </div>
  );
};

