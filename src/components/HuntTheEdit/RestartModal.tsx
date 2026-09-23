import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/audio';

interface RestartModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RestartModal: React.FC<RestartModalProps> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070403]/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm p-6 rounded-3xl bg-gradient-to-b from-[#1c0e07] to-[#0a0402] border border-[#d4af37]/60 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#231208] border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-3 text-[#d4af37]">
          <RotateCcw className="w-6 h-6" />
        </div>

        <h3 className="font-serif text-xl font-bold tracking-widest text-[#faf5eb] uppercase">
          RESTART HUNT?
        </h3>

        <p className="mt-2 text-xs text-[#ebd9c0] font-light leading-relaxed">
          Your current round progress and temporary points will be reset.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="flex-1 py-3 rounded-xl border border-[#ab9580]/40 text-[#ab9580] hover:text-[#faf5eb] text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onConfirm();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f7e7a9] text-[#070403] text-xs font-bold tracking-widest uppercase shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            RESTART
          </button>
        </div>
      </div>
    </div>
  );
};
