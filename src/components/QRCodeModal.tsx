import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useChessStore } from '../store/useChessStore';
import { X, Copy, Check, Smartphone, Wifi } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const roomId             = useChessStore((s) => s.roomId);
  const isOpponentConnected = useChessStore((s) => s.isOpponentConnected);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpponentConnected && isOpen) {
      const timer = setTimeout(onClose, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpponentConnected, isOpen, onClose]);

  if (!isOpen) return null;

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}?room=${roomId}`
      : `https://chess.app?room=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm p-7 rounded-3xl bg-white border border-zinc-200 shadow-2xl text-center overflow-hidden">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 transition-all cursor-pointer active:scale-95"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white border border-zinc-950 flex items-center justify-center shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Convite Instantâneo</h2>
        <p className="mt-1 text-xs text-zinc-500 font-medium">
          Aponte a câmara do telemóvel para o QR Code para jogar{' '}
          <span className="text-zinc-950 font-bold">sem registo nem app</span>.
        </p>

        {/* QR Code */}
        <div className="mt-5 p-3.5 rounded-2xl bg-white shadow-sm inline-block border border-zinc-200">
          <QRCodeSVG
            value={joinUrl}
            size={160}
            level="M"
            includeMargin={true}
            fgColor="#09090b"
          />
        </div>

        {/* Connection Status */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {isOpponentConnected ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Convidado Conectado!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5 text-zinc-700 animate-pulse" />
              <span>A aguardar conexão…</span>
            </div>
          )}
        </div>

        {/* Room URL + Copy */}
        <div className="mt-4 flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 border border-zinc-200">
          <input
            type="text"
            readOnly
            value={joinUrl}
            className="w-full bg-transparent px-2 text-xs text-zinc-800 font-mono focus:outline-none select-all truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /><span>Copiado!</span></>
            ) : (
              <><Copy  className="w-3.5 h-3.5" /><span>Copiar</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
