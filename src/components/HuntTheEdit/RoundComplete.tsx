import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { ParticleEffect } from "./ParticleEffect";
import { sound } from "../../utils/audio";

interface RoundCompleteProps {
  roundNumber: number;
  timeLeft: number;
  roundScore: number;
  totalScore: number;
  onNextRound: () => void;
}

export const RoundComplete: React.FC<RoundCompleteProps> = ({
  roundNumber,
  timeLeft,
  roundScore,
  totalScore,
  onNextRound,
}) => {
  const handleNext = () => {
    sound.playClick();
    onNextRound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070403]/90 backdrop-blur-md animate-fade-in">
      <ParticleEffect count={30} />

      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#1c0d06] via-[#140804] to-[#0a0402] border border-[#d4af37] shadow-[0_20px_60px_rgba(212,175,55,0.4)] text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-[0.14em] text-[#faf5eb] uppercase">
          ROUND COMPLETE
        </h2>

        <div className="my-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0a0503] border border-[#d4af37]/40 text-sm font-bold text-[#d4af37]">
          <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
          <span>5 / 5 BOTTLES FOUND</span>
        </div>

        {/* Stats Grid */}
        <div className="my-6 grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0e0603]/80 border border-[#d4af37]/30">
          <div className="text-left border-r border-[#d4af37]/20 pr-3">
            <span className="text-[10px] font-mono tracking-widest text-[#ab9580] uppercase block">
              TIME REMAINING
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#faf5eb]">
              {timeLeft.toFixed(1)}s
            </span>
            <span className="text-[10px] text-[#d4af37] block mt-0.5">
              +{Math.round(timeLeft * 100)} speed bonus
            </span>
          </div>

          <div className="text-left pl-3">
            <span className="text-[10px] font-mono tracking-widest text-[#ab9580] uppercase block">
              ROUND SCORE
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#f7e7a9]">
              {roundScore.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#ab9580] block mt-0.5">
              Total: {totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="btn-next-round"
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-[#d4af37] via-[#f7e7a9] to-[#d4af37] text-[#070403] font-bold text-sm sm:text-base tracking-[0.18em] uppercase cursor-pointer shadow-[0_8px_25px_rgba(212,175,55,0.5)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.7)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          <span>{roundNumber < 3 ? "NEXT ROUND" : "SEE FINAL RESULTS"}</span>
        </button>
      </div>
    </div>
  );
};
