import React from 'react';
import { useChessStore } from '../store/useChessStore';

/**
 * Animated Professional Floating Reaction Overlay
 * Renders reactions as dynamic physics particles with sender attribution and sparkles.
 */
export const FloatingReactionsOverlay: React.FC = () => {
  const reactions = useChessStore((s) => s.reactions);
  const myColor   = useChessStore((s) => s.myColor);

  if (reactions.length === 0) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex items-end justify-center pb-12">
      {reactions.map((r, index) => {
        const isMe = r.senderColor === myColor;

        // Generate deterministic horizontal spread based on reaction ID
        const charCodeSum = r.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const xOffsetPercent = ((charCodeSum % 70) - 35); // -35% to +35%

        return (
          <div
            key={r.id}
            style={{
              left: `calc(50% + ${xOffsetPercent}%)`,
              animationDelay: `${index * 50}ms`,
            }}
            className="absolute bottom-8 flex flex-col items-center animate-reaction-float transform -translate-x-1/2 select-none z-30"
          >
            {/* Sparkle Particles */}
            <div className="absolute -top-3 -right-2 text-xs animate-ping opacity-75">
              ✨
            </div>
            <div className="absolute -bottom-2 -left-2 text-xs animate-pulse opacity-75">
              ⭐
            </div>

            {/* Main Animated Emoji */}
            <div className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform hover:scale-125">
              {r.emoji}
            </div>

            {/* Sender Badge */}
            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-zinc-950/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg border border-white/20 whitespace-nowrap">
              {isMe ? 'Você' : 'Oponente'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
