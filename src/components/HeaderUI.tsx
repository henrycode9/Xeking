import React, { useEffect } from 'react';
import { useChessStore } from '../store/useChessStore';
import { 
  Volume2, 
  VolumeX, 
  QrCode, 
  Users, 
  Gamepad2,
  Crown
} from 'lucide-react';

interface HeaderUIProps {
  onOpenQRModal: () => void;
}

export const HeaderUI: React.FC<HeaderUIProps> = ({ onOpenQRModal }) => {
  const {
    gameMode,
    setGameMode,
    myColor,
    turn,
    isSoundMuted,
    toggleSound,
    whiteTime,
    blackTime,
    updateClocks,
    isTimerRunning,
    gameStatus
  } = useChessStore();

  // Clock tick interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      updateClocks();
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, updateClocks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full max-w-7xl mx-auto py-1 shrink-0">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 sm:px-4 rounded-2xl pro-card">
        
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-lg shadow-sm transition-transform hover:scale-105">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 font-pro leading-none">
              Xeking
            </h1>
          </div>
        </div>

        {/* Game Mode & Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Game Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              onClick={() => setGameMode('multiplayer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                gameMode === 'multiplayer'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Multiplayer</span>
            </button>
            <button
              onClick={() => setGameMode('pass-and-play')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                gameMode === 'pass-and-play'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gamepad2 className="w-3 h-3" />
              <span>Local</span>
            </button>
          </div>

          {/* QR Code / Invite Button */}
          {gameMode === 'multiplayer' && (
            <button
              onClick={onOpenQRModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shadow-sm transition-all cursor-pointer"
            >
              <QrCode className="w-3 h-3" />
              <span>Convidar</span>
            </button>
          )}

          {/* Mute Audio Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
            title={isSoundMuted ? "Ativar som" : "Desativar som"}
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Clocks & Player Status Banner */}
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        {/* Black Clock */}
        <div
          className={`py-1.5 px-3 rounded-xl border transition-all flex items-center justify-between ${
            turn === 'b' && gameStatus === 'playing'
              ? 'bg-slate-900 text-white border-slate-800 shadow-sm ring-1 ring-slate-400'
              : 'bg-white text-slate-800 border-slate-200 opacity-90'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-400 inline-block shadow-sm" />
            <div className="text-left">
              <p className="text-[11px] font-bold leading-tight">Pretas</p>
              <p className="text-[9px] opacity-75 leading-tight">
                {gameMode === 'multiplayer'
                  ? myColor === 'b' ? 'Você (Pretas)' : 'Oponente'
                  : 'Jogador 2'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-base font-black tracking-wider">
              {formatTime(blackTime)}
            </span>
          </div>
        </div>

        {/* White Clock */}
        <div
          className={`py-1.5 px-3 rounded-xl border transition-all flex items-center justify-between ${
            turn === 'w' && gameStatus === 'playing'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
              : 'bg-white text-slate-800 border-slate-200 opacity-90'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-400 inline-block shadow-sm" />
            <div className="text-left">
              <p className="text-[11px] font-bold leading-tight">Brancas</p>
              <p className="text-[9px] opacity-75 leading-tight">
                {gameMode === 'multiplayer'
                  ? myColor === 'w' ? 'Você (Criador)' : 'Oponente'
                  : 'Você (Brancas)'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-base font-black tracking-wider">
              {formatTime(whiteTime)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

