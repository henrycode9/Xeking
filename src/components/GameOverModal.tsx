import React from 'react';
import { useChessStore } from '../store/useChessStore';
import { Trophy, RotateCcw, Share2, Copy, Check, X } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const { gameStatus, winner, myColor, requestRematch, history, resetGame } = useChessStore();
  const [copied, setCopied] = React.useState(false);

  if (gameStatus !== 'checkmate' && gameStatus !== 'draw' && gameStatus !== 'stalemate' && gameStatus !== 'timeout') {
    return null;
  }

  const isIWinner = winner === myColor;

  const copyPGN = () => {
    const pgnText = history.map((m, i) => `${i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}${m.san}`).join(' ');
    navigator.clipboard.writeText(pgnText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center overflow-hidden">
        
        {/* Glow background */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isIWinner ? 'bg-amber-500/30' : 'bg-blue-600/20'
        }`} />

        {/* Trophy Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center shadow-2xl ${
            isIWinner
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/20'
              : 'bg-blue-600/20 text-blue-400 border-blue-500/40'
          }`}>
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-tight">
          {gameStatus === 'checkmate'
            ? isIWinner ? 'Vitória Gloriosa!' : 'Xeque-Mate!'
            : gameStatus === 'timeout'
            ? 'Tempo Esgotado!'
            : 'Empate Técnico'}
        </h2>

        <p className="mt-1 text-xs text-slate-300">
          {gameStatus === 'checkmate'
            ? `Vencedor: ${winner === 'w' ? 'Brancas' : 'Pretas'}`
            : gameStatus === 'timeout'
            ? `Vencedor por tempo: ${winner === 'w' ? 'Brancas' : 'Pretas'}`
            : 'O jogo terminou em empate.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={requestRematch}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Revanche Instantânea</span>
          </button>

          <button
            onClick={copyPGN}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-white/10 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'PGN Copiado!' : 'Copiar PGN da Partida'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
