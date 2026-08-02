import React, { useEffect, useState } from 'react';
import { useChessStore } from '../store/useChessStore';
import { sound } from '../utils/sound';

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
        setTimeout(() => setCountdown(null), 2900),
      ];

      return () => timers.forEach(clearTimeout);
    }
    setCountdown(null);
  }, [isOpponentConnected, gameMode, gameStatus]);

  if (countdown === null || countdown <= 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn pointer-events-none select-none">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 px-10 max-w-xs text-center shadow-2xl relative overflow-hidden animate-fadeIn">
        <span
          key={countdown}
          className="font-mono text-7xl font-black text-zinc-950 animate-fadeIn inline-block"
        >
          {countdown}
        </span>
      </div>
    </div>
  );
};

