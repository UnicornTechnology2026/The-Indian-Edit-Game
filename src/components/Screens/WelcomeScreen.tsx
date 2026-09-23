import React from "react";
import { useGame } from "../../context/GameContext";
import { ArrowRight, Compass } from "lucide-react";
import { sound } from "../../utils/audio";

export const WelcomeScreen: React.FC = () => {
  const { state, navigateTo } = useGame();

  const handleStart = () => {
    sound.playSuccess();
    navigateTo("screen-level-1");
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-fade-in text-center relative">
      {/* Darkened scrim with backdrop blur to heavily suppress and defuse baked-in background watermark text */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -inset-y-6 bg-linear-to-b from-black/90 via-black/80 to-black/60 backdrop-blur-xl rounded-3xl -z-10 pointer-events-none"
      />

      {/* Prologue Eyebrow */}
      <div className="inline-flex items-center gap-2 p-3 rounded-full bg-[#1a0c06]/90 border border-[#d4af37]/50 text-xs font-semibold tracking-[0.25em] text-[#f7e7a9] uppercase mb-10 shadow">
        <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>
          Welcome {state.userName ? `${state.userName}` : "to The Experience"}
        </span>
      </div>

      <h1 className="relative inline-block font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#fffaf0] tracking-[0.12em] leading-tight uppercase drop-shadow-[0_3px_12px_rgba(0,0,0,0.2)]">
        {/* High-density backdrop with backdrop blur dedicated to the heading,
            completely neutralizing background watermark text ("THE INDIAN EDIT" / "INDIA'S RICH HERITAGE") */}
        <span
          aria-hidden="true"
          className="absolute -inset-x-4 -inset-y-3 sm:-inset-x-6 sm:-inset-y-4 -z-10"
        />
        India's Rich Heritage <br />
        <span className="gold-gradient-text drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
          A Premium Blend
        </span>
      </h1>

      {/* Connecting divider — visually ties the heading to the reward card below it,
          signaling they're one grouped unit rather than two separate sections */}
      <div aria-hidden="true" className="mx-auto mt-8 h-10 w-px " />

      {/* Reward Incentive Card */}
      <div className="mt-4 p-4 sm:p-5 rounded-2xl max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 ">
        <div className="flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#f7e7a9] to-[#d4af37] text-[#070403] flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
            🎁
          </div>
          <div>
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#faf5eb]">
              Grand Finale Privilege Reward
            </h4>
            <p className="text-xs text-[#f2ead9]">
              Unlocks custom 1080p Instagram post + Gold Foil Scratch Card.
            </p>
          </div>
        </div>

        <div className="mt-2">
          <button
            onClick={handleStart}
            className="px-8 py-3.5 btn-gold text-sm font-bold inline-flex items-center justify-center gap-2 group cursor-pointer"
            aria-describedby="begin-challenge-hint"
          >
            <span>Begin Challenge 01</span>
          </button>
        </div>
      </div>
    </div>
  );
};
