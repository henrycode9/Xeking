import React from 'react';
import { useChessStore } from '../store/useChessStore';
import { Volume2, VolumeX, QrCode, Users, Gamepad2, Crown } from 'lucide-react';

interface HeaderUIProps {
  onOpenQRModal: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const HeaderUI: React.FC<HeaderUIProps> = ({ onOpenQRModal }) => {
  const gameMode            = useChessStore((s) => s.gameMode);
  const setGameMode         = useChessStore((s) => s.setGameMode);
  const myColor             = useChessStore((s) => s.myColor);
  const turn                = useChessStore((s) => s.turn);
  const isSoundMuted        = useChessStore((s) => s.isSoundMuted);
  const toggleSound         = useChessStore((s) => s.toggleSound);
  const whiteTime           = useChessStore((s) => s.whiteTime);
  const blackTime           = useChessStore((s) => s.blackTime);
  const gameStatus          = useChessStore((s) => s.gameStatus);

  return (
    <header className="w-full max-w-7xl mx-auto py-1 shrink-0 space-y-2">
      {/* Black & White Header Container */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-4 rounded-2xl bg-white border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

        {/* Brand: "Xeking" in Black & White Graffiti Font */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold shadow-sm">
            <Crown className="w-4.5 h-4.5" />
          </div>
          <span className="text-xl sm:text-2xl font-graffiti tracking-wider bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-900 bg-clip-text text-transparent drop-shadow-sm select-none -rotate-1">
            Xeking
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Game Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200">
            <button
              onClick={() => setGameMode('multiplayer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                gameMode === 'multiplayer'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Multiplayer</span>
            </button>
            <button
              onClick={() => setGameMode('pass-and-play')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                gameMode === 'pass-and-play'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Local</span>
            </button>
          </div>

          {/* QR Invite */}
          {gameMode === 'multiplayer' && (
            <button
              onClick={onOpenQRModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Convidar</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 transition-all cursor-pointer active:scale-95"
            title={isSoundMuted ? 'Ativar som' : 'Desativar som'}
          >
            {isSoundMuted
              ? <VolumeX className="w-4 h-4 text-zinc-400" />
              : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* High-Contrast Clocks Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Black Clock */}
        <div
          className={`py-2 px-4 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${
            turn === 'b' && gameStatus === 'playing'
              ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-zinc-500/50'
              : 'bg-white text-zinc-900 border-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-zinc-950 border border-zinc-400 inline-block shadow-sm" />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Pretas</p>
              <p className="text-[10px] opacity-70 leading-tight">
                {gameMode === 'multiplayer'
                  ? myColor === 'b' ? 'Você (Pretas)' : 'Oponente'
                  : 'Jogador 2'}
              </p>
            </div>
          </div>
          <span className="font-mono text-lg font-extrabold tracking-wider">
            {formatTime(blackTime)}
          </span>
        </div>

        {/* White Clock */}
        <div
          className={`py-2 px-4 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${
            turn === 'w' && gameStatus === 'playing'
              ? 'bg-white text-zinc-950 border-zinc-950 ring-2 ring-zinc-950/40 shadow-md'
              : 'bg-white text-zinc-900 border-zinc-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-white border border-zinc-900 inline-block shadow-sm" />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Brancas</p>
              <p className="text-[10px] opacity-70 leading-tight">
                {gameMode === 'multiplayer'
                  ? myColor === 'w' ? 'Você (Criador)' : 'Oponente'
                  : 'Você (Brancas)'}
              </p>
            </div>
          </div>
          <span className="font-mono text-lg font-extrabold tracking-wider">
            {formatTime(whiteTime)}
          </span>
        </div>
      </div>
    </header>
  );
};
