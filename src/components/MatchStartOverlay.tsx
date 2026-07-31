import React, { useEffect, useState } from 'react';
import { useChessStore } from '../store/useChessStore';
import { sound } from '../utils/sound';
import { Swords, CheckCircle2 } from 'lucide-react';

export const MatchStartOverlay: React.FC = () => {
  const isOpponentConnected = useChessStore((s) => s.isOpponentConnected);
  const gameMode            = useChessStore((s) => s.gameMode);
  const gameStatus          = useChessStore((s) => s.gameStatus);

  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (gameMode === 'multiplayer' && isOpponentConnected && gameStatus === 'playing') {
      sound.playMatchStartSound();
      setCountdown(3);

      const timers = [
        setTimeout(() => setCountdown(2),    1000),
        setTimeout(() => setCountdown(1),    2000),
        setTimeout(() => setCountdown(0),    3000),
        setTimeout(() => setCountdown(null), 3800),
      ];

      return () => timers.forEach(clearTimeout);
    }
    setCountdown(null);
  }, [isOpponentConnected, gameMode, gameStatus]);

  if (countdown === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn pointer-events-none select-none">
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-fadeIn">

        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white border border-zinc-950 flex items-center justify-center shadow-md">
            {countdown > 0
              ? <Swords className="w-7 h-7 animate-spin text-white" />
              : <CheckCircle2 className="w-7 h-7 text-white" />}
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 font-pro">Oponente Conectado!</h3>
        <p className="text-xs text-zinc-500 mt-1 font-medium">A partida vai começar…</p>

        <div className="my-6">
          {countdown > 0 ? (
            <span
              key={countdown}
              className="font-mono text-6xl font-black text-zinc-950 animate-fadeIn inline-block"
            >
              {countdown}
            </span>
          ) : (
            <span className="font-mono text-3xl font-black text-zinc-950 inline-block animate-fadeIn">
              BOA SORTE! ♟️
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-600 font-medium">
          {countdown > 0 ? 'Prepare as suas peças!' : 'É a sua vez de jogar!'}
        </p>
      </div>
    </div>
  );
};
