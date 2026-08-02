import React, { useEffect, useState } from 'react';
import { useChessStore } from './store/useChessStore';
import { useChessClock } from './hooks/useChessClock';
import { HeaderUI } from './components/HeaderUI';
import { ChessBoard2D } from './components/ChessBoard2D';
import { GameControlsPanel } from './components/GameControlsPanel';
import { QRCodeModal } from './components/QRCodeModal';
import { GameOverModal } from './components/GameOverModal';
import { MatchStartOverlay } from './components/MatchStartOverlay';

export default function App() {
  const initGame = useChessStore((s) => s.initGame);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useChessClock();

  useEffect(() => {
    // Preload piece images for instant zero-latency rendering on any network/device
    const pieceCodes = ['wp', 'wn', 'wb', 'wr', 'wq', 'wk', 'bp', 'bn', 'bb', 'br', 'bq', 'bk'];
    pieceCodes.forEach((code) => {
      const img = new Image();
      img.src = `/pieces/${code}.png`;
    });

    const params    = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('room');
    initGame('multiplayer', urlRoomId ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-full bg-[#f4f4f5] text-[#09090b] flex flex-col p-2 sm:p-3.5 antialiased select-none overflow-y-auto lg:overflow-hidden touch-pan-y">

      <div className="relative z-10 w-full flex-1 flex flex-col min-h-0">

        {/* Header */}
        <HeaderUI onOpenQRModal={() => setIsQRModalOpen(true)} />

        {/* Main Game Grid */}
        <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-3.5 min-h-0 py-1 sm:py-1.5 items-stretch overflow-y-auto lg:overflow-hidden touch-pan-y">

          {/* Board Column */}
          <div className="lg:col-span-8 w-full flex flex-col items-center justify-center relative shrink-0 min-h-0 overflow-hidden">
            {/* Board Viewport Wrapper */}
            <div className="w-full flex-1 flex items-center justify-center min-h-0 py-0.5 max-h-full">
              <ChessBoard2D />
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-4 w-full flex-1 lg:h-full min-h-0">
            <GameControlsPanel />
          </div>
        </main>
      </div>

      {/* Modals */}
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
      <GameOverModal />
      <MatchStartOverlay />
    </div>
  );
}

