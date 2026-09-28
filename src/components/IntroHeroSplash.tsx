import React from "react";
import { ArrowRight, X } from "lucide-react";
import { sound } from "../utils/audio";
import fullSizeImg from "../assets/images/fullSize.png";
import newCreativeImg from "../assets/images/NewCreative.png";

interface IntroHeroSplashProps {
  onEnter: () => void;
}

export const IntroHeroSplash: React.FC<IntroHeroSplashProps> = ({
  onEnter,
}) => {
  const handleStart = () => {
    sound.playSuccess();
    onEnter();
  };

  return (
    <div
      id="intro-hero-splash"
      className="fixed inset-0 z-50 overflow-hidden bg-[#070403] animate-fade-in"
    >
      {/* Full-screen image, never cropped: NewCreative on mobile/tablet, fullSize on desktop */}
      <picture>
        <source media="(min-width: 1024px)" srcSet={fullSizeImg} />
        <img
          src={newCreativeImg}
          alt="The Indian Edit Super Premium Whisky"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
        />
      </picture>

      {/* Gradient overlays for readability of top bar & CTA */}
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Bottom CTA Action Bar */}
      <div
        className="absolute bottom-0 inset-x-0 flex flex-col items-center px-4 pt-4 pb-16 sm:pb-20 z-10"
        style={{
          paddingBottom:
            "max(4rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))",
        }}
      >
        <button
          id="btn-enter-experience"
          onClick={handleStart}
          className="w-full sm:w-auto px-10 py-3.5 btn-gold text-sm sm:text-base font-bold tracking-[0.15em] flex items-center justify-center gap-3 cursor-pointer shadow-[0_8px_30px_rgba(212,175,55,0.45)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.65)] transform hover:-translate-y-0.5 transition-all"
        >
          <span>Enter The Experience</span>
        </button>

        <p className="mt-2 text-[11px] font-mono text-[#ab9580] tracking-widest uppercase drop-shadow-md">
          SUPER PREMIUM WHISKY • CRAFTED IN INDIA
        </p>
      </div>
    </div>
  );
};
