import React from "react";
import { motion } from "motion/react";
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
    <motion.div
      id="intro-hero-splash"
      className="fixed inset-0 z-50 overflow-hidden bg-[#070403]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.7 }}
    >
      {/* Parallax-ish image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      >
        <picture>
          <source media="(min-width: 1024px)" srcSet={fullSizeImg} />
          <img
            src={newCreativeImg}
            alt="The Indian Edit Super Premium Whisky"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
          />
        </picture>
      </motion.div>

      {/* Animated gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      {/* Floating gold particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#d4af37]"
          style={{
            left: `${8 + Math.random() * 84}%`,
            bottom: `${10 + Math.random() * 30}%`,
          }}
          animate={{
            y: [0, -80 - Math.random() * 60],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.3],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Bottom CTA */}
      <motion.div
        className="absolute bottom-0 inset-x-0 flex flex-col items-center px-4 z-10"
        style={{
          paddingBottom:
            "max(4rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          id="btn-enter-experience"
          onClick={handleStart}
          className="w-full sm:w-auto px-12 py-4 btn-gold text-sm sm:text-base font-bold tracking-[0.18em] flex items-center justify-center gap-3 cursor-pointer animate-gold-pulse"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Enter The Experience</span>
        </motion.button>

        <motion.p
          className="mt-3 text-[11px] font-mono text-[#f2ead9] tracking-[0.3em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Super Premium Whisky • Crafted in India
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
