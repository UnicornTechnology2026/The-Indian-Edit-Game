import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../../context/GameContext";
import { REWARD_GIFTS } from "../../data/rewards";
import { Gift, Copy, Hand } from "lucide-react";
import { sound } from "../../utils/audio";
import { ScratchReveal } from "../ScratchCard/ScratchReveal";
import bannerShape from "../../assets/images/banner-shape.png";
import bannerTop from "../../assets/images/banner-top.webp";

// Same hit-area as the diamond artwork (tips sit ~1.6% inside the square).
const DIAMOND_CLIP = "polygon(50% 1.6%, 98.4% 50%, 50% 98.4%, 1.6% 50%)";

export const ScratchCardScreen: React.FC = () => {
  const { state, setScratchRevealed } = useGame();
  const [started, setStarted] = useState(false);
  const [shape, setShape] = useState<HTMLImageElement | null>(null);
  const [copied, setCopied] = useState(false);

  const gift = state.selectedGift || REWARD_GIFTS[0];
  const freeMl = gift.freeMl ?? 30;
  const voucherCode = `EDIT-NGP-${(state.userPhone || "7892").slice(-4)}-ROYAL`;

  // Preload the red diamond so the scratch foil is painted with the exact
  // same image (identical colour, grain and stitched border).
  useEffect(() => {
    const img = new Image();
    img.onload = () => setShape(img);
    img.src = bannerShape;
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(voucherCode);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="max-w-xl mx-auto py-3 px-4 sm:px-6 animate-fade-in text-center overflow-hidden">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2e1e15] border border-[#d4af37]/40 text-xs text-[#f5d77f] mb-2">
        <Gift className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>GRAND FINALE PRIVILEGE</span>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text">
        Scratch &amp; Reveal
      </h2>

      <p className="text-xs text-[#f2ead9] mt-1 max-w-sm mx-auto">
        Rub the gold foil on the diamond to reveal your free whisky coupon.
      </p>

      {/* The scratch card — a square box that holds the diamond */}
      <div
        className="relative mx-auto mt-3 aspect-square"
        // Sized from the viewport height (header + title + padding ≈ 250px)
        // so the whole screen fits without a page scrollbar.
        style={{
          width: "min(92vw, calc(100svh - 250px), 520px)",
          minWidth: "260px",
          containerType: "inline-size",
        }}
      >
        {/* Soft gold glow behind the diamond */}
        <motion.div
          aria-hidden
          className="absolute -inset-[12%] pointer-events-none rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.28) 0%, rgba(163,21,27,0.18) 35%, transparent 68%)",
          }}
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.97, 1.05, 0.97] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="relative w-full h-full"
          style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))" }}
        >
          {/* Diamond shape (mask) + hit-area (clip-path) for foil and card */}
          <div
            className="w-full h-full relative"
            style={{
              clipPath: DIAMOND_CLIP,
              WebkitMaskImage: `url(${bannerShape})`,
              maskImage: `url(${bannerShape})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          >
            <ScratchReveal
              revealed={state.scratchRevealed}
              onReveal={() => setScratchRevealed(true)}
              onScratchStart={() => setStarted(true)}
              variant="image"
              coverImage={shape}
              coverTitle="SCRATCH TO REVEAL"
              coverSubtitle="YOUR REWARD"
              coverTextY={0.58}
              brushSize={44}
              className="w-full h-full"
            >
              {/* The card: red diamond with the reward below the elephant */}
              <div className="w-full h-full relative">
                <img
                  src={bannerShape}
                  alt=""
                  className="absolute inset-0 w-full h-full select-none pointer-events-none"
                  draggable={false}
                />

                {/* Reward — sits below the elephant */}
                <div
                  className="absolute left-0 right-0 flex flex-col items-center justify-center text-center"
                  style={{ top: "34%", height: "46%" }}
                >
                  <div
                    className="font-['Poppins',sans-serif] uppercase text-[#f3dca4]/90"
                    style={{ fontSize: "2.9cqw", letterSpacing: "0.32em" }}
                  >
                    Your Reward
                  </div>
                  <div
                    className="mt-[1.6cqw] font-['Playfair_Display',serif] font-semibold uppercase leading-[1.05] text-[#E2C878]"
                    style={{
                      fontSize: "9.5cqw",
                      textShadow: "0 2px 6px rgba(60,0,0,0.55)",
                    }}
                  >
                    Free {freeMl} ML
                  </div>
                  <div
                    className="my-[2.4cqw] h-px w-[34%]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #E2C878, transparent)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-[1.2cqw] cursor-pointer rounded-full border border-[#D9AE5A]/60 bg-[#A3151B]/40 font-['Poppins',sans-serif] font-medium tracking-wide text-[#fff3df] hover:bg-[#E2C878] hover:text-[#8E1017] transition-colors"
                    style={{ fontSize: "3.1cqw", padding: "1.4cqw 3.6cqw" }}
                  >
                    <Copy style={{ width: "1.15em", height: "1.15em" }} />
                    <span>{copied ? "Copied!" : voucherCode}</span>
                  </button>
                </div>
              </div>
            </ScratchReveal>

            {/* Elephant — always visible, sits on top of the foil */}
            <img
              src={bannerTop}
              alt="Elephant balancing on a ball above a golden scroll"
              className="absolute left-1/2 -translate-x-1/2 w-[36%] select-none pointer-events-none"
              style={{ top: "11%" }}
              draggable={false}
            />
          </div>
        </div>

        {/* Hint — fades out as soon as the customer starts scratching */}
        <AnimatePresence>
          {!state.scratchRevealed && !started && (
            <motion.div
              className="absolute inset-x-0 flex justify-center pointer-events-none"
              style={{ top: "72%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2a0d05]/80 border border-[#ffe1c3]/50 text-[9px] font-bold tracking-widest text-[#fff3df] uppercase backdrop-blur-sm"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Hand className="w-3.5 h-3.5 text-[#f1d3b0]" />
                Scratch here
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
