import React from "react";
import { ParticleEffect } from "./ParticleEffect";
import { sound } from "../../utils/audio";
import NewBottle from "../../assets/images/NewBottle.png";

interface WelcomeScreenProps {
  onStart: () => void;
  bestScore: number;
  bestTime: number | null;
}

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
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.14em] text-[#faf5eb] uppercase leading-tight">
          HUNT THE{" "}
          <span className="gold-gradient-text drop-shadow-[0_4px_24px_rgba(212,175,55,0.4)]">
            EDIT
          </span>
        </h1>

        <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#f7e7a9] mt-3 font-medium">
          “Can you find all 5 The Indian Edit Bottle?”
        </p>
      </div>

      {/* Hero Visual: The authentic supplied bottle image */}
      <div className="relative z-10 my-4 sm:my-6 group flex justify-center">
        <div className="">
          {/* Subtle Ambient Halo */}
          <div className="absolute inset-0 rounded-2xl bg-radial from-[#d4af37]/15 to-transparent blur-xl pointer-events-none" />

          <img
            id="hunt-hero-bottle"
            src={NewBottle}
            alt="The Indian Edit Super Premium Whisky Bottle"
            className="h-56 sm:h-64 md:h-72 w-auto object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Large Premium Luxury CTA */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          id="btn-start-the-hunt"
          onClick={handleStart}
          className="group relative px-10 py-4 rounded-xl bg-linear-to-b from-[#1c0e07] to-[#0a0402] border border-[#d4af37] text-sm sm:text-base font-bold tracking-[0.2em] text-[#faf5eb] uppercase cursor-pointer shadow-[0_10px_35px_rgba(212,175,55,0.35)] hover:shadow-[0_15px_45px_rgba(212,175,55,0.55)] hover:border-[#fff3c4] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 text-[#fff3c4] group-hover:text-[#ffffff]">
            START THE HUNT
          </span>
        </button>
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-6 text-[11px] font-mono tracking-widest text-[#faf5eb] uppercase">
        <span>3 PROGRESSIVE ROUNDS</span>
        <span>•</span>
        <span>AUTHENTIC HERITAGE</span>
        <span>•</span>
        <span>TIME BONUS</span>
      </div>
    </div>
  );
};
