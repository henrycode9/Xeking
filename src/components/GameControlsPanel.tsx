import React, { useMemo } from 'react';
import { useChessStore } from '../store/useChessStore';
import { RotateCcw, History, Smile, Flag } from 'lucide-react';

const EMOJIS = ['👏', '🔥', '👑', '🤔', '🎯', '⚡'];

export const GameControlsPanel: React.FC = () => {
  const {
    history,
    turn,
    gameStatus,
    gameMode,
    sendReaction,
    resetGame,
    resignGame,
    chess
  } = useChessStore();

  // Calculate captured pieces & material score advantage
  const capturedData = useMemo(() => {
    const board = chess.board();
    const initialCounts: Record<string, number> = { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 };
    const currentCounts: Record<string, number> = {
      'w-p': 0, 'w-r': 0, 'w-n': 0, 'w-b': 0, 'w-q': 0, 'w-k': 0,
      'b-p': 0, 'b-r': 0, 'b-n': 0, 'b-b': 0, 'b-q': 0, 'b-k': 0,
    };

    board.forEach((row) => {
      row.forEach((piece) => {
        if (piece) {
          currentCounts[`${piece.color}-${piece.type}`]++;
        }
      });
    });

    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const whiteCaptured: string[] = [];
    const blackCaptured: string[] = [];

    let whiteScore = 0;
    let blackScore = 0;

    ['p', 'n', 'b', 'r', 'q'].forEach((type) => {
      const lostBlack = initialCounts[type] - currentCounts[`b-${type}`];
      for (let i = 0; i < lostBlack; i++) {
        whiteCaptured.push(type);
        whiteScore += values[type];
      }

      const lostWhite = initialCounts[type] - currentCounts[`w-${type}`];
      for (let i = 0; i < lostWhite; i++) {
        blackCaptured.push(type);
        blackScore += values[type];
      }
    });

    return {
      whiteCaptured,
      blackCaptured,
      materialDiff: whiteScore - blackScore
    };
  }, [chess, history]);

  const pieceSymbols: Record<string, string> = {
    p: '♟', n: '♞', b: '♝', r: '♜', q: '♛'
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3.5 rounded-2xl transition-all duration-300 space-y-2 pro-card text-slate-900 min-h-0 overflow-hidden">
      
      {/* Turn & Status Header */}
      <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full animate-ping ${turn === 'w' ? 'bg-amber-500' : 'bg-slate-900'}`} />
          <span className="text-xs font-bold text-slate-800">
            {gameStatus === 'checkmate'
              ? 'Xeque-Mate!'
              : chess.inCheck()
              ? '⚠️ Xeque!'
              : `Vez das ${turn === 'w' ? 'Brancas' : 'Pretas'}`}
          </span>
        </div>
        {capturedData.materialDiff !== 0 && (
          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            {capturedData.materialDiff > 0 ? `+${capturedData.materialDiff}` : capturedData.materialDiff}
          </span>
        )}
      </div>

      {/* Captured Pieces Trays */}
      <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
        {/* White Captured */}
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[9px] text-slate-500 font-semibold mb-0.5">Capturas Brancas</p>
          <div className="flex flex-wrap gap-0.5 min-h-[18px] text-xs text-slate-900">
            {capturedData.whiteCaptured.map((piece, i) => (
              <span key={i}>{pieceSymbols[piece]}</span>
            ))}
          </div>
        </div>

        {/* Black Captured */}
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[9px] text-slate-500 font-semibold mb-0.5">Capturas Pretas</p>
          <div className="flex flex-wrap gap-0.5 min-h-[18px] text-xs text-slate-700">
            {capturedData.blackCaptured.map((piece, i) => (
              <span key={i}>{pieceSymbols[piece]}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Move History Log */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-sans text-[10px] font-semibold pb-1 border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
          <History className="w-3 h-3 text-slate-700" />
          <span>Histórico</span>
        </div>

        {history.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic pt-2 text-center">Nenhuma jogada efetuada.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1">
            {Array.from({ length: Math.ceil(history.length / 2) }).map((_, idx) => {
              const whiteMove = history[idx * 2];
              const blackMove = history[idx * 2 + 1];
              return (
                <React.Fragment key={idx}>
                  <div className="flex items-center space-x-1 text-[11px]">
                    <span className="text-slate-400 text-[9px]">{idx + 1}.</span>
                    <span className="font-bold text-slate-900">{whiteMove?.san}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {blackMove ? blackMove.san : ''}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Emoji Reactions */}
      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
        <p className="text-[9px] text-slate-500 font-semibold mb-0.5 px-0.5 flex items-center gap-1">
          <Smile className="w-2.5 h-2.5 text-amber-500" />
          <span>Reações Rápidas</span>
        </p>
        <div className="flex items-center justify-between gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="p-1 rounded-lg hover:bg-slate-200 text-base transition-transform hover:scale-125 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="shrink-0 pt-0.5">
        {gameMode === 'multiplayer' && gameStatus === 'playing' ? (
          <button
            onClick={resignGame}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Desistir da Partida</span>
          </button>
        ) : (
          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Tabuleiro</span>
          </button>
        )}
      </div>
    </div>
  );
};


