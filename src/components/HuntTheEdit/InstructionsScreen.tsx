import React from "react";
import { Eye, Hand, Timer, ArrowRight, ShieldCheck } from "lucide-react";
import { sound } from "../../utils/audio";

interface InstructionsScreenProps {
  onStartRoundOne: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
  onStartRoundOne,
}) => {
  const handleStart = () => {
    sound.playClick();
    onStartRoundOne();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 animate-fade-in text-center">
      <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-[0.12em] text-[#faf5eb] uppercase">
        HUNT THE <span className="gold-gradient-text">EDIT</span>
      </h1>

      {/* 3 Instruction Cards — gap from title above: mt-10 (mobile) / sm:mt-16 (desktop) */}
      <div className="mt-20 sm:mt-32 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
        {/* Card 01 */}
        <div className="p-6 rounded-2xl bg-[#140a05]/85 backdrop-blur-md border border-[#d4af37]/35 hover:border-[#d4af37]/70 transition-all duration-300 shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-2xl font-bold text-[#d4af37] tracking-widest">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#1a0c06] border border-[#d4af37]/40 flex items-center justify-center text-[#f7e7a9] group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5 text-[#d4af37]" />
            </div>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#faf5eb] tracking-wide mb-2 uppercase">
            SCAN
          </h3>
          <p className="text-sm text-[#ab9580] leading-relaxed">
            Carefully explore the image. Look through shelves, arches, shadows,
            and architectural details.
          </p>
        </div>

        {/* Card 02 */}
        <div className="p-6 rounded-2xl bg-[#140a05]/85 backdrop-blur-md border border-[#d4af37]/35 hover:border-[#d4af37]/70 transition-all duration-300 shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-2xl font-bold text-[#d4af37] tracking-widest">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#1a0c06] border border-[#d4af37]/40 flex items-center justify-center text-[#f7e7a9] group-hover:scale-110 transition-transform">
              <Hand className="w-5 h-5 text-[#d4af37]" />
            </div>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#faf5eb] tracking-wide mb-2 uppercase">
            TAP
          </h3>
          <p className="text-sm text-[#ab9580] leading-relaxed">
            Tap a hidden bottle when you spot it. Precision matters: correct
            taps reward +1000, while misses cost -100.
          </p>
        </div>

        {/* Card 03 */}
        <div className="p-6 rounded-2xl bg-[#140a05]/85 backdrop-blur-md border border-[#d4af37]/35 hover:border-[#d4af37]/70 transition-all duration-300 shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-2xl font-bold text-[#d4af37] tracking-widest">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#1a0c06] border border-[#d4af37]/40 flex items-center justify-center text-[#f7e7a9] group-hover:scale-110 transition-transform">
              <Timer className="w-5 h-5 text-[#d4af37]" />
            </div>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#faf5eb] tracking-wide mb-2 uppercase">
            BEAT THE CLOCK
          </h3>
          <p className="text-sm text-[#ab9580] leading-relaxed">
            Find all 5 before time runs out. Remaining seconds turn into
            generous speed bonus points (+100/sec).
          </p>
        </div>
      </div>

      {/* Primary CTA — gap from cards above: mt-10 (mobile) / sm:mt-16 (desktop) */}
      <div className="mt-10 sm:mt-24">
        <button
          type="button"
          id="btn-start-round-1"
          onClick={handleStart}
          className="px-10 py-4 rounded-xl bg-linear-to-b from-[#1c0e07] to-[#0a0402] border border-[#d4af37] text-sm sm:text-base font-bold tracking-[0.2em] text-[#faf5eb] uppercase cursor-pointer shadow-[0_10px_35px_rgba(212,175,55,0.35)] hover:shadow-[0_15px_45px_rgba(212,175,55,0.55)] hover:border-[#fff3c4] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 inline-flex items-center justify-center gap-3"
        >
          <span className="text-[#fff3c4]">START ROUND 1</span>
        </button>
      </div>
    </div>
  );
};
