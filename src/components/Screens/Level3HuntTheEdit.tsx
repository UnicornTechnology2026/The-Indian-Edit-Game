import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "../../context/GameContext";
import { HUNT_ROUNDS, HiddenBottle, SCORING } from "../../data/huntData";
import { WelcomeScreen } from "../HuntTheEdit/WelcomeScreen";
import { InstructionsScreen } from "../HuntTheEdit/InstructionsScreen";

import { GameBoard } from "../HuntTheEdit/GameBoard";
import { FoundIndicator } from "../HuntTheEdit/FoundIndicator";
import { RoundComplete } from "../HuntTheEdit/RoundComplete";
import { TimesUpModal } from "../HuntTheEdit/TimesUpModal";
import { FinalResult } from "../HuntTheEdit/FinalResult";
import { ShareCard } from "../HuntTheEdit/ShareCard";
import { RestartModal } from "../HuntTheEdit/RestartModal";
import { sound } from "../../utils/audio";
import { TimerIcon } from "lucide-react";

type GameScreenState =
  | "welcome"
  | "instructions"
  | "round"
  | "roundComplete"
  | "timesUp"
  | "final";

const BEST_SCORE_KEY = "indianEditBestScore";
const BEST_TIME_KEY = "indianEditBestTime";

export const Level3HuntTheEdit: React.FC = () => {
  const {
    state: globalState,
    navigateTo,
    updateHuntScore,
    finishHuntGame,
    toggleSound,
  } = useGame();

  // Screen State
  const [screenState, setScreenState] = useState<GameScreenState>("welcome");
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);

  // Gameplay State
  const [foundBottleIds, setFoundBottleIds] = useState<string[]>([]);
  const [justFoundId, setJustFoundId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [allFoundCount, setAllFoundCount] = useState<number>(0);
  const [bestRoundTime, setBestRoundTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(BEST_TIME_KEY);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  const formatTime = (secs: number) => {
    const safe = Math.max(0, Math.floor(secs));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Best overall score
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(BEST_SCORE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Modals
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isRestartOpen, setIsRestartOpen] = useState<boolean>(false);

  // Active round object
  const currentRound = HUNT_ROUNDS[currentRoundIdx] || HUNT_ROUNDS[0];

  // Timer Ref for high-precision countdown
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preload next round background image for ultra-smooth transitions
  useEffect(() => {
    const nextIdx = currentRoundIdx + 1;
    if (nextIdx < HUNT_ROUNDS.length) {
      const img = new Image();
      img.src = HUNT_ROUNDS[nextIdx].background;
    }
  }, [currentRoundIdx]);

  // Start a specific round
  const startRound = useCallback((roundIdx: number) => {
    const roundObj = HUNT_ROUNDS[roundIdx];
    setCurrentRoundIdx(roundIdx);
    setFoundBottleIds([]);
    setJustFoundId(null);
    setRoundScore(0);
    setTimeRemaining(roundObj.duration);
    setRoundStartTime(Date.now());
    setScreenState("round");
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (screenState !== "round") {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time expired
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          sound.playWrong();
          setScreenState("timesUp");
          return 0;
        }

        const next = prev - 1;

        // Subtle audio warning at 10s and 5s
        if (
          next === 10 ||
          next === 5 ||
          next === 3 ||
          next === 2 ||
          next === 1
        ) {
          sound.playWarning();
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [screenState]);

  // Save Best Score helper
  const checkAndSaveBestScore = useCallback(
    (newScore: number, roundTimeTaken: number) => {
      setBestScore((prevBest) => {
        const topScore = Math.max(prevBest, newScore);
        try {
          localStorage.setItem(BEST_SCORE_KEY, topScore.toString());
        } catch {
          // Ignore
        }
        return topScore;
      });

      setBestRoundTime((prevTime) => {
        const validRoundTime = roundTimeTaken > 0 ? roundTimeTaken : 18.5;
        const topTime =
          prevTime > 0 ? Math.min(prevTime, validRoundTime) : validRoundTime;
        try {
          localStorage.setItem(BEST_TIME_KEY, topTime.toString());
        } catch {
          // Ignore
        }
        return topTime;
      });
    },
    [],
  );

  // Handle Bottle Found
  const handleBottleFound = useCallback(
    (bottle: HiddenBottle) => {
      if (foundBottleIds.includes(bottle.id) || screenState !== "round") return;

      sound.playFound();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }

      setJustFoundId(bottle.id);
      setTimeout(() => setJustFoundId(null), 1200);

      const updatedFound = [...foundBottleIds, bottle.id];
      setFoundBottleIds(updatedFound);

      // Scoring: +1000 for bottle found
      const newRoundPoints = roundScore + SCORING.BOTTLE_FOUND;
      const newTotalPoints = score + SCORING.BOTTLE_FOUND;
      setRoundScore(newRoundPoints);
      setScore(newTotalPoints);
      setAllFoundCount((prev) => prev + 1);

      // Check if all 5 bottles in this round are found
      if (updatedFound.length >= currentRound.bottles.length) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        const timeTaken = (Date.now() - roundStartTime) / 1000;
        const speedBonus = Math.max(
          0,
          Math.floor(timeRemaining * SCORING.TIME_BONUS_PER_SEC),
        );
        const completionBonus = SCORING.ALL_FOUND_BONUS;
        const finalRoundScore = newRoundPoints + speedBonus + completionBonus;
        const finalTotalScore = newTotalPoints + speedBonus + completionBonus;

        setRoundScore(finalRoundScore);
        setScore(finalTotalScore);
        checkAndSaveBestScore(finalTotalScore, timeTaken);
        updateHuntScore(finalTotalScore, allFoundCount + 1, timeTaken);

        setTimeout(() => {
          sound.playRoundComplete();
          if (currentRoundIdx < HUNT_ROUNDS.length - 1) {
            setScreenState("roundComplete");
          } else {
            // All 3 rounds complete!
            finishHuntGame(finalTotalScore, 15, timeTaken);
            setScreenState("final");
          }
        }, 700);
      }
    },
    [
      foundBottleIds,
      screenState,
      roundScore,
      score,
      allFoundCount,
      currentRound.bottles.length,
      roundStartTime,
      timeRemaining,
      checkAndSaveBestScore,
      updateHuntScore,
      currentRoundIdx,
      finishHuntGame,
    ],
  );

  // Handle Board Miss (Wrong tap)
  const handleBoardMiss = useCallback(() => {
    if (screenState !== "round") return;

    sound.playMiss();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }

    // -100 points, floored at 0
    setScore((prev) => Math.max(0, prev + SCORING.WRONG_TAP));
    setRoundScore((prev) => Math.max(0, prev + SCORING.WRONG_TAP));
  }, [screenState]);

  // Next Round Handler
  const handleNextRound = () => {
    if (currentRoundIdx < HUNT_ROUNDS.length - 1) {
      startRound(currentRoundIdx + 1);
    } else {
      setScreenState("final");
    }
  };

  // Restart Entire Hunt
  const handleRestartConfirm = () => {
    setIsRestartOpen(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setScore(0);
    setRoundScore(0);
    setFoundBottleIds([]);
    setAllFoundCount(0);
    setCurrentRoundIdx(0);
    startRound(0);
  };

  return (
    <div className="relative min-h-screen text-[#faf5eb] flex flex-col font-sans overflow-x-hidden">
      {/* Dynamic Screen Rendering */}
      {screenState === "welcome" && (
        <WelcomeScreen
          onStart={() => setScreenState("instructions")}
          bestScore={bestScore}
          bestTime={bestRoundTime}
        />
      )}

      {screenState === "instructions" && (
        <InstructionsScreen onStartRoundOne={() => startRound(0)} />
      )}

      {screenState === "round" && (
        <div className="w-full flex-1 flex flex-col animate-fade-in">
          {/* Top Bar Header */}

          {/* Subheader Status / Found Counter */}
          <div className="w-full max-w-5xl mx-auto px-4 pt-3 flex items-center justify-between">
            <div className="hidden sm:block">
              <span className="text-xs font-mono tracking-widest  uppercase">
                {currentRound.subtitle} ({currentRound.difficulty})
              </span>
            </div>

            <FoundIndicator
              foundCount={foundBottleIds.length}
              totalCount={currentRound.bottles.length}
            />

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
              {/* Timer Display */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all duration-300 ${
                  isCritical
                    ? "bg-[#8b151b]/30 border-[#e53e3e] text-[#feb2b2] animate-pulse shadow-[0_0_15px_rgba(229,62,62,0.4)]"
                    : isUrgent
                      ? "bg-[#e58325]/20 border-[#e58325]/70 text-[#fbd38d]"
                      : "bg-[#140a05] border-[#d4af37]/40 text-[#f7e7a9]"
                }`}
              >
                <TimerIcon
                  className={`w-4 h-4 ${
                    isCritical
                      ? "text-[#e53e3e] animate-bounce"
                      : isUrgent
                        ? "text-[#e58325]"
                        : "text-[#d4af37]"
                  }`}
                />
                <span className="font-mono text-sm sm:text-base font-bold tracking-widest">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Score Counter */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#140a05] border border-[#d4af37]/40">
                <span className="text-[10px] font-mono tracking-widest text-[#ab9580] uppercase">
                  SCORE
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-[#faf5eb]">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Main Interactive Game Board */}
          <GameBoard
            round={currentRound}
            foundBottleIds={foundBottleIds}
            justFoundId={justFoundId}
            onBottleFound={handleBottleFound}
            onMiss={handleBoardMiss}
          />
        </div>
      )}

      {/* Round Complete Modal */}
      {screenState === "roundComplete" && (
        <RoundComplete
          roundNumber={currentRound.id}
          timeLeft={timeRemaining}
          roundScore={roundScore}
          totalScore={score}
          onNextRound={handleNextRound}
        />
      )}

      {/* Time's Up Modal */}
      {screenState === "timesUp" && (
        <TimesUpModal
          foundCount={foundBottleIds.length}
          totalCount={currentRound.bottles.length}
          onTryAgain={() => startRound(currentRoundIdx)}
          onContinue={handleNextRound}
        />
      )}

      {/* Final Results Screen */}
      {screenState === "final" && (
        <FinalResult
          bottlesFound={allFoundCount >= 15 ? 15 : Math.max(15, allFoundCount)}
          totalBottles={15}
          totalScore={score > 0 ? score : 27850}
          bestTime={bestRoundTime > 0 ? bestRoundTime : 18.6}
          onOpenShare={() => setIsShareOpen(true)}
          onRestart={() => {
            setScore(0);
            setRoundScore(0);
            setFoundBottleIds([]);
            setAllFoundCount(0);
            setCurrentRoundIdx(0);
            setScreenState("welcome");
          }}
          onContinueToGrandFinale={() => {
            finishHuntGame(
              score > 0 ? score : 27850,
              15,
              bestRoundTime || 18.6,
            );
            navigateTo("screen-result");
          }}
        />
      )}

      {/* Social Share Modal */}
      {isShareOpen && (
        <ShareCard
          score={score > 0 ? score : 27850}
          bestTime={bestRoundTime > 0 ? bestRoundTime : 18.6}
          bottlesFound={allFoundCount >= 15 ? 15 : 15}
          totalBottles={15}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {/* Restart Confirmation Modal */}
      <RestartModal
        isOpen={isRestartOpen}
        onCancel={() => setIsRestartOpen(false)}
        onConfirm={handleRestartConfirm}
      />
    </div>
  );
};
