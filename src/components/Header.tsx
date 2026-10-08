import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { ScreenId } from "../types";
import {
  Sparkles,
  RotateCcw,
  KeyRound,
  Trophy,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import logo from "../assets/images/editLogo.svg";

interface HeaderProps {
  onShowIntroSplash?: () => void;
  onShowLeaderboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowLeaderboard }) => {
  const { state, navigateTo, resetGame, loadDemoState } = useGame();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems: { id: ScreenId; label: string; step: string }[] = [
    { id: "screen-login", label: "VIP Registration", step: "00" },
    { id: "screen-welcome", label: "Prologue & Story", step: "00" },
    { id: "screen-level-1", label: "Decode The Bottle", step: "01" },
    { id: "screen-level-2", label: "Master The Blend", step: "02" },
    {
      id: "screen-level-3",
      label: "Hunt The Edit (Hidden Objects)",
      step: "03",
    },
    { id: "screen-result", label: "Master Score & Archetype", step: "⭐" },
    { id: "screen-social", label: "1080p Social Post", step: "📸" },
    { id: "screen-upload", label: "Share Verification", step: "🎁" },
    { id: "screen-scratch", label: "Gold Scratch Reward", step: "🏆" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Crest & Title */}
        <button
          onClick={() => navigateTo("screen-welcome")}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          title="Return to Experience Home"
        >
          <div className="">
            <img src={logo} alt="" className="h-25 w-25" />
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Leaderboard Button */}
          {onShowLeaderboard && (
            <button
              onClick={onShowLeaderboard}
              className="px-3 py-1.5 text-xs font-medium tracking-wide flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#22160f] hover:bg-[#2e1e15] text-[#f5d77f] hover:border-[#d4af37] transition-colors shadow-sm"
              title="View Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
          )}

          {/* Admin Button */}
          <button
            onClick={() => {
              window.location.hash = "#/admin";
            }}
            className="px-3 py-1.5 text-xs font-medium tracking-wide flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#22160f] hover:bg-[#2e1e15] text-[#f5d77f] hover:border-[#d4af37] transition-colors shadow-sm"
            title="Admin Dashboard"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <div className="flex items-center bg-[#130a05] border border-[#d4af37]/30 rounded-lg px-3 py-1.5 gap-2">
            <span className="text-[10px] tracking-wider text-[#ab9580] uppercase font-bold">
              SCORE
            </span>
            <span className="font-serif text-lg font-bold text-[#f7e7a9] tabular-nums">
              {(
                state.decodeScore +
                state.blendScore +
                state.huntScore
              ).toLocaleString()}
            </span>
          </div>
          {/* Experience Jumper Menu */}
          {/* <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 text-xs font-medium tracking-wide flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#22160f] hover:bg-[#2e1e15] text-[#f5d77f] hover:border-[#d4af37] transition-colors shadow-sm"
              title="Quick Jump to any Experience or Level"
            >
              <span className="hidden sm:inline">Levels</span>
              <span className="sm:hidden text-xs">Jump</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 max-h-[75vh] overflow-y-auto rounded-xl bg-[#22160f] border border-[#d4af37]/40 shadow-2xl p-2 z-50 divide-y divide-[#3d261a]"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[10px] font-bold tracking-widest text-[#a69383] uppercase">
                  Select Experience Screen
                </div>
                <div className="py-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        state.currentScreen === item.id
                          ? "bg-[#d4af37]/20 text-[#fff1b8] font-semibold border border-[#d4af37]/40"
                          : "text-[#e5d8cb] hover:bg-[#3d261a]/60 hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] opacity-70 font-mono">
                        {item.step}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-between gap-2 px-1">
                  <button
                    onClick={loadDemoState}
                    className="text-[11px] text-[#f5d77f] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Quick Demo
                  </button>
                  <button
                    onClick={resetGame}
                    className="text-[11px] text-[#a69383] hover:text-red-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>
            )}
          </div> */}

          {/* Quick Login Link */}
          {state.currentScreen !== "screen-login" && !state.otpVerified && (
            <button
              onClick={() => navigateTo("screen-login")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a0c06] border border-[#d4af37]/40 text-xs text-[#faf5eb] hover:text-[#f7e7a9] hover:border-[#d4af37] transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
