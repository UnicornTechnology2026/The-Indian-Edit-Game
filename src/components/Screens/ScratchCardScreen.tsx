import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../../context/GameContext";
import { REWARD_GIFTS } from "../../data/rewards";
import { Gift, Copy, Hand } from "lucide-react";
import { sound } from "../../utils/audio";
import { ScratchReveal } from "../ScratchCard/ScratchReveal";
import bannerShape from "../../assets/images/banner-shape.png";
import bannerTop from "../../assets/images/banner-top.webp";
import logo from "../../assets/images/editLogo.svg";

// Same hit-area as the diamond artwork (tips sit ~1.6% inside the square).
const DIAMOND_CLIP = "polygon(50% 1.6%, 98.4% 50%, 50% 98.4%, 1.6% 50%)";

// Golden sunflower emblem (same artwork as the card cover) drawn as SVG so it
// stays crisp at any size. Petals + dot ring are generated, not hand-placed.
const SunflowerEmblem: React.FC = () => {
  const petals = Array.from({ length: 32 }, (_, i) => i * (360 / 32));
  const dots = Array.from({ length: 32 }, (_, i) => i * (360 / 32) + 360 / 64);
  return (
    <svg viewBox="-100 -100 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="petalGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="0.55" stopColor="#F2B731" />
          <stop offset="1" stopColor="#D9961A" />
        </linearGradient>
        <radialGradient id="discGold" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#FFD768" />
          <stop offset="0.6" stopColor="#E8A92A" />
          <stop offset="1" stopColor="#B87912" />
        </radialGradient>
      </defs>
      {dots.map((a) => (
        <circle
          key={`d${a}`}
          cx="0"
          cy="-93"
          r="2.6"
          fill="#F6C945"
          transform={`rotate(${a})`}
        />
      ))}
      {petals.map((a) => (
        <ellipse
          key={`p${a}`}
          cx="0"
          cy="-62"
          rx="6.4"
          ry="22"
          fill="url(#petalGold)"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r="42" fill="url(#discGold)" stroke="#9A6410" strokeWidth="1.5" />
      <circle
        r="29"
        fill="none"
        stroke="#FFF1C2"
        strokeOpacity="0.75"
        strokeWidth="1.4"
      />
      <circle r="17" fill="#E9782A" />
      <circle r="8" fill="#FFD768" />
    </svg>
  );
};

export const ScratchCardScreen: React.FC = () => {
  const { state, setScratchRevealed } = useGame();
  const [started, setStarted] = useState(false);
  const [shape, setShape] = useState<HTMLImageElement | null>(null);
  const [copied, setCopied] = useState(false);

  const gift = state.selectedGift || REWARD_GIFTS[0];
  const freeMl = gift.freeMl;
  const rewardDesc = gift.desc;
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
          className="absolute inset-[12%] pointer-events-none rounded-full"
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
                {/* Reward — sits below the elephant */}
                <div className="absolute inset-x-0 top-[24%] h-[46%] flex flex-col items-center justify-center text-center">
                  {/* Your Reward */}
                  <div className="font-['Poppins',sans-serif] uppercase text-[#f3dca4]/90 text-[2.9cqw] tracking-[0.32em]">
                    Your Reward
                  </div>

                  {/* Free 20 ML */}
                  <div className="mt-[1.6cqw] font-['Playfair_Display',serif] font-semibold uppercase leading-[1.05] text-[#E2C878] text-[9.5cqw] [text-shadow:0_2px_6px_rgba(60,0,0,0.55)]">
                    Free {freeMl} ML
                  </div>

                  {/* Description from rewards.ts */}
                  <p className="mt-[3.2cqw] w-[78%] font-['Playfair_Display',serif] font-bold leading-snug text-[#F0D58A] text-[3.3cqw] [text-shadow:0_1px_3px_rgba(60,0,0,0.5)]">
                    {gift.desc}
                  </p>

                  {/* Divider */}
                  <div className="mt-[2.4cqw] h-px w-[34%] bg-linear-to-r from-transparent via-[#E2C878] to-transparent" />
                </div>
              </div>
            </ScratchReveal>

            {/* Spinning sunflower at the bottom tip — always visible */}
            <motion.div
              className="absolute left-1/2 pointer-events-none"
              style={{
                top: "79.5%",
                width: "14%",
                aspectRatio: "1 / 1",
                x: "-50%",
              }}
            >
              <motion.div
                className="w-full h-full"
                style={{ filter: "drop-shadow(0 1px 2px rgba(60,0,0,0.5))" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <SunflowerEmblem />
              </motion.div>
            </motion.div>

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
