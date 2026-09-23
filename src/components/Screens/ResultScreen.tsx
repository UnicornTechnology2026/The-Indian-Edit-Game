import React, { useEffect } from "react";
import { useGame } from "../../context/GameContext";
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Share2,
  Award,
  Wine,
  Compass,
  Gift,
} from "lucide-react";
import { sound } from "../../utils/audio";

export const ResultScreen: React.FC = () => {
  const { state, navigateTo } = useGame();

  useEffect(() => {
    sound.playSuccess();
  }, []);

  const personality = state.personality;

  const scoreRows = [
    {
      label: "Catch The Edit(L1)",
      score: state.scoreRush,
      max: 2000,
      icon: "🍊",
    },
    {
      label: "Mile Map (L2)",
      score: state.scoreZero,
      max: 1000,
      icon: "📍",
    },
    {
      label: "Decode The Bottle (L3)",
      score: state.decodeScore,
      max: 1000,
      icon: "🔍",
    },
    {
      label: "Blend The Edit (L4)",
      score: state.blendScore,
      max: 2000,
      icon: "🥃",
    },
    {
      label: "Hunt The Edit (L5)",
      score: state.scoreCity,
      max: 3500,
      icon: "🏛️",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      {/* Grand Archetype Hero Card */}
      <div className="gold-card p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-radial from-[#d4af37]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide text-[#faf6f0]">
          {personality ? personality.name : "THE LUXURY EDITOR"}
        </h1>

        <p className="mt-2 text-sm sm:text-base text-[#f5d77f] font-serif italic max-w-xl mx-auto">
          "
          {personality?.tagline ||
            "Where heritage meets contemporary refinement."}
          "
        </p>

        <p className="mt-4 text-xs sm:text-sm text-[#warm-beige] max-w-2xl mx-auto leading-relaxed">
          {personality?.description ||
            "Your refined palate and design eye celebrate authentic Indian heritage, blending timeless craft with forward-looking ambition."}
        </p>

        {/* Master Score Display */}
        <div className="mt-8 p-4 rounded-2xl bg-[#170f0a]/90 border border-[#d4af37]/50 max-w-md mx-auto flex items-center justify-around shadow-inner">
          <div className="text-center">
            <span className="text-[10px] text-[#a69383] uppercase tracking-wider font-bold">
              TOTAL MASTER SCORE
            </span>
            <div className="font-serif text-3xl font-bold gold-gradient-text tabular-nums mt-0.5">
              {state.totalScore > 0
                ? state.totalScore.toLocaleString()
                : (
                    state.scoreRush +
                    state.scoreZero +
                    state.decodeScore +
                    state.blendScore +
                    state.scoreCity
                  ).toLocaleString()}
            </div>
          </div>
          <div className="h-10 w-px bg-[#3d261a]" />
          <div className="text-center">
            <span className="text-[10px] text-[#a69383] uppercase tracking-wider font-bold">
              VIP STANDING
            </span>
            <div className="font-serif text-lg font-bold text-[#faf6f0] mt-1">
              Top 5% Elite
            </div>
          </div>
        </div>

        {/* Level Score Breakdown Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-left max-w-3xl mx-auto">
          {scoreRows.map((row, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#22160f] border border-[#3d261a]"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span>{row.icon}</span>
                <span className="font-mono font-bold text-[#f5d77f]">
                  {row.score}
                </span>
              </div>
              <div className="text-[10px] text-[#a69383] truncate">
                {row.label}
              </div>
              <div className="w-full h-1 bg-[#170f0a] rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-[#d4af37]"
                  style={{
                    width: `${Math.min(100, (row.score / row.max) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              navigateTo("screen-social");
            }}
            className="w-full sm:w-auto px-8 py-3.5 btn-gold text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer shadow-xl"
          >
            <Share2 className="w-4 h-4" />
            <span>Generate 1080p Social Post</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              navigateTo("screen-scratch");
            }}
            className="w-full sm:w-auto px-6 py-3.5 btn-secondary-outline text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-[#d4af37]" />
            <span>Go to Gold Scratch Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
