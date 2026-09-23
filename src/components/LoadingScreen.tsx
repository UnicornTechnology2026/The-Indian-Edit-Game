import React, { useEffect, useState } from "react";
import { BottleLoader } from "./BottleLoader";

interface LoadingScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  durationMs = 9000,
}) => {
  const [percent, setPercent] = useState(0);

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
        const t = setTimeout(() => onComplete(), 500);
        return () => clearTimeout(t);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070403]">
      <BottleLoader percent={percent} className="h-[58vh] max-h-130" />
      <p className="mt-8 font-serif text-sm tracking-[0.2em] uppercase text-[#f7e7a9]/80">
        {percent < 100 ? "Pouring the edit" : "The Indian Edit"}
      </p>
    </div>
  );
};

export default LoadingScreen;
