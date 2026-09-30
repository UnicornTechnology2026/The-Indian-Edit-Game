import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { ZoomIn, ZoomOut, CheckCircle2, X, Timer } from "lucide-react";
import { sound } from "../../utils/audio";
import NewBottle from "../../assets/images/NewBottle.png";
import { DecodeTheBottleIntro } from "./DecodeTheBottleIntro";

// Seconds the player gets to answer EACH question.
const QUESTION_TIME = 10;
// Seconds remaining at or below which the modal timer turns red.
const QUESTION_DANGER_THRESHOLD = 3;

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
      "How does this hexagonal cap make the bottle look unique and stylish?",
    answers: [
      {
        key: "A",
        text: "A royal crown-like look with a premium, textured seal.",
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
        text: "Indian identity with modern luxury",
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
    question: "What brand name is clearly shown on the bottle?",
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
    question: "Which colors give the seal its luxurious look?",
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
    question: "What craft style is shown in the heavy crystal glass base?",
    answers: [
      {
        key: "A",
        text: "Thoughtful bottle craft inspired by heritage",
        correct: true,
      },
      { key: "B", text: "Large-scale plastic production.", correct: false },
      { key: "C", text: "Single-use plastic packaging", correct: false },
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

export const DecodeTheBottleGame: React.FC = () => {
  const { state, updateDecodeScore, navigateTo } = useGame();

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<Hotspot["answers"]>(
    [],
  );
  const [solvedHotspots, setSolvedHotspots] = useState<string[]>([]);
  // Hotspots where the player gave ONE wrong answer. Permanently closed.
  const [closedHotspots, setClosedHotspots] = useState<string[]>([]);
  // Hotspots where the 10-second timer ran out before an answer was given.
  // Permanently closed as well.
  const [timedOutHotspots, setTimedOutHotspots] = useState<string[]>([]);
  // Which wrong option the player picked, per hotspot (shown in red).
  const [wrongPickById, setWrongPickById] = useState<Record<string, string>>(
    {},
  );
  // Remaining seconds for each question. A question's clock only runs while
  // its modal is open, and it resumes from where it stopped if the modal is
  // dismissed and reopened (so closing/reopening can't reset the 10 seconds).
  const [timeLeftById, setTimeLeftById] = useState<Record<string, number>>({});
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [score, setScore] = useState(state.decodeScore || 0);
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
  } | null>(null);
  const [useIframe, setUseIframe] = useState(false);

  // ---- Per-question timer -------------------------------------------------
  const activeId = activeHotspot?.id ?? null;
  const activeIsOpen =
    !!activeId &&
    !solvedHotspots.includes(activeId) &&
    !closedHotspots.includes(activeId) &&
    !timedOutHotspots.includes(activeId);
  const questionTimeLeft = activeId
    ? (timeLeftById[activeId] ?? QUESTION_TIME)
    : QUESTION_TIME;

  useEffect(() => {
    if (!activeId || !activeIsOpen) return;

    // Time ran out with no answer -> this question is now closed.
    if (questionTimeLeft <= 0) {
      sound.playWrong();
      setTimedOutHotspots((prev) =>
        prev.includes(activeId) ? prev : [...prev, activeId],
      );
      return;
    }

    const tick = setTimeout(() => {
      setTimeLeftById((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] ?? QUESTION_TIME) - 1,
      }));
    }, 1000);
    return () => clearTimeout(tick);
  }, [activeId, activeIsOpen, questionTimeLeft]);

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

  // The level is finished once every question is resolved, whether it was
  // answered correctly, answered wrongly, or timed out. Without this, a
  // closed question would leave the player unable to reach the next level.
  const resolvedCount = new Set([
    ...solvedHotspots,
    ...closedHotspots,
    ...timedOutHotspots,
  ]).size;
  const allResolved = resolvedCount >= HOTSPOTS.length;

  useEffect(() => {
    if (allResolved && !state.decodeCompleted) {
      updateDecodeScore(score, solvedHotspots.length, true);
    }
  }, [allResolved]);

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
    // Already closed (wrong answer), already solved, or timed out —
    // no further attempts allowed.
    if (
      closedHotspots.includes(activeHotspot.id) ||
      solvedHotspots.includes(activeHotspot.id) ||
      timedOutHotspots.includes(activeHotspot.id) ||
      questionTimeLeft <= 0
    ) {
      return;
    }

    if (answer.correct) {
      sound.playSuccess();
      const newSolved = [...solvedHotspots, activeHotspot.id];
      setSolvedHotspots(newSolved);
      const newScore = score + 50;

      setScore(newScore);
      updateDecodeScore(newScore, newSolved.length, newSolved.length >= 5);
      // Stay open a little so the player sees the green row.
      setTimeout(() => {
        setFeedback(null);
        setActiveHotspot(null);
      }, 1800);
    } else {
      sound.playWrong();
      setWrongPickById((prev) => ({
        ...prev,
        [activeHotspot.id]: answer.text,
      }));
      // Permanently close this question — no more attempts on it.
      setClosedHotspots((prev) =>
        prev.includes(activeHotspot.id) ? prev : [...prev, activeHotspot.id],
      );
      // Stay open longer so the player can read the correct answer.
      setTimeout(() => {
        setFeedback(null);
        setActiveHotspot(null);
      }, 3000);
    }
  };

  const isCompleted = allResolved || state.decodeCompleted;
  const isTimerDanger = questionTimeLeft <= QUESTION_DANGER_THRESHOLD;
  const timerLabel = `00:${String(Math.max(questionTimeLeft, 0)).padStart(2, "0")}`;

  // Level Completion Card (Proceed button). Rendered once inside the
  // desktop checklist card, and standalone (no card chrome) on mobile.
  const completionCard = isCompleted ? (
    <div className="p-4 rounded-xl  text-center space-y-3 animate-fade-in">
      <div className="flex items-center justify-center gap-1.5 text-[#fff1b8] text-sm font-bold">
        <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
        <span>Level 01 Completed!</span>
      </div>
      <p className="text-xs text-[#warm-beige]">
        {solvedHotspots.length >= 5
          ? "You decoded all 5 artisanal bottle details and secured maximum craft provenance points."
          : `You decoded ${solvedHotspots.length} of 5 artisanal bottle details and earned ${score} craft points.`}
      </p>

      <button
        onClick={() => {
          sound.playSuccess();
          navigateTo("screen-level-2");
        }}
        className="w-full p-2 btn-gold text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span>Proceed to Level 02: Blend the Edit</span>
      </button>
    </div>
  ) : null;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* Level Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div></div>

        {/* Progress & Score Pills */}
        <div className="flex items-center gap-3">
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
            <span className="text-xs font-mono text-[#f2ead9] ml-1">
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
                  const isRed =
                    closedHotspots.includes(spot.id) ||
                    timedOutHotspots.includes(spot.id);
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
                            : isRed
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
          {/* Desktop: full card with checklist + completion card nested
              inside the same bordered box. Hidden entirely on mobile. */}
          <div className="hidden lg:block gold-card p-5">
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
                const isTimedOut = timedOutHotspots.includes(spot.id);
                const isRed = isClosed || isTimedOut;
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
                          : isTimedOut
                            ? "time's up"
                            : "50 pts"}
                    </span>
                  </button>
                );
              })}
            </div>

            {completionCard && <div className="mt-6">{completionCard}</div>}
          </div>

          {/* Mobile: no card box — show only the Proceed button/completion
              card once the level is done. Nothing renders before that. */}
          <div className="lg:hidden">{completionCard}</div>
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

              <div className="flex items-center gap-3">
                {/* Per-question countdown */}
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 transition-colors ${
                    isTimerDanger
                      ? "bg-red-950/40 border-red-600 text-red-400"
                      : "bg-[#170f0a] border-[#d4af37]/40 text-[#f5d77f]"
                  }`}
                >
                  <Timer
                    className={`w-4 h-4 ${
                      isTimerDanger && activeIsOpen ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {timerLabel}
                  </span>
                </div>

                <button
                  onClick={() => setActiveHotspot(null)}
                  className="p-1 rounded-lg text-[#a69383] hover:text-[#faf6f0] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Countdown progress bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-[#170f0a] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  isTimerDanger ? "bg-red-500" : "bg-[#d4af37]"
                }`}
                style={{
                  width: `${(Math.max(questionTimeLeft, 0) / QUESTION_TIME) * 100}%`,
                }}
              />
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

            {(() => {
              const isSolved = solvedHotspots.includes(activeHotspot.id);
              const isTimedOut = timedOutHotspots.includes(activeHotspot.id);
              const isClosed = closedHotspots.includes(activeHotspot.id);

              // Once the question is over (right, wrong, or timed out),
              // lock the options and reveal the correct answer.
              const showAnswer = isSolved || isClosed || isTimedOut;

              const wrongPick = wrongPickById[activeHotspot.id];

              return (
                <>
                  {!isSolved && (isClosed || isTimedOut) && (
                    <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-600/50 text-center">
                      <p className="text-xs text-red-200">
                        {isTimedOut
                          ? "Time's up! This question is closed. The correct answer is shown in green."
                          : "This question is closed. The correct answer is shown in green."}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 space-y-2.5">
                    {shuffledAnswers.map((ans) => {
                      const isCorrectOption = ans.correct;
                      const isWrongPick = !isSolved && wrongPick === ans.text;

                      let style =
                        "bg-[#170f0a] border-[#3d261a] text-[#faf6f0] hover:border-[#d4af37] hover:bg-[#2e1e15]";
                      let keyStyle =
                        "bg-[#2e1e15] border-[#d4af37]/40 text-[#f5d77f] group-hover:border-[#d4af37]";

                      if (showAnswer) {
                        if (isSolved) {
                          // Answered correctly: full row bright green.
                          if (isCorrectOption) {
                            style =
                              "bg-green-600 border-green-300 text-white font-semibold shadow-[0_0_16px_rgba(74,222,128,0.55)]";
                            keyStyle = "bg-white border-white text-green-700";
                          } else {
                            style =
                              "bg-[#170f0a] border-[#3d261a] text-[#faf6f0] opacity-40";
                            keyStyle =
                              "bg-[#2e1e15] border-[#d4af37]/20 text-[#a69383]";
                          }
                        } else if (isCorrectOption) {
                          // Wrong answer or timeout: reveal the right one.
                          style =
                            "bg-green-950/60 border-green-500 text-green-100";
                          keyStyle = "bg-green-600 border-green-300 text-white";
                        } else if (isWrongPick) {
                          style = "bg-red-950/60 border-red-500 text-red-100";
                          keyStyle = "bg-red-600 border-red-300 text-white";
                        } else {
                          style =
                            "bg-[#170f0a] border-[#3d261a] text-[#faf6f0] opacity-50";
                          keyStyle =
                            "bg-[#2e1e15] border-[#d4af37]/20 text-[#a69383]";
                        }
                      }

                      return (
                        <button
                          key={ans.text}
                          onClick={() => handleSelectAnswer(ans)}
                          disabled={showAnswer}
                          className={`w-full p-3 rounded-xl border text-left text-xs flex items-center gap-3 transition-colors group ${style} ${
                            showAnswer ? "cursor-default" : "cursor-pointer"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md border font-mono font-bold flex items-center justify-center text-xs ${keyStyle}`}
                          >
                            {showAnswer && isCorrectOption
                              ? "✓"
                              : showAnswer && isWrongPick
                                ? "✗"
                                : ans.key}
                          </span>
                          <span>{ans.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}

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

// Level 1 entry point: shows the intro page first, then the game.
export const Level1DecodeTheBottle: React.FC = () => {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <DecodeTheBottleIntro
        questionTime={QUESTION_TIME}
        totalQuestions={HOTSPOTS.length}
        onStart={() => setStarted(true)}
      />
    );
  }

  return <DecodeTheBottleGame />;
};
