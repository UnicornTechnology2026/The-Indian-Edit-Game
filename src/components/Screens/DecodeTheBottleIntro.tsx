import React from "react";
import { ArrowRight } from "lucide-react";
import { sound } from "../../utils/audio";

interface DecodeTheBottleIntroProps {
  onStart: () => void;
  questionTime: number; // seconds allowed per question
  totalQuestions: number; // number of hotspots on the bottle
  pointsPerAnswer?: number;
}

export const DecodeTheBottleIntro: React.FC<DecodeTheBottleIntroProps> = ({
  onStart,
  questionTime,
  totalQuestions,
  pointsPerAnswer = 50,
}) => {
  const maxPoints = totalQuestions * pointsPerAnswer;

  const instructions: string[] = [
    `Tap the numbered pins to open all ${totalQuestions} questions and choose the correct answer.`,
    `You have ${questionTime} seconds and 1 attempt per question. Wrong answers or time-outs close it.`,
    `Earn ${pointsPerAnswer} craft points per correct answer — ${maxPoints} points max.`,
  ];

  const handleStart = () => {
    sound.playSuccess();
    onStart();
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 animate-fade-in relative">
      {/* Dark scrim to keep text readable over the background artwork */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-4 -inset-y-2 bg-linear-to-b from-black/90 via-black/80 to-black/60 backdrop-blur-xl rounded-3xl -z-10 pointer-events-none"
      />

      {/* Title block */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a0c06]/90 border border-[#d4af37]/50 text-xs font-semibold tracking-[0.25em] text-[#f7e7a9] uppercase shadow">
          Level 01
        </div>

        <h1 className="mt-6 font-serif text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-widest leading-tight gold-gradient-text drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
          Decode the Bottle
        </h1>
      </div>

      {/* Instructions */}
      <div className="gold-card mt-8 p-5 sm:p-7">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#f2ead9] tracking-wide">
          How to Play
        </h2>

        <ol className="mt-5 space-y-3.5">
          {instructions.map((text, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-[#d4af37] text-[#170f0a] text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="text-sm text-[#f2ead9] leading-relaxed">
                {text}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Start button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleStart}
          className="px-10 py-3.5 btn-gold text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start Game</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
