import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { ZoomIn, ZoomOut, CheckCircle2, X, Timer } from "lucide-react";
import { sound } from "../../utils/audio";
import NewBottle from "../../assets/images/NewBottle.png";

// Total time the player has to solve all 5 hotspots, in seconds.
const TOTAL_TIME = 30;
// Countdown value (seconds remaining) below which the timer turns red.
const TIMER_DANGER_THRESHOLD = 15;

// Extra points awarded based on how fast (in elapsed seconds) the player
// solves all 5 hotspots. First threshold that matches (in order) wins.
const TIME_BONUS_TIERS: { maxElapsedSeconds: number; bonus: number }[] = [
  { maxElapsedSeconds: 10, bonus: 30 },
  { maxElapsedSeconds: 15, bonus: 20 },
  { maxElapsedSeconds: 20, bonus: 10 },
];

function getTimeBonus(elapsedSeconds: number): number {
  const tier = TIME_BONUS_TIERS.find(
    (t) => elapsedSeconds <= t.maxElapsedSeconds,
  );
  return tier ? tier.bonus : 0;
}

interface Hotspot {
  id: string;
  number: number;
  label: string;
  top: string;
  left: string;
  question: string;
  answers: { key: string; text: string; correct: boolean }[];
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "cap",
    number: 1,
    label: "THE CROWN DETAIL",
    top: "10%",
    left: "46%",
    question:
      "What does this architectural hexagonal cap contribute to the bottle's visual identity?",
    answers: [
      {
        key: "A",
        text: "A crown-inspired royal appearance and tactile seal",
        correct: true,
      },
      { key: "B", text: "A sports-inspired appearance", correct: false },
      { key: "C", text: "A futuristic digital appearance", correct: false },
      { key: "D", text: "A minimal plain appearance", correct: false },
    ],
  },
  {
    id: "identity",
    number: 2,
    label: "THE INDIAN IDENTITY",
    top: "41%",
    left: "46%",
    question:
      "Which visual idea is most strongly communicated by the central emblem?",
    answers: [
      {
        key: "A",
        text: "Indian identity and contemporary luxury",
        correct: true,
      },
      { key: "B", text: "European sports culture", correct: false },
      { key: "C", text: "Tropical beach culture", correct: false },
      { key: "D", text: "Generic commercial packaging", correct: false },
    ],
  },
  {
    id: "typography",
    number: 3,
    label: "THE EDIT TYPOGRAPHY",
    top: "53%",
    left: "46%",
    question:
      "What is the signature branding phrase displayed prominently on the glass?",
    answers: [
      { key: "A", text: "THE INDIAN EDIT", correct: true },
      { key: "B", text: "THE ROYAL EDIT", correct: false },
      { key: "C", text: "INDIA SELECT", correct: false },
      { key: "D", text: "INDIAN RESERVE", correct: false },
    ],
  },
  {
    id: "signature",
    number: 4,
    label: "THE SIGNATURE CREST",
    top: "70%",
    left: "46%",
    question:
      "What visual color combination creates the luxury contrast on this seal?",
    answers: [
      { key: "A", text: "Ruby Red and Antique Gold", correct: true },
      { key: "B", text: "Blue and Neon Green", correct: false },
      { key: "C", text: "Purple and Plain White", correct: false },
      { key: "D", text: "Orange and Pale Blue", correct: false },
    ],
  },
  {
    id: "closer",
    number: 5,
    label: "EMBOSSED ARTISAN BASE",
    top: " 90%",
    left: "46%",
    question:
      "Which craftsmanship approach is honored in this heavy crystalline glass base?",
    answers: [
      {
        key: "A",
        text: "Paying close attention to sustainable bottle craft & heritage weight",
        correct: true,
      },
      { key: "B", text: "Mass plastic extrusion", correct: false },
      { key: "C", text: "Disposable synthetic packaging", correct: false },
      { key: "D", text: "Unweighted aluminum can styling", correct: false },
    ],
  },
];

// Fisher-Yates shuffle — returns a new array, doesn't mutate the input
function shuffleAnswers(answers: Hotspot["answers"]): Hotspot["answers"] {
  const copy = [...answers];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.map((ans, idx) => ({
    ...ans,
    key: String.fromCharCode(65 + idx),
  }));
}

export const Level1DecodeTheBottle: React.FC = () => {
  const { state, updateDecodeScore, navigateTo } = useGame();

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<Hotspot["answers"]>(
    [],
  );
  const [solvedHotspots, setSolvedHotspots] = useState<string[]>([]);
  // Hotspots where the player has given ONE wrong answer. Once a hotspot
  // lands here, the question is permanently closed — no further attempts,
  // shown in red on the bottle pin & checklist.
  const [closedHotspots, setClosedHotspots] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [score, setScore] = useState(state.decodeScore || 0);
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
  } | null>(null);
  const [useIframe, setUseIframe] = useState(false);

  // 30-second level timer. Counts down once; stops the moment all 5
  // hotspots are solved (so the elapsed time can be used for the bonus),
  // or when it hits 0, whichever happens first.
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timerRunning, setTimerRunning] = useState(true);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    if (timeLeft <= 0) {
      setTimerRunning(false);
      setTimeUp(true);
      return;
    }
    const tick = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [timeLeft, timerRunning]);

  // Listen for postMessage events from iframe if player toggled to iframe mode
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data) return;
        if (data.type === "DECODE_COMPLETE" || data.type === "GAME_COMPLETE") {
          const earned = data.score || 1000;
          sound.playSuccess();
          updateDecodeScore(earned, 5, true);
        }
      } catch {
        // Safe message parse
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Opens a hotspot's question with a freshly shuffled answer order every time
  const openHotspot = (spot: Hotspot) => {
    sound.playClick();
    setActiveHotspot(spot);
    setShuffledAnswers(shuffleAnswers(spot.answers));
    setFeedback(null);
  };

  const handleSelectAnswer = (answer: {
    key: string;
    text: string;
    correct: boolean;
  }) => {
    if (!activeHotspot) return;
    // Question is already closed (a wrong answer was given earlier),
    // already solved, or time has run out — no further attempts allowed.
    if (
      closedHotspots.includes(activeHotspot.id) ||
      solvedHotspots.includes(activeHotspot.id) ||
      timeUp
    ) {
      return;
    }

    if (answer.correct) {
      sound.playSuccess();
      const newSolved = [...solvedHotspots, activeHotspot.id];
      setSolvedHotspots(newSolved);
      let newScore = score + 50;
      const justCompleted = newSolved.length >= 5;

      if (justCompleted) {
        // Stop the clock and work out the time bonus from elapsed seconds.
        setTimerRunning(false);
        const elapsedSeconds = TOTAL_TIME - timeLeft;
        const bonus = getTimeBonus(elapsedSeconds);
        newScore += bonus;
        setFeedback({
          message:
            bonus > 0
              ? `Correct! +50 Craft Points (+${bonus} Time Bonus!)`
              : "Correct! +50 Craft Points",
          isCorrect: true,
        });
      } else {
        setFeedback({ message: "Correct! +50 Craft Points", isCorrect: true });
      }

      setScore(newScore);
      updateDecodeScore(newScore, newSolved.length, justCompleted);
      setTimeout(() => {
        setFeedback(null);
        setActiveHotspot(null);
      }, 1200);
    } else {
      sound.playWrong();
      setFeedback({
        message: "Incorrect. This question is now closed.",
        isCorrect: false,
      });
      // Permanently close this question — no more attempts on it.
      setClosedHotspots((prev) =>
        prev.includes(activeHotspot.id) ? prev : [...prev, activeHotspot.id],
      );
      setTimeout(() => {
        setFeedback(null);
        setActiveHotspot(null);
      }, 1400);
    }
  };

  const isCompleted = solvedHotspots.length >= 5 || state.decodeCompleted;
  const isTimerDanger = timeLeft <= TIMER_DANGER_THRESHOLD;
  const timerLabel = `00:${String(timeLeft).padStart(2, "0")}`;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* Level Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-[clamp(2rem,5.5vw,3.4rem)] sm:text-3xl font-bold gold-gradient-text mt-1">
            Decode The Bottle
          </h2>
          <p className="text-xs text-[#faf6f0] mt-1">
            Inspect all 5 artisanal details of The Indian Edit bespoke bottle in
            30 seconds — earn 50 craft points per detail, plus a speed bonus
            (+30 within 10s, +20 within 15s, +10 within 20s).
          </p>
        </div>

        {/* Timer, Progress & Score Pills */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 shadow-lg transition-colors ${
              isTimerDanger
                ? "bg-red-950/40 border-red-600 text-red-400"
                : "bg-[#22160f] border-[#d4af37]/40 text-[#f5d77f]"
            }`}
          >
            <Timer
              className={`w-4 h-4 ${isTimerDanger ? "animate-pulse" : ""}`}
            />
            <span className="font-mono text-lg font-bold tabular-nums">
              {timerLabel}
            </span>
          </div>

          <div className="bg-[#22160f] border border-[#d4af37]/40 rounded-xl px-4 py-2 shadow-lg text-center">
            <span className="text-[10px] text-[#a69383] uppercase font-bold">
              DISCOVERED
            </span>
            <div className="font-mono text-lg font-bold text-[#f5d77f]">
              {solvedHotspots.length} / 5
            </div>
          </div>

          <div className="bg-[#22160f] border border-[#d4af37]/40 rounded-xl px-4 py-2 shadow-lg text-center">
            <span className="text-[10px] text-[#a69383] uppercase font-bold">
              SCORE
            </span>
            <div className="font-mono text-lg font-bold text-[#fff1b8]">
              {score} pts
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bottle Explorer View */}
        <div className="lg:col-span-8 p-4 sm:p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-130">
          {/* Zoom & Mode Controls */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <button
              onClick={() =>
                setZoomLevel((prev) => Math.min(1.6, +(prev + 0.2).toFixed(1)))
              }
              className="p-2 rounded-lg bg-[#22160f]/90 border border-[#d4af37]/40 text-[#f5d77f] hover:bg-[#2e1e15] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setZoomLevel((prev) => Math.max(0.9, +(prev - 0.2).toFixed(1)))
              }
              className="p-2 rounded-lg bg-[#22160f]/90 border border-[#d4af37]/40 text-[#f5d77f] hover:bg-[#2e1e15] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#a69383] ml-1">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {useIframe ? (
            <iframe
              src="/decode-the-bottle/index.html"
              title="Decode The Bottle Canvas Experience"
              className="w-full h-130 rounded-xl border border-[#3d261a]"
            />
          ) : (
            <div className="relative w-full max-w-sm h-120 flex items-center justify-center select-none overflow-hidden">
              <div
                className="relative inline-block transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={NewBottle}
                  alt="The Indian Edit Bottle"
                  className="block h-110 w-auto max-w-full object-contain pointer-events-none rounded-lg shadow-2xl"
                  referrerPolicy="no-referrer"
                />

                {/* 5 Pulsing Interactive Hotspots, anchored to the image */}
                {HOTSPOTS.map((spot) => {
                  const isSolved = solvedHotspots.includes(spot.id);
                  const isClosed = closedHotspots.includes(spot.id);
                  const isLockedByTime = timeUp && !isSolved;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => openHotspot(spot)}
                      className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
                      style={{ top: spot.top, left: spot.left }}
                      title={`Inspect ${spot.label}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-lg ${
                          isSolved
                            ? "bg-green-600 text-white border-2 border-green-300"
                            : isClosed || isLockedByTime
                              ? "bg-red-600 text-white border-2 border-red-300"
                              : "bg-[#d4af37] text-[#170f0a] border-2 border-[#fff1b8] animate-bounce"
                        }`}
                      >
                        {isSolved ? "✓" : spot.number}
                      </div>

                      {/* Tooltip on hover */}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#170f0a] border border-[#d4af37]/50 text-[10px] text-[#f5d77f] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                        {spot.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Craft Hotspots Checklist */}
        <div className="lg:col-span-4 space-y-4">
          <div className="gold-card p-5">
            <h3 className="font-serif text-lg font-bold text-[#faf6f0] flex items-center gap-2">
              <span>Craft Hotspot Index</span>
            </h3>
            <p className="text-xs text-[#f2ead9] mt-1">
              Click any detail below or tap the pins on the bottle.
            </p>

            <div className="mt-4 space-y-2.5">
              {HOTSPOTS.map((spot) => {
                const isSolved = solvedHotspots.includes(spot.id);
                const isClosed = closedHotspots.includes(spot.id);
                const isLockedByTime = timeUp && !isSolved;
                const isRed = isClosed || isLockedByTime;
                return (
                  <button
                    key={spot.id}
                    onClick={() => openHotspot(spot)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSolved
                        ? "bg-green-950/30 border-green-600/50 text-[#faf6f0]"
                        : isRed
                          ? "bg-red-950/30 border-red-600/50 text-[#faf6f0]"
                          : "bg-[#1e130d] border-[#3d261a] hover:border-[#d4af37]/50 hover:bg-[#2e1e15]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSolved
                            ? "bg-green-600 text-white"
                            : isRed
                              ? "bg-red-600 text-white"
                              : "bg-[#2e1e15] border border-[#d4af37]/60 text-[#f5d77f]"
                        }`}
                      >
                        {isSolved ? "✓" : spot.number}
                      </div>
                      <span className="text-xs font-semibold tracking-wide">
                        {spot.label}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#d4af37]">
                      {isSolved
                        ? "+50 pts"
                        : isClosed
                          ? "closed"
                          : isLockedByTime
                            ? "time's up"
                            : "50 pts"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Level Completion Card */}
            {isCompleted && (
              <div className="mt-6 p-4 rounded-xl bg-linear-to-r from-[#160602] to-[#3d261a] border border-[#d4af37] text-center space-y-3 animate-fade-in">
                <div className="flex items-center justify-center gap-1.5 text-[#fff1b8] text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Level 03 Completed!</span>
                </div>
                <p className="text-xs text-[#warm-beige]">
                  You decoded all 5 artisanal bottle details and secured maximum
                  craft provenance points.
                </p>

                <button
                  onClick={() => {
                    sound.playSuccess();
                    navigateTo("screen-level-2");
                  }}
                  className="w-full p-2 btn-gold text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Proceed to Level 04: Blend the Edit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hotspot Question Modal Dialog */}
      {activeHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl bg-[#22160f] border border-[#d4af37]/60 shadow-2xl p-6 text-[#faf6f0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3d261a]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#d4af37] text-[#170f0a] font-bold flex items-center justify-center text-xs">
                  {activeHotspot.number}
                </div>
                <h4 className="font-serif text-lg font-bold text-[#faf6f0]">
                  {activeHotspot.label}
                </h4>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="p-1 rounded-lg text-[#a69383] hover:text-[#faf6f0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-4 text-sm font-medium text-[#e5d8cb]">
              {activeHotspot.question}
            </p>

            {feedback && (
              <div
                className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedback.isCorrect
                    ? "bg-green-950/60 border-green-500/60 text-green-200"
                    : "bg-red-950/60 border-red-500/60 text-red-200"
                }`}
              >
                <span>{feedback.isCorrect ? "✨" : "⚠️"}</span>
                <span>{feedback.message}</span>
              </div>
            )}

            {!solvedHotspots.includes(activeHotspot.id) &&
            (closedHotspots.includes(activeHotspot.id) || timeUp) ? (
              // Either answered incorrectly once, or the 30s timer ran out —
              // either way, this question can no longer be attempted.
              <div className="mt-4 p-4 rounded-xl bg-red-950/30 border border-red-600/50 text-center">
                <p className="text-xs text-red-200">
                  {timeUp
                    ? "Time's up! The 30-second timer ran out, so this question is closed."
                    : "This question is closed. You already gave an incorrect answer, so it can't be attempted again."}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {shuffledAnswers.map((ans) => (
                  <button
                    key={ans.text}
                    onClick={() => handleSelectAnswer(ans)}
                    className="w-full p-3 rounded-xl bg-[#170f0a] border border-[#3d261a] hover:border-[#d4af37] text-left text-xs text-[#faf6f0] hover:bg-[#2e1e15] flex items-center gap-3 transition-colors group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-md bg-[#2e1e15] border border-[#d4af37]/40 text-[#f5d77f] font-mono font-bold flex items-center justify-center text-xs group-hover:border-[#d4af37]">
                      {ans.key}
                    </span>
                    <span className="group-hover:text-[#f5d77f] transition-colors">
                      {ans.text}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 text-right">
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-xs text-[#a69383] hover:underline"
              >
                Dismiss & Inspect Bottle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
