import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { CheckCircle2, RotateCcw, Flame } from "lucide-react";
import { sound } from "../../utils/audio";

interface Ingredient {
  id: string;
  name: string;
  region: string;
  notes: string;
  color: string;
  targetRatio: number; // percentage required
}

const INGREDIENTS: Ingredient[] = [
  {
    id: "orange",
    name: "Nagpur Orange Botanical Zest",
    region: "Zero Mile Orchards",
    notes: "Vibrant citrus high notes & sunshine clarity",
    color: "#ff9933",
    targetRatio: 30,
  },
  {
    id: "malt",
    name: "Indian Single Malt Cask",
    region: "Heritage Stills",
    notes: "Rich honeyed malt, dark raisins & spiced wood",
    color: "#d4af37",
    targetRatio: 40,
  },
  {
    id: "peat",
    name: "Peated Highland Smoke",
    region: "Artisanal Hearth",
    notes: "Subtle aromatic ember and earthy depth",
    color: "#8a671a",
    targetRatio: 15,
  },
  {
    id: "oak",
    name: "French Virgin Oak Finish",
    region: "Cellar Vaults",
    notes: "Velvety vanilla tannins & toasted brioche",
    color: "#b84a20",
    targetRatio: 15,
  },
];

export const Level2MasterTheBlend: React.FC = () => {
  const { state, updateBlendScore, navigateTo } = useGame();

  const [viewMode, setViewMode] = useState<"iframe" | "native">("iframe");
  const [blendPoured, setBlendPoured] = useState<{ [id: string]: number }>({
    orange: 0,
    malt: 0,
    peat: 0,
    oak: 0,
  });
  const [timerSeconds, setTimerSeconds] = useState(25.0);
  const [isBlended, setIsBlended] = useState(state.blendCompleted);
  const [feedback, setFeedback] = useState("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // PostMessage listener from embedded master-the-blend iframe
  useEffect(() => {
    const handleBlendMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (
        data.source === "master-the-blend" &&
        data.type === "ROUND_COMPLETE"
      ) {
        const score = data.score || 1650;
        const base = data.baseScore || 1000;
        const speedBonus = data.speedBonus || 650;
        const attempts = data.incorrectAttempts || 0;
        const completed = !!data.isVictory;

        updateBlendScore(score, base, speedBonus, attempts, completed);
        setIsBlended(true);
        sound.playSuccess();
      }

      // "Proceed to Level 05" button on the iframe's result page
      if (
        event.origin === window.location.origin &&
        data.source === "master-the-blend" &&
        data.type === "PROCEED_TO_LEVEL_5"
      ) {
        sound.playSuccess();
        navigateTo("screen-level-3");
      }
    };

    window.addEventListener("message", handleBlendMessage);
    return () => window.removeEventListener("message", handleBlendMessage);
  }, []);

  // Timer for native mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewMode === "native" && timerSeconds > 0 && !isBlended) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, +(prev - 0.1).toFixed(1)));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [viewMode, timerSeconds, isBlended]);

  const handlePour = (id: string) => {
    if (isBlended) return;
    sound.playClick();
    setBlendPoured((prev) => {
      const current = prev[id] || 0;
      const total = (Object.values(prev) as number[]).reduce(
        (a: number, b: number) => a + b,
        0,
      );
      if (total >= 100) return prev;
      return { ...prev, [id]: Math.min(60, current + 10) };
    });
  };

  const handleResetPour = () => {
    setBlendPoured({ orange: 0, malt: 0, peat: 0, oak: 0 });
    setFeedback("");
    sound.playClick();
  };

  const handleVerifyNativeBlend = () => {
    const total = (Object.values(blendPoured) as number[]).reduce(
      (a: number, b: number) => a + b,
      0,
    );
    if (total < 90) {
      setFeedback("Fill the tasting glass to at least 90% capacity.");
      sound.playWrong();
      return;
    }

    // Check accuracy against target ratios
    let errorDiff = 0;
    INGREDIENTS.forEach((ing) => {
      const poured = blendPoured[ing.id] || 0;
      errorDiff += Math.abs(poured - ing.targetRatio);
    });

    const speedBonus = Math.round(timerSeconds * 30);
    const baseScore = Math.max(500, 1000 - errorDiff * 8);
    const finalScore = baseScore + speedBonus;

    sound.playSuccess();
    setIsBlended(true);
    updateBlendScore(finalScore, baseScore, speedBonus, 0, true);
    setFeedback(`Master Blend Achieved! Precision Score: ${finalScore} pts!`);
  };

  const totalPoured = (Object.values(blendPoured) as number[]).reduce(
    (a: number, b: number) => a + b,
    0,
  );

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* Main Game Stage */}
      {viewMode === "iframe" ? (
        <div className="p-4 overflow-hidden relative">
          <div className="w-full h-155 rounded-xl overflow-hidden relative ">
            <iframe
              ref={iframeRef}
              src="/master-the-blend/index.html"
              title="Master The Blend Interactive Experience"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      ) : (
        /* Native Studio Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Blending Flask & Glass */}
          <div className="lg:col-span-6 gold-card p-6 flex flex-col items-center justify-center min-h-120">
            <div className="text-xs font-semibold text-[#d4af37] mb-4 flex items-center justify-between w-full">
              <span>ALCHEMICAL TASTING DECANTER</span>
              <span className="font-mono text-[#f5d77f]">
                {totalPoured}% / 100%
              </span>
            </div>

            {/* Cylinder Tasting Vessel */}
            <div className="relative w-36 h-72 rounded-b-3xl border-4 border-[#d4af37]/60 bg-[#170f0a]/90 overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col-reverse p-1">
              {/* Liquid layers */}
              {INGREDIENTS.map((ing) => {
                const heightPct = blendPoured[ing.id] || 0;
                if (heightPct <= 0) return null;
                return (
                  <div
                    key={ing.id}
                    className="w-full transition-all duration-300 relative group"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: ing.color,
                      opacity: 0.85,
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black opacity-80">
                      {ing.name.split(" ")[0]} ({heightPct}%)
                    </span>
                  </div>
                );
              })}

              {totalPoured === 0 && (
                <div className="h-full flex items-center justify-center text-center p-4 text-xs text-[#6d5746]">
                  Decanter Empty. Select essences to pour.
                </div>
              )}
            </div>

            {feedback && (
              <div className="mt-4 p-2.5 rounded-xl bg-[#2e1e15] border border-[#d4af37]/40 text-xs text-center text-[#f5d77f]">
                {feedback}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={handleResetPour}
                className="flex-1 py-2.5 rounded-full border border-[#d4af37]/40 text-xs text-[#a69383] hover:text-[#faf6f0] hover:bg-[#2e1e15] flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Glass</span>
              </button>

              <button
                onClick={handleVerifyNativeBlend}
                disabled={totalPoured < 80}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold ${
                  totalPoured >= 80
                    ? "btn-gold cursor-pointer"
                    : "bg-[#2e1e15] text-[#6d5746] cursor-not-allowed"
                }`}
              >
                Test Harmony
              </button>
            </div>
          </div>

          {/* Right: Ingredient Dispensers */}
          <div className="lg:col-span-6 space-y-4">
            <div className="gold-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg font-bold text-[#faf6f0] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#ff9933]" />
                  <span>The 4 Essential Origin Elements</span>
                </h3>
                <span className="text-xs font-mono text-[#f5d77f]">
                  Timer: {timerSeconds}s
                </span>
              </div>

              <div className="space-y-3">
                {INGREDIENTS.map((ing) => (
                  <div
                    key={ing.id}
                    className="p-3.5 rounded-xl bg-[#1e130d] border border-[#3d261a] hover:border-[#d4af37]/50 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ing.color }}
                        />
                        <span className="text-xs font-bold text-[#faf6f0]">
                          {ing.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#d4af37]">{ing.region}</p>
                      <p className="text-[11px] text-[#a69383]">{ing.notes}</p>
                    </div>

                    <button
                      onClick={() => handlePour(ing.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#2e1e15] border border-[#d4af37]/40 hover:border-[#d4af37] text-xs font-semibold text-[#f5d77f] hover:bg-[#3d261a] transition-all cursor-pointer shrink-0"
                    >
                      + Pour 10%
                    </button>
                  </div>
                ))}
              </div>

              {/* Continue when mastered */}
              {isBlended && (
                <div className="mt-5 p-4 rounded-xl bg-linear-to-r from-[#2e1e15] to-[#3d261a] border border-[#d4af37] text-center space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-1.5 text-[#fff1b8] text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                    <span>Blend Mastered!</span>
                  </div>
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      navigateTo("screen-level-3");
                    }}
                    className="w-full py-3 btn-gold text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Proceed to Level 05: Hunt The Edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
