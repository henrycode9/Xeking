import React, { useEffect, useState } from 'react';
import { useChessStore } from './store/useChessStore';
import { useChessClock } from './hooks/useChessClock';
import { HeaderUI } from './components/HeaderUI';
import { ChessBoard2D } from './components/ChessBoard2D';
import { GameControlsPanel } from './components/GameControlsPanel';
import { QRCodeModal } from './components/QRCodeModal';
import { GameOverModal } from './components/GameOverModal';
import { MatchStartOverlay } from './components/MatchStartOverlay';
import { FloatingReactionsOverlay } from './components/FloatingReactionsOverlay';

export default function App() {
  const initGame        = useChessStore((s) => s.initGame);
  const reactions       = useChessStore((s) => s.reactions);
  const expireReactions = useChessStore((s) => s.expireReactions);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useChessClock();

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('room');
    initGame('multiplayer', urlRoomId ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reactions.length === 0) return;
    const id = setInterval(expireReactions, 1000);
    return () => clearInterval(id);
  }, [reactions.length, expireReactions]);

  return (
    <div className="h-screen w-screen max-w-screen overflow-hidden bg-[#f4f4f5] text-[#09090b] flex flex-col p-2.5 sm:p-3.5 antialiased select-none">

      <div className="relative z-10 w-full h-full flex flex-col min-h-0">

        {/* Header */}
        <HeaderUI onOpenQRModal={() => setIsQRModalOpen(true)} />

        {/* Main Game Grid */}
        <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-3.5 min-h-0 py-1.5 items-stretch">

          {/* Board Column */}
          <div className="lg:col-span-8 w-full flex flex-col items-center justify-center relative shrink-0 min-h-0 overflow-hidden">

            {/* Rich Physics-Animated Reaction Overlay */}
            <FloatingReactionsOverlay />

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
