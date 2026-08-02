import React from 'react';
import { useChessStore } from '../store/useChessStore';
import { Trophy, RotateCcw, Copy, Check } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const gameStatus    = useChessStore((s) => s.gameStatus);
  const winner        = useChessStore((s) => s.winner);
  const myColor       = useChessStore((s) => s.myColor);
  const requestRematch = useChessStore((s) => s.requestRematch);
  const history       = useChessStore((s) => s.history);

  const [copied, setCopied] = React.useState(false);

  const isVisible =
    gameStatus === 'checkmate' ||
    gameStatus === 'draw'      ||
    gameStatus === 'stalemate' ||
    gameStatus === 'timeout';

  if (!isVisible) return null;

  const isIWinner = winner === myColor;

  const copyPGN = () => {
    const pgn = history
      .map((m, i) => `${i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}${m.san}`)
      .join(' ');
    navigator.clipboard.writeText(pgn).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm p-7 rounded-3xl bg-white border border-zinc-200 shadow-2xl text-center overflow-hidden">

        {/* Trophy Icon */}
        <div className="flex justify-center mb-3.5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
            isIWinner
              ? 'bg-zinc-950 text-white border border-zinc-950'
              : 'bg-zinc-100 text-zinc-900 border border-zinc-300'
          }`}>
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
          {gameStatus === 'checkmate'
            ? isIWinner ? 'Vitória!' : 'Xeque-Mate!'
            : gameStatus === 'timeout'
            ? 'Tempo Esgotado!'
            : 'Empate'}
        </h2>

        <p className="mt-1 text-xs text-zinc-500 font-medium">
          {gameStatus === 'checkmate'
            ? `Vencedor: ${winner === 'w' ? 'Brancas' : 'Pretas'}`
            : gameStatus === 'timeout'
            ? `Vencedor por tempo: ${winner === 'w' ? 'Brancas' : 'Pretas'}`
            : 'O jogo terminou em empate.'}
        </p>

        {/* Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={requestRematch}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Revanche</span>
          </button>

          <button
            onClick={copyPGN}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs border border-zinc-300 transition-all cursor-pointer active:scale-95"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-zinc-900" />
              : <Copy  className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{copied ? 'PGN Copiado!' : 'Copiar PGN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
