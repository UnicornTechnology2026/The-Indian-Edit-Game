import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { sound } from "../utils/audio";
import bannerShape from "../assets/images/banner-shape.png";
import bannerTop from "../assets/images/banner-top.webp";

interface AgeGateModalProps {
  onEnter: () => void;
}

/** Gold rosette drawn in SVG (bottom ornament of the diamond). */
function Rosette({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 24 }, (_, i) => i * 15);
  const dots = Array.from({ length: 24 }, (_, i) => i * 15 + 7.5);

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="rosetteGold" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FFE9A0" />
          <stop offset="55%" stopColor="#E9A92B" />
          <stop offset="100%" stopColor="#A86A12" />
        </radialGradient>
      </defs>
      <g fill="url(#rosetteGold)">
        {petals.map((a) => (
          <ellipse
            key={a}
            cx="50"
            cy="14"
            rx="3.2"
            ry="11"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
        {dots.map((a) => (
          <circle
            key={a}
            cx="50"
            cy="4"
            r="2"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="24" />
      </g>
      <circle
        cx="50"
        cy="50"
        r="24"
        fill="none"
        stroke="#8A520C"
        strokeWidth="1"
      />
      <circle
        cx="50"
        cy="50"
        r="15"
        fill="none"
        stroke="#FFE9A0"
        strokeWidth="1.2"
      />
      <circle cx="50" cy="50" r="9" fill="#E27A1E" />
      <circle cx="50" cy="50" r="4" fill="#FFD36B" />
    </svg>
  );
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onEnter }) => {
  const reduce = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  // lock page scroll while the gate is visible
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleEnter = () => {
    if (leaving) return;
    sound.playSuccess();
    setLeaving(true); // play exit animation, then call onEnter (see onAnimationComplete)
  };

  // Backdrop: fades in, then staggers the children
  const backdrop: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.5, when: "beforeChildren" },
    },
    exit: { opacity: 0, transition: { duration: 0.6, delay: 0.15 } },
  };

  // Diamond: scales + unfolds in, then staggers its content
  const diamond: Variants = {
    hidden: {
      opacity: 0,
      scale: reduce ? 1 : 0.55,
      rotate: reduce ? 0 : -10,
    },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 16,
        staggerChildren: 0.14,
        delayChildren: 0.35,
      },
    },
    exit: {
      opacity: 0,
      scale: reduce ? 1 : 1.12,
      transition: { duration: 0.5, ease: EASE },
    },
  };

  const rise: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const drop: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : -26, scale: reduce ? 1 : 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: EASE },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const spinIn: Variants = {
    hidden: { opacity: 0, scale: 0, rotate: reduce ? 0 : -180 },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 1, ease: EASE },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-60 flex items-center justify-center overflow-hidden bg-[#070403]/95 p-4"
      variants={backdrop}
      initial="hidden"
      animate={leaving ? "exit" : "show"}
      onAnimationComplete={(def) => {
        if (def === "exit") onEnter();
      }}
    >
      {/* Soft gold glow breathing behind the diamond */}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto aspect-square w-[min(125vw,125vh,800px)] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.28)_0%,rgba(163,21,27,0.18)_35%,transparent_68%)]"
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.96, 1.06, 0.96] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Diamond. Everything inside is sized in cqw so it scales with the banner. */}
      <motion.div
        className="relative aspect-square w-[min(92vw,92vh,640px)] @container"
        variants={diamond}
      >
        <img
          src={bannerShape}
          alt=""
          className="absolute inset-0 h-full w-full select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          draggable={false}
        />

        {/* One-time gold glint sweeping across the diamond */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[6%] overflow-hidden [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]"
          >
            <motion.div
              className="absolute inset-y-0 w-1/4 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent"
              initial={{ left: "-30%" }}
              animate={{ left: "130%" }}
              transition={{ delay: 1.3, duration: 1.4, ease: "easeInOut" }}
            />
          </motion.div>
        )}

        <div className="absolute inset-0 flex flex-col items-center pt-[11%] text-center">
          <motion.img
            variants={drop}
            src={bannerTop}
            alt="Elephant balancing on a ball above a golden scroll"
            className="w-[36%] select-none"
            draggable={false}
          />

          <motion.h1
            variants={rise}
            id="age-gate-title"
            className="mt-[4.5cqw] font-['Playfair_Display',serif] text-[5.6cqw] font-semibold uppercase leading-[1.1] text-[#E2C878]"
          >
            I'm of
            <br />
            legal drinking age
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-[2.4cqw] w-[46%] font-['Poppins',sans-serif] text-[3cqw] font-normal leading-[1.45] text-white"
          >
            By entering this site, you agree to our terms &amp; conditions,
            privacy policy and other directives.
          </motion.p>

          <motion.div variants={rise} className="mt-[4cqw]">
            <motion.button
              type="button"
              onClick={handleEnter}
              className="cursor-pointer rounded-full border border-[#D9AE5A]/60 bg-[#A3151B]/40 px-[7.5cqw] py-[1.8cqw] font-['Playfair_Display',serif] text-[4.6cqw] font-semibold text-[#E2C878] transition-colors duration-200 hover:bg-[#E2C878] hover:text-[#8E1017] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2C878]"
              whileHover={reduce ? undefined : { scale: 1.06 }}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              animate={
                reduce
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0 0 rgba(226,200,120,0)",
                        "0 0 18px 3px rgba(226,200,120,0.4)",
                        "0 0 0 0 rgba(226,200,120,0)",
                      ],
                    }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Enter
            </motion.button>
          </motion.div>

          <motion.div variants={spinIn} className="mt-[3.2cqw] w-[10%]">
            <motion.div
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <Rosette className="w-full" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgeGateModal;
