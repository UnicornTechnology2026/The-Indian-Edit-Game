import React from "react";
import { Eye, Hand, Timer } from "lucide-react";
import { ParticleEffect } from "./ParticleEffect";
import { sound } from "../../utils/audio";

interface WelcomeScreenProps {
  onStart: () => void;
  bestScore: number;
  bestTime: number | null;
}

const instructionCards = [
  {
    number: "01",
    title: "SCAN",
    icon: Eye,
    description:
      "Carefully explore the image. Look through shelves, arches, shadows, and architectural details.",
  },
  {
    number: "02",
    title: "TAP",
    icon: Hand,
    description:
      "Tap a hidden bottle when you spot it. Precision matters: correct taps reward +10, while misses cost -5.",
  },
  {
    number: "03",
    title: "BEAT THE CLOCK",
    icon: Timer,
    description:
      "Find all 5 before time runs out. Remaining seconds turn into generous speed bonus points.",
  },
];

const cardClass =
  "p-5 sm:p-6 rounded-2xl bg-[#140a05]/85 backdrop-blur-md border border-[#d4af37]/35 " +
  "hover:border-[#d4af37]/70 transition-all duration-300 shadow-xl group";

const iconClass =
  "w-10 h-10 rounded-xl bg-[#1a0c06] border border-[#d4af37]/40 " +
  "flex items-center justify-center group-hover:scale-110 transition-transform";

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  bestScore,
  bestTime,
}) => {
  const handleStart = () => {
    sound.playClick();
    onStart();
  };

  return (
    <div className="relative min-h-[82vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 text-center animate-fade-in overflow-hidden">
      <ParticleEffect count={24} />

      {/* Main Title Hierarchy */}
      <div className="relative z-10 max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a0c06]/90 border border-[#d4af37]/50 text-xs font-semibold tracking-[0.25em] text-[#f7e7a9] uppercase shadow">
          Level 03
        </div>
        <h1 className="font-serif gold-shimmer-text text-[clamp(2rem,5.5vw,3.4rem)] sm:text-6xl md:text-7xl font-bold tracking-[0.14em] text-[#faf5eb] uppercase leading-tight">
          HUNT THE EDIT
        </h1>

        <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#f7e7a9] mt-3 font-medium">
          “Can you find all 5 The Indian Edit Bottle?”
        </p>
      </div>

      {/* Instruction Cards (replaces the bottle image) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-4 sm:my-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
        {instructionCards.map(({ number, title, icon: Icon, description }) => (
          <div key={number} className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-2xl font-bold text-[#d4af37] tracking-widest">
                {number}
              </span>
              <div className={iconClass}>
                <Icon className="w-5 h-5 text-[#d4af37]" />
              </div>
            </div>

            <h3 className="font-serif text-lg font-bold text-[#faf5eb] tracking-wide mb-2 uppercase">
              {title}
            </h3>

            <p className="text-sm text-[#ab9580] leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Large Premium Luxury CTA */}
      <div className="relative z-10 mt-4 flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          id="btn-start-the-hunt"
          onClick={handleStart}
          className="group relative px-10 py-4 rounded-xl btn-gold text-sm sm:text-base font-bold tracking-[0.2em] text-[#0d0603] uppercase cursor-pointer transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_35px_rgba(212,175,55,0.35)] hover:shadow-[0_15px_45px_rgba(212,175,55,0.55)]"
        >
          <span className="relative text-[#0d0603] font-bold">
            START THE HUNT
          </span>
        </button>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[11px] font-mono tracking-widest text-[#faf5eb] uppercase">
        <span>3 PROGRESSIVE ROUNDS</span>
        <span>•</span>
        <span>AUTHENTIC HERITAGE</span>
        <span>•</span>
        <span>TIME BONUS</span>
      </div>
    </div>
  );
};
