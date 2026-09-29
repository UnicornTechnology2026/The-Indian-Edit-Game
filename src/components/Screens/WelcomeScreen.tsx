import React from "react";
import { motion, type Variants } from "motion/react";
import { useGame } from "../../context/GameContext";
import { Compass, Gift } from "lucide-react";
import { sound } from "../../utils/audio";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const WelcomeScreen: React.FC = () => {
  const { state, navigateTo } = useGame();

  const handleStart = () => {
    sound.playSuccess();
    navigateTo("screen-level-1");
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6 text-center relative"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Soft scrim to suppress background watermark */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -inset-y-6 bg-linear-to-b from-black/90 via-black/80 to-black/60 backdrop-blur-xl rounded-3xl -z-10 pointer-events-none"
      />

      {/* Welcome eyebrow */}
      <motion.div
        variants={item}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1a0c06]/90 border border-[#d4af37]/45 text-xs font-semibold tracking-[0.25em] text-[#f7e7a9] uppercase mb-10 shadow-lg"
      >
        <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>
          Welcome {state.userName ? state.userName : "to The Experience"}
        </span>
      </motion.div>

      {/* Main heading */}
      <motion.h1
        variants={item}
        className="relative inline-block font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#fffaf0] tracking-widest leading-tight uppercase drop-shadow-[0_3px_12px_rgba(0,0,0,0.2)]"
      >
        India's Rich Heritage
        <br />
        <span className="gold-shimmer-text drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
          A Premium Blend
        </span>
      </motion.h1>

      {/* Reward incentive card */}
      <motion.div
        variants={item}
        className="mt-6 p-5 sm:p-6 rounded-2xl max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 "
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#f7e7a9] to-[#d4af37] text-[#070403] flex items-center justify-center shadow-lg shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-[#faf5eb]">
              Grand Finale Privilege Reward
            </h4>
            <p className="text-xs text-[#f2ead9] mt-0.5">
              Custom 1080p Instagram post + Gold Foil Scratch Card
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleStart}
          className="px-9 py-3.5 btn-gold text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          aria-describedby="begin-challenge-hint"
        >
          <span>Begin Challenge 01</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
