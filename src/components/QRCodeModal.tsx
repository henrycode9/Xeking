import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useChessStore } from '../store/useChessStore';
import { X, Copy, Check, QrCode, Smartphone, Sparkles, Wifi } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const { roomId, isOpponentConnected } = useChessStore();
  const [copied, setCopied] = useState(false);

  // Auto close when opponent connects!
  useEffect(() => {
    if (isOpponentConnected && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpponentConnected, isOpen, onClose]);

  if (!isOpen) return null;

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?room=${roomId}` 
    : `https://chess.app?room=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Smartphone className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Convite Instantâneo</h2>
        <p className="mt-1 text-xs text-slate-400">
          Aponte a câmara do telemóvel para o QR Code para jogar <span className="text-blue-400 font-semibold">sem registo nem app</span>.
        </p>

        {/* QR Code Container */}
        <div className="mt-6 p-4 rounded-2xl bg-white shadow-2xl inline-block border-4 border-slate-800">
          <QRCodeSVG
            value={joinUrl}
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#020617"
          />
        </div>

        {/* Connection Status */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {isOpponentConnected ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold animate-pulse">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Convidado Conectado! A Iniciar...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-medium">
              <Wifi className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>A aguardar conexão do Convidado...</span>
            </div>
          )}
        </div>

        {/* Room Link Input & Copy */}
        <div className="mt-5 flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-white/10">
          <input
            type="text"
            readOnly
            value={joinUrl}
            className="w-full bg-transparent px-3 text-xs text-slate-300 font-mono focus:outline-none select-all truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-md shadow-blue-600/30 shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
