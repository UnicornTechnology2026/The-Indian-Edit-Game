import React from "react";
import { useGame } from "../../context/GameContext";
import { ScreenId } from "../../types";
import {
  X,
  Sparkles,
  RotateCcw,
  Award,
  CheckCircle,
  Database,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    state,
    navigateTo,
    resetGame,
    loadDemoState,
    updateRushScore,
    updateZeroScore,
  } = useGame();

  if (!isOpen) return null;

  const screens: { id: ScreenId; label: string }[] = [
    { id: "screen-login", label: "1. Login / Register" },
    { id: "screen-otp", label: "2. OTP Verification" },
    { id: "screen-welcome", label: "3. Story Prologue" },
    { id: "screen-level-1", label: "4. Level 1: Decode The Bottle" },
    { id: "screen-level-2", label: "5. Level 2: Blend The Edit" },
    { id: "screen-level-3", label: "6. Level 3: Hunt the Edit" },
    { id: "screen-result", label: "7. Master Personality Result" },
    { id: "screen-social", label: "8. 1080p Social Post Creator" },
    { id: "screen-upload", label: "9. Share Proof Upload" },
    { id: "screen-scratch", label: "10. Gold Scratch Card" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#22160f] border border-[#d4af37]/50 shadow-2xl p-6 text-[#faf6f0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#3d261a]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-serif text-xl font-bold text-[#faf6f0]">
              Experience Control & Demo Hub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a69383] hover:text-[#faf6f0] hover:bg-[#3d261a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {/* Quick Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3">
              Quick Presets
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  loadDemoState();
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#2e1e15] border border-[#d4af37]/40 hover:border-[#d4af37] text-left hover:bg-[#3d261a] transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f5d77f]">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>Load Full Demo</span>
                </div>
                <p className="text-[11px] text-[#a69383] mt-1">
                  Sets complete scores across all 5 levels and reveals
                  archetype.
                </p>
              </button>

              <button
                onClick={() => {
                  resetGame();
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#2e1e15] border border-red-900/40 hover:border-red-500 text-left hover:bg-[#3d261a] transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear & Reset State</span>
                </div>
                <p className="text-[11px] text-[#a69383] mt-1">
                  Clears local storage and resets player back to start.
                </p>
              </button>
            </div>
          </div>

          {/* Screen Jumper */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3">
              Direct Screen Navigation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {screens.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    navigateTo(s.id);
                    onClose();
                  }}
                  className={`p-2 rounded-lg text-xs text-left transition-colors border ${
                    state.currentScreen === s.id
                      ? "bg-[#d4af37]/25 text-[#fff1b8] border-[#d4af37] font-semibold"
                      : "bg-[#1a110a] text-[#e5d8cb] border-[#3d261a] hover:border-[#d4af37]/40 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Score Boost */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3">
              Score Modifiers
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateRushScore(12, 1600, 200)}
                className="px-3 py-1.5 rounded-lg bg-[#2e1e15] border border-[#d4af37]/30 hover:border-[#d4af37] text-xs text-[#e5d8cb]"
              >
                +1600 Rush Score
              </button>
              <button
                onClick={() => updateZeroScore(980, { x: 380, y: 440 })}
                className="px-3 py-1.5 rounded-lg bg-[#2e1e15] border border-[#d4af37]/30 hover:border-[#d4af37] text-xs text-[#e5d8cb]"
              >
                +980 Zero Mile Score
              </button>
            </div>
          </div>

          {/* Current State Inspector */}
          <div className="p-4 rounded-xl bg-[#170f0a] border border-[#3d261a] text-xs space-y-1 font-mono">
            <div className="text-[#a69383] font-bold flex items-center gap-1.5 mb-2">
              <Database className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>LIVE STATE TELEMETRY</span>
            </div>
            <div>
              Player:{" "}
              <span className="text-[#f5d77f]">
                {state.userName || "Anonymous"}
              </span>
            </div>
            <div>
              City:{" "}
              <span className="text-[#f5d77f]">
                {state.userCity || "Not set"}
              </span>
            </div>
            <div>
              Current Screen:{" "}
              <span className="text-[#ff9933]">{state.currentScreen}</span>
            </div>
            <div>
              Total Score:{" "}
              <span className="text-[#fff1b8]">{state.totalScore}</span>
            </div>
            <div>
              Archetype:{" "}
              <span className="text-[#f5d77f]">
                {state.personality?.name || "Pending reveal"}
              </span>
            </div>
            <div>
              Reward Selected:{" "}
              <span className="text-[#f5d77f]">
                {state.selectedGift?.name || "Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#d4af37] text-[#170f0a] font-semibold text-xs hover:bg-[#f5d77f] transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
