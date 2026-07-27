import React, { useEffect, useState } from 'react';
import { useChessStore } from './store/useChessStore';
import { HeaderUI } from './components/HeaderUI';
import { ChessBoard2D } from './components/ChessBoard2D';
import { GameControlsPanel } from './components/GameControlsPanel';
import { QRCodeModal } from './components/QRCodeModal';
import { GameOverModal } from './components/GameOverModal';
import { MatchStartOverlay } from './components/MatchStartOverlay';

export default function App() {
  const {
    initGame,
    reactions,
    gameMode,
    isOpponentConnected
  } = useChessStore();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Initialize room from URL query params or create new
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('room');
    
    if (urlRoomId) {
      initGame('multiplayer', urlRoomId);
    } else {
      initGame('multiplayer');
    }
  }, []);

  return (
    <div className="min-h-screen lg:h-screen w-screen max-w-screen overflow-y-auto lg:overflow-hidden selection:bg-slate-900 selection:text-white flex flex-col p-1.5 sm:p-3 antialiased theme-pro-light">
      
      {/* Main Container */}
      <div className="relative z-10 w-full h-full flex flex-col min-h-0">
        
        {/* Compact Header */}
        <HeaderUI
          onOpenQRModal={() => setIsQRModalOpen(true)}
        />

        {/* Board & Control Grid */}
        <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-3 min-h-0 py-1 items-stretch">
          
          {/* Left Column: Board Canvas */}
          <div className="lg:col-span-8 xl:col-span-8 w-full flex flex-col items-center justify-center relative shrink-0 min-h-0">
            
            {/* Quick QR Invite Banner when waiting */}
            {gameMode === 'multiplayer' && !isOpponentConnected && (
              <div className="w-full mb-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs animate-fadeIn shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span className="font-semibold text-[11px] sm:text-xs text-slate-800">A aguardar jogador... Envie o QR Code ao seu oponente!</span>
                </div>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
                >
                  Ver QR Code
                </button>
              </div>
            )}

            {/* Floating Emojis Layer */}
            <div className="absolute top-2 right-2 z-20 pointer-events-none flex flex-col space-y-1">
              {reactions.map((r) => (
                <div
                  key={r.id}
                  className="text-3xl animate-bounce drop-shadow-md"
                >
                  {r.emoji}
                </div>
              ))}
            </div>

            {/* Board View Viewport */}
            <div className="w-full flex items-center justify-center min-h-0 py-1">
              <ChessBoard2D />
            </div>
          </div>

          {/* Right Column: Game Controls Panel */}
          <div className="lg:col-span-4 xl:col-span-4 w-full flex-1 lg:h-full min-h-0">
            <GameControlsPanel />
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
      <GameOverModal />
      <MatchStartOverlay />
    </div>
  );
}



