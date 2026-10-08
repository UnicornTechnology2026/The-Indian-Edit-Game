import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BottleLoader } from "./BottleLoader";

interface LoadingScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  durationMs = 3600,
}) => {
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");

  useEffect(() => {
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setPercent(next);

      if (next < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("reveal");
        setTimeout(() => onComplete(), 900);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070403]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {/* Soft ambient gold glow behind bottle */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-[#d4af37]/15 blur-[80px]"
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <BottleLoader
          percent={percent}
          className="h-[52vh] max-h-120 animate-soft-glow"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 font-serif text-sm tracking-[0.28em] uppercase text-[#f7e7a9]/80"
          >
            It Start Here…
          </motion.p>
        ) : (
          <motion.p
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 font-serif text-base tracking-[0.22em] uppercase gold-shimmer-text"
          >
            The Indian Edit
          </motion.p>
        )}
      </AnimatePresence>

      {/* Thin gold progress line */}
    </motion.div>
  );
};

export default LoadingScreen;
