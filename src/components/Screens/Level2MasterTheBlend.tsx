import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "../../context/GameContext";
import { CheckCircle2, HelpCircle, RotateCcw, Share2, X } from "lucide-react";
import { sound } from "../../utils/audio";
import bottleImg from "../../assets/images/NewBottle.png";

/* ---------- Game data (ported 1:1 from the standalone Master The Blend build) ---------- */

interface Ingredient {
  id: string;
  name: string;
  origin: string;
  icon: string;
  correct: boolean;
}

const INGREDIENTS: Ingredient[] = [
  {
    id: "indian-malt",
    name: "INDIAN MALT",
    origin: "Indian origin",
    icon: "🇮🇳",
    correct: true,
  },
  {
    id: "indian-grain",
    name: "INDIAN GRAIN",
    origin: "Indian origin",
    icon: "🇮🇳",
    correct: true,
  },
  {
    id: "scotch-malt",
    name: "SCOTCH MALT",
    origin: "Scottish origin",
    icon: "🏴",
    correct: true,
  },
  {
    id: "american-oak",
    name: "AMERICAN OAK",
    origin: "Oak craft note",
    icon: "🪵",
    correct: false,
  },
  {
    id: "european-barrel",
    name: "EUROPEAN BARREL",
    origin: "Continental note",
    icon: "🏛️",
    correct: false,
  },
  {
    id: "botanical-note",
    name: "BOTANICAL NOTE",
    origin: "Aromatic profile",
    icon: "🌿",
    correct: false,
  },
  {
    id: "aged-grain",
    name: "AGED GRAIN",
    origin: "Matured character",
    icon: "🌾",
    correct: false,
  },
  {
    id: "cask-influence",
    name: "CASK INFLUENCE",
    origin: "Wood resonance",
    icon: "⏳",
    correct: false,
  },
];

const REQUIRED = ["indian-malt", "indian-grain", "scotch-malt"];
const ROUND_SECONDS = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Screen = "intro" | "playing" | "completed" | "timeout";

interface FinalStats {
  total: number;
  base: number;
  bonus: number;
  elapsed: number;
}

export const Level2MasterTheBlend: React.FC = () => {
  const { updateBlendScore, navigateTo } = useGame();

  const [screen, setScreen] = useState<Screen>("intro");
  const [order, setOrder] = useState<Ingredient[]>(INGREDIENTS);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [vesselHover, setVesselHover] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null);
  const [timeoutScore, setTimeoutScore] = useState(0);
  const [shared, setShared] = useState(false);

  const startedAtRef = useRef(0);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Countdown timer ---------- */
  useEffect(() => {
    if (screen !== "playing") return;
    if (timeLeft <= 0) {
      sound.playWrong();
      finishTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, timeLeft]);

  const startGame = useCallback(() => {
    sound.playClick();
    setOrder(shuffle(INGREDIENTS));
    setCollectedIds([]);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setIncorrectAttempts(0);
    setFeedback(null);
    setFinalStats(null);
    setShared(false);
    startedAtRef.current = Date.now();
    setScreen("playing");
  }, []);

  const showFeedback = (text: string, ok: boolean) => {
    setFeedback({ text, ok });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 1600);
  };

  const finishCompleted = (
    total: number,
    base: number,
    bonus: number,
    elapsed: number,
    attempts: number,
  ) => {
    sound.playRoundComplete();
    setFinalStats({ total, base, bonus, elapsed });
    updateBlendScore(total, base, bonus, attempts, true);
    setScreen("completed");
  };

  const finishTimeout = () => {
    setTimeoutScore(score);
    updateBlendScore(score, score, 0, incorrectAttempts, false);
    setScreen("timeout");
  };

  const attemptAdd = (ing: Ingredient) => {
    if (screen !== "playing") return;
    if (collectedIds.includes(ing.id)) return;

    if (ing.correct) {
      sound.playFound();
      const nextCollected = [...collectedIds, ing.id];
      const nextScore = score + 100; // e.g. -25 + 100 = 75
      setCollectedIds(nextCollected);
      setScore(nextScore);
      showFeedback(`${ing.name} added! (+100) Score: ${nextScore}`, true);

      if (REQUIRED.every((id) => nextCollected.includes(id))) {
        const elapsed = Math.min(
          ROUND_SECONDS,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        const bonus = timeLeft >= 15 ? 50 : 0;
        const total = nextScore + bonus;
        setTimeout(
          () =>
            finishCompleted(
              total,
              nextScore,
              bonus,
              elapsed,
              incorrectAttempts,
            ),
          900,
        );
      }
    } else {
      sound.playWrong();
      // No floor at 0: a wrong pick can push the score negative
      setScore((s) => s - 25);
      setIncorrectAttempts((a) => a + 1);
      showFeedback(`${ing.name} is not part of this edit. (-25)`, false);
      setShakeId(ing.id);
      setTimeout(() => setShakeId(null), 450);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    sound.playClick();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setVesselHover(false);
    const id = e.dataTransfer.getData("text/plain");
    const ing = order.find((i) => i.id === id);
    if (ing) attemptAdd(ing);
  };

  const shareScore = () => {
    const r = finalStats
      ? { score: finalStats.total, elapsed: finalStats.elapsed }
      : { score: timeoutScore, elapsed: ROUND_SECONDS };
    const text = `I mastered the blend with a score of ${r.score} pts in ${r.elapsed}s! Discover The Indian Edit: Different origins. One distinctive edit.`;
    if (navigator.share) {
      navigator
        .share({
          title: "Master The Blend | The Indian Edit",
          text,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} — ${window.location.href}`);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const collectedCount = collectedIds.length;
  const fillPct =
    collectedCount === 0
      ? 0
      : collectedCount === 1
        ? 33.33
        : collectedCount === 2
          ? 66.66
          : 100;
  const vesselLabel =
    collectedCount === 0
      ? "DRAG OR TAP CRAFT INTO BOTTLE"
      : collectedCount === 1
        ? "1/3 BLENDED • ADD NEXT ORIGIN"
        : collectedCount === 2
          ? "2/3 BLENDED • FINAL ORIGIN AWAITED"
          : "HARMONIOUS BLEND ACHIEVED";

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* ---------------- INTRO ---------------- */}
      {screen === "intro" && (
        <div className="min-h-[65vh] flex flex-col items-center justify-center text-center gap-6">
          <h1 className="font-serif text-[clamp(2rem,5.5vw,3.4rem)] font-bold gold-gradient-text leading-tight">
            BLEND THE EDIT
          </h1>

          <div className="w-full flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-2">
            {[
              {
                n: "01",
                title: "Find Origins",
                text: "Locate the 3 genuine origins among the distractors.",
              },
              {
                n: "02",
                title: "Fill The Bottle",
                text: "Drag or tap each one into the vessel.",
              },
              {
                n: "03",
                title: "Reveal Edit",
                text: "Complete the blend before time runs out.",
              },
            ].map((c) => (
              <div
                key={c.n}
                className="w-40 flex flex-col items-center gap-1.5 p-4 rounded-lg border-2 border-[#d4af37]/25 bg-[#160602] hover:border-[#d4af37] hover:-translate-y-1 transition-all duration-200"
              >
                <span className="font-serif text-lg tracking-wider text-[#d4af37]">
                  {c.n}
                </span>
                <h3 className="text-base font-medium text-[#f5d77f]">
                  {c.title}
                </h3>
                <p className="text-xs text-[#e5d8cb] leading-snug">{c.text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startGame}
            className="mt-2 px-9 py-3.5 btn-gold text-xs font-bold cursor-pointer"
          >
            Start The Edit
          </button>
        </div>
      )}

      {/* ---------------- PLAYING ---------------- */}
      {screen === "playing" && (
        <div>
          <div className="text-center mb-8">
            <h2 className="font-serif text-[clamp(1.6rem,4.5vw,2.6rem)] font-bold gold-gradient-text">
              BLEND THE EDIT
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#e5d8cb]">
              Select the right origins and bring them into the Indian Edit
              bottle.
            </p>

            <div className="flex items-center justify-center gap-6 sm:gap-8 mt-5 flex-wrap">
              <div className="text-center min-w-24">
                <div className="text-[11px] tracking-wide text-[#a69383] mb-1">
                  Blend Score
                </div>
                <div
                  className={`font-serif text-2xl ${
                    score < 0 ? "text-[#f87171]" : "text-[#f5d77f]"
                  }`}
                >
                  {score}
                </div>
              </div>

              <div className="min-h-4.5 text-xs font-medium flex items-center">
                {feedback && (
                  <span
                    className={
                      feedback.ok ? "text-[#f5d77f]" : "text-[#c9645a]"
                    }
                  >
                    {feedback.text}
                  </span>
                )}
              </div>

              <div className="text-center min-w-24">
                <div className="text-[11px] tracking-wide text-[#a69383] mb-1">
                  Time Remaining
                </div>
                <div
                  className={`font-serif text-2xl ${timeLeft <= 10 ? "text-[#c9645a]" : "text-[#f5d77f]"}`}
                >
                  {mm}:{ss}
                </div>
              </div>

              <button
                onClick={() => setHelpOpen(true)}
                className="p-2 rounded-lg bg-[#22160f]/90 border border-[#d4af37]/40 text-[#f5d77f] hover:bg-[#2e1e15] transition-colors cursor-pointer"
                title="How to play"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center">
            {/* Ingredients list */}
            <div className="flex flex-col gap-2.5 order-2 lg:order-1">
              {order.map((ing) => {
                const isCollected = collectedIds.includes(ing.id);
                const isShaking = shakeId === ing.id;
                return (
                  <div
                    key={ing.id}
                    draggable={!isCollected}
                    onDragStart={(e) => handleDragStart(e, ing.id)}
                    onClick={() => attemptAdd(ing)}
                    className={`flex items-center justify-between gap-2.5 p-3.5 rounded-lg border backdrop-blur-sm transition-all duration-150 select-none ${
                      isCollected
                        ? "opacity-35 pointer-events-none border-[#7ab08c]/30 bg-[#14100a]/60"
                        : "cursor-grab border-[#d4af37]/25 bg-[#14100a]/70 hover:border-[#d4af37] hover:translate-x-1"
                    } ${isShaking ? "border-[#c9645a] animate-[shake_0.45s]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center text-sm border border-[#d4af37]/25 shrink-0">
                        {ing.icon}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-[#faf6f0]">
                          {ing.name}
                        </span>
                        <span className="block text-[11px] text-[#a69383]">
                          {ing.origin}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-4.75 h-4.75 rounded-full border border-[#d4af37]/25 flex items-center justify-center text-[10px] shrink-0 ${
                        isCollected
                          ? "bg-[#7ab08c] border-[#7ab08c] text-[#151013]"
                          : ""
                      }`}
                    >
                      {isCollected ? "✓" : ""}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vessel */}
            <div className="flex flex-col items-center gap-3.5 order-1 lg:order-2">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-5 h-1 rounded-full border transition-colors duration-300 ${
                      collectedCount > i
                        ? "bg-[#d4af37] border-[#d4af37]"
                        : "bg-white/5 border-[#d4af37]/25"
                    }`}
                  />
                ))}
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setVesselHover(true);
                }}
                onDragLeave={() => setVesselHover(false)}
                onDrop={handleDrop}
                className={`relative w-47.5 transition-[filter] duration-200 ${
                  vesselHover
                    ? "drop-shadow-[0_0_16px_rgba(212,175,55,0.5)]"
                    : ""
                }`}
                style={{ aspectRatio: "605/1419" }}
              >
                <img
                  src={bottleImg}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain object-bottom pointer-events-none"
                  style={{
                    filter: "grayscale(1) brightness(0.5) contrast(0.9)",
                    opacity: 0.55,
                  }}
                />
                <div
                  className="absolute left-0 right-0 bottom-0 overflow-hidden pointer-events-none transition-[height] duration-500 ease-out"
                  style={{ height: `${fillPct}%` }}
                >
                  <img
                    src={bottleImg}
                    alt="The Indian Edit bottle"
                    draggable={false}
                    className="absolute left-0 bottom-0 object-contain object-bottom"
                    style={{
                      width: 190,
                      height: (190 * 1419) / 605,
                      filter: "drop-shadow(0 0 12px rgba(212,175,55,0.3))",
                    }}
                  />
                </div>
              </div>

              <div className="text-[11px] tracking-wide text-[#a69383] text-center">
                {vesselLabel}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- COMPLETED ---------------- */}
      {screen === "completed" && finalStats && (
        <div className="min-h-[65vh] flex flex-col items-center justify-center text-center gap-4">
          <h1 className="font-serif text-[clamp(2rem,5.5vw,3.4rem)] font-bold gold-gradient-text">
            EDIT COMPLETE
          </h1>

          <div className="gold-card px-9 py-7 min-w-70">
            <div className="text-[11px] tracking-wide text-[#a69383]">
              Your Blend Score
            </div>
            <div className="font-serif text-4xl text-[#f5d77f] my-1.5">
              {finalStats.total}
            </div>
            <div className="text-[11px] tracking-wide text-[#d4af37]">
              Blend Complete
            </div>

            <div className="flex justify-between gap-4 mt-4 pt-4 border-t border-[#d4af37]/20">
              <div className="flex flex-col gap-1 text-[11px] text-[#a69383]">
                <span>Best Score</span>
                <b className="font-serif text-sm text-[#faf6f0]">
                  {finalStats.base} pts
                </b>
              </div>
              <div className="flex flex-col gap-1 text-[11px] text-[#a69383]">
                <span>Speed Bonus</span>
                <b className="font-serif text-sm text-[#d4af37]">
                  {finalStats.bonus > 0 ? `+${finalStats.bonus} pts` : "—"}
                </b>
              </div>
              <div className="flex flex-col gap-1 text-[11px] text-[#a69383]">
                <span>Completion</span>
                <b className="font-serif text-sm text-[#7ab08c]">
                  {finalStats.elapsed}s
                </b>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-1 w-full max-w-xs">
            <button
              onClick={startGame}
              className="flex-1 py-3 btn-gold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
            <button
              onClick={shareScore}
              className="flex-1 py-3 btn-gold  flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shared ? "Copied!" : "Share"}</span>
            </button>
          </div>

          <button
            onClick={() => {
              sound.playSuccess();
              navigateTo("screen-level-3");
            }}
            className="w-full max-w-xs py-3.5 btn-gold text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Proceed to Level 03: Hunt The Edit</span>
          </button>
        </div>
      )}

      {/* ---------------- TIMEOUT ---------------- */}
      {screen === "timeout" && (
        <div className="min-h-[65vh] flex flex-col items-center justify-center text-center gap-4">
          <h2 className="font-serif text-2xl font-bold gold-gradient-text">
            TIME EXPIRED
          </h2>
          <p className="font-serif italic text-sm text-[#f5d77f]">
            &ldquo;Mastery requires patience and precision.&rdquo;
          </p>

          <div className=" px-9 py-7 min-w-70">
            <div
              className={`font-serif text-4xl my-1.5 ${
                timeoutScore < 0 ? "text-[#f87171]" : "text-[#f5d77f]"
              }`}
            >
              {timeoutScore} pts
            </div>
            <p className="text-xs text-[#f2ead9] mt-2 leading-relaxed">
              Unite 3 Blend into the Edit vessel before 30 seconds elapse.
            </p>
          </div>

          <button
            onClick={startGame}
            className="px-9 py-3.5 btn-gold text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry The Edit</span>
          </button>
        </div>
      )}

      {/* ---------------- HELP MODAL ---------------- */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-sm rounded-lg bg-[#151013]/95 border border-[#d4af37]/25 shadow-2xl p-6 text-[#faf6f0]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHelpOpen(false)}
              className="absolute top-3.5 right-3.5 text-[#a69383] hover:text-[#faf6f0] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-serif text-base text-[#f5d77f] mb-3">
              How To Master The Blend
            </h3>
            <p className="text-xs text-[#a69383] leading-relaxed">
              Bring together the 3 genuine craft origins into the Edit vessel
              before the 30-second timer expires.
            </p>
            <ul className="text-xs text-[#e5d8cb] leading-loose my-3 space-y-1">
              <li>🇮🇳 Indian Malt — Indian origin</li>
              <li>🇮🇳 Indian Grain — Indian origin</li>
              <li>🏴 Scotch Malt — Scottish origin</li>
            </ul>
            <p className="text-xs text-[#a69383] leading-relaxed">
              Correct: +100 pts. Incorrect (distractor): −25 pts. Finish with
              15s+ remaining: +50 speed bonus.
            </p>
            <p className="text-[11px] text-[#a69383] mt-2.5">
              Drag and drop, or tap to place — both work, on mobile and desktop.
            </p>
            <div className="text-right mt-3.5">
              <button
                onClick={() => setHelpOpen(false)}
                className="px-5 py-2 rounded-full bg-white/5 border border-[#d4af37]/25 text-xs text-[#faf6f0] hover:border-[#d4af37] transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
