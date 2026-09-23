import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../context/GameContext";
import {
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { sound } from "../../utils/audio";

export const OtpScreen: React.FC = () => {
  const { state, setOtpVerified, navigateTo } = useGame();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(45);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join("");

    // Accept 123456 or any 6-digit code for interactive demo flow
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      sound.playWrong();
      return;
    }

    sound.playSuccess();
    setOtpVerified(true);
    navigateTo("screen-welcome");
  };

  const autofillDemoCode = () => {
    setDigits(["1", "2", "3", "4", "5", "6"]);
    setError("");
    sound.playClick();
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 animate-fade-in">
      <div className="gold-card p-6 sm:p-8 text-center">
        {/* Crest Emblem */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-[#d4af37]/60 bg-[#2e1e15] flex items-center justify-center p-3 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
          <KeyRound className="w-7 h-7 text-[#d4af37]" />
        </div>

        <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase">
          Two-Factor Authentication
        </span>
        <h2 className="font-serif text-2xl font-bold text-[#faf6f0] mt-1">
          Enter Verification Code
        </h2>
        <p className="text-xs text-[#a69383] mt-2">
          We sent a 6-digit royal pass to <br />
          <span className="font-mono text-[#f5d77f] font-semibold">
            +91 {state.userPhone || "98765 43210"}
          </span>
        </p>

        {error && (
          <div className="mt-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* 6 Digit Inputs */}
        <form onSubmit={handleVerify} className="mt-6">
          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold text-[#fff1b8] bg-[#170f0a] border border-[#d4af37]/50 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40 outline-none transition-all shadow-inner"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 btn-gold text-sm font-bold flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Confirm & Enter Experience</span>
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={autofillDemoCode}
            className="text-xs text-[#f5d77f] hover:underline flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Use Demo Code (123456)</span>
          </button>
        </div>

        {/* Resend Timer */}
        <div className="mt-6 pt-4 border-t border-[#3d261a] text-xs text-[#a69383]">
          {timeLeft > 0 ? (
            <span>
              Resend code in{" "}
              <strong className="text-[#faf6f0]">{timeLeft}s</strong>
            </span>
          ) : (
            <button
              onClick={() => {
                setTimeLeft(45);
                sound.playClick();
              }}
              className="text-[#d4af37] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resend Royal Code</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
