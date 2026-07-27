import React, { useEffect, useState } from 'react';
import { useChessStore } from '../store/useChessStore';
import { sound } from '../utils/sound';
import { Swords, CheckCircle2 } from 'lucide-react';

export const MatchStartOverlay: React.FC = () => {
  const { isOpponentConnected, gameMode, gameStatus } = useChessStore();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (gameMode === 'multiplayer' && isOpponentConnected && gameStatus === 'playing') {
      sound.playMatchStartSound();
      setCountdown(3);

      const timer3 = setTimeout(() => setCountdown(2), 1000);
      const timer2 = setTimeout(() => setCountdown(1), 2000);
      const timer1 = setTimeout(() => setCountdown(0), 3000);
      const timerEnd = setTimeout(() => setCountdown(null), 3800);

      return () => {
        clearTimeout(timer3);
        clearTimeout(timer2);
        clearTimeout(timer1);
        clearTimeout(timerEnd);
      };
    } else {
      setCountdown(null);
    }
  }, [isOpponentConnected, gameMode, gameStatus]);

  if (countdown === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn pointer-events-none select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-bounce">
        
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            {countdown > 0 ? (
              <Swords className="w-7 h-7 animate-spin" />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white font-pro">Oponente Conectado!</h3>
        <p className="text-xs text-slate-400 mt-1">A partida vai começar...</p>

        <div className="my-6">
          {countdown > 0 ? (
            <span key={countdown} className="font-mono text-6xl font-black text-amber-400 animate-ping inline-block">
              {countdown}
            </span>
          ) : (
            <span className="font-mono text-3xl font-black text-emerald-400 animate-bounce inline-block">
              BOA SORTE! ♟️
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          {countdown > 0 ? 'Prepare as suas peças!' : 'É a sua vez de jogar!'}
        </p>
      </div>
    </div>
  );
};
