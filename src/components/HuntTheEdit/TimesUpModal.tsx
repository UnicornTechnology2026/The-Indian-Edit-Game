import React from "react";
import { RotateCcw, AlertTriangle, ArrowRight } from "lucide-react";
import { sound } from "../../utils/audio";

interface TimesUpModalProps {
  foundCount: number;
  totalCount?: number;
  onTryAgain: () => void;
  onContinue: () => void;
}

export const TimesUpModal: React.FC<TimesUpModalProps> = ({
  foundCount,
  totalCount = 5,
  onTryAgain,
  onContinue,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070403]/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#1c0d06] via-[#140804] to-[#0a0402] border border-[#e53e3e]/70 shadow-[0_20px_60px_rgba(229,62,62,0.3)] text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#8b151b]/40 border border-[#e53e3e]/50 mx-auto mb-4 flex items-center justify-center text-[#feb2b2]">
          <AlertTriangle className="w-7 h-7 text-[#e53e3e]" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-[0.14em] text-[#faf5eb] uppercase">
          TIME’S UP
        </h2>

        <p className="mt-2 text-sm text-[#ebd9c0]">
          The royal clock has struck its limit.
        </p>

        <div className="my-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0503] border border-[#d4af37]/40 text-base font-bold text-[#f7e7a9]">
          <span>YOU FOUND:</span>
          <strong className="text-xl font-mono text-[#d4af37]">
            {foundCount} / {totalCount}
          </strong>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onTryAgain();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-[#d4af37] via-[#f7e7a9] to-[#d4af37] text-[#070403] font-bold text-sm sm:text-base tracking-[0.18em] uppercase cursor-pointer shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.6)] flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-[#070403]" />
            <span>TRY AGAIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onContinue();
            }}
            className="w-full py-3 px-6 rounded-xl bg-[#140a05] border border-[#ab9580]/40 text-[#ab9580] hover:text-[#faf5eb] hover:border-[#ab9580]/80 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span>CONTINUE TO NEXT ROUND</span>
          </button>
        </div>
      </div>
    </div>
  );
};
