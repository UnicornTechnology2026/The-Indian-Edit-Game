import React, { useEffect } from "react";
import { ParticleEffect } from "./ParticleEffect";
import { sound } from "../../utils/audio";

interface FinalResultProps {
  bottlesFound: number;
  totalBottles?: number;
  totalScore: number;
  bestTime: number;
  onOpenShare: () => void;
  onRestart: () => void;
  onContinueToGrandFinale?: () => void;
}

export const FinalResult: React.FC<FinalResultProps> = ({
  bottlesFound,
  totalBottles = 15,
  totalScore,
  bestTime,
  onContinueToGrandFinale,
}) => {
  useEffect(() => {
    sound.playCelebration();
  }, []);

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-4  sm:py-12 text-center animate-fade-in overflow-hidden">
      <ParticleEffect count={36} />

      {/* Headline */}
      <div className="relative z-10 max-w-2xl mx-auto mb-6">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-5xl font-bold tracking-[0.14em] text-[#faf5eb] uppercase leading-tight">
          YOU'RE AN <br />
          <span className="gold-gradient-text drop-shadow-[0_4px_24px_rgba(212,175,55,0.5)]">
            EDIT CHAMPION
          </span>
        </h1>
      </div>

      {/* Actual Calculated Stats Grid */}
      <div className="relative z-10 my-3 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto">
        {/* Bottles */}
        <div className="p-3 rounded-2xl bg-[#140a05]/90 border border-[#d4af37]/35 shadow-lg">
          <span className="text-[10px] font-mono tracking-widest text-[#ab9580] uppercase block">
            BOTTLES FOUND
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-bold text-[#faf5eb] mt-1 block">
            {bottlesFound} / {totalBottles}
          </span>
        </div>

        {/* Best Time */}
        <div className="p-4 rounded-2xl bg-[#140a05]/90 border border-[#d4af37]/35 shadow-lg">
          <span className="text-[10px] font-mono tracking-widest text-[#ab9580] uppercase block">
            FASTEST ROUND TIME
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-bold text-[#f7e7a9] mt-1 block">
            {bestTime > 0 ? `${bestTime.toFixed(1)}s` : "--"}
          </span>
        </div>

        {/* Total Score */}
        <div className="p-4 rounded-2xl bg-[#140a05]/90 border border-[#d4af37]/35 shadow-lg">
          <span className="text-[10px] font-mono tracking-widest text-[#ab9580] uppercase block">
            EDIT SCORE
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-bold text-[#d4af37] mt-1 block">
            {totalScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto mt-4">
        {onContinueToGrandFinale && (
          <button
            type="button"
            id="btn-continue-finale"
            onClick={() => {
              sound.playClick();
              onContinueToGrandFinale();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-linear-to-r from-[#fce588] via-[#d4af37] to-[#b68b20] text-[#1a0f07] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 group cursor-pointer shadow-lg active:scale-95 transition-transform"
          >
            <span>CLAIM REWARD</span>
          </button>
        )}
      </div>
    </div>
  );
};
