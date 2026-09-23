import React, { createContext, useContext, useState, useEffect } from "react";
import {
  GameState,
  ScreenId,
  CityCategory,
  PersonalityType,
  RewardGift,
} from "../types";
import { computeMasterScore, computePersonality } from "../data/personalities";
import { REWARD_GIFTS } from "../data/rewards";
import { sound } from "../utils/audio";
import { supabaseInsert } from "../lib/supabaseClient";

const STORAGE_KEY = "the_indian_edit_state_v2";

const INITIAL_STATE: GameState = {
  userName: "",
  userCity: "",
  userPhone: "",
  otpVerified: false,
  currentScreen: "screen-login",

  // Legacy fields (Harvest Rush / Zero Mile Map levels removed from the flow;
  // kept only as baseline inputs to computeMasterScore)
  scoreRush: 0,
  scoreBottle: 0,
  bottlesCollected: 0,
  bonusPoints: 0,
  scoreZero: 0,
  nagpurGuessed: false,
  userCityGuessed: false,
  userPinLocation: null,

  // Level 1: Decode The Bottle
  decodeScore: 0,
  decodeDetailsFound: 0,
  decodeCompleted: false,

  // Level 2: Master The Blend
  blendScore: 0,
  blendBaseScore: 0,
  blendSpeedBonus: 0,
  blendIncorrectAttempts: 0,
  blendCompleted: false,

  // Level 3: The Indian Edit — Hunt The Edit
  huntScore: 0,
  huntBottlesFound: 0,
  huntCompleted: false,
  huntBestTime: 0,
  scoreCity: 0,
  cityElements: {
    CITY: 0,
    CULTURE: 0,
    FOOD: 0,
    TECHNOLOGY: 0,
    LIFESTYLE: 0,
    FUTURE: 0,
  },

  // Final Master
  totalScore: 0,
  personality: null,
  screenshotUploaded: false,
  uploadedScreenshotUrl: null,
  scratchRevealed: false,
  selectedGift: null,
  rewardClaimed: false,
  soundMuted: false,
};

interface GameContextType {
  state: GameState;
  setUserName: (name: string) => void;
  setUserCity: (city: string) => void;
  setUserPhone: (phone: string) => void;
  setOtpVerified: (verified: boolean) => void;
  registerUser: () => void;
  navigateTo: (screen: ScreenId) => void;
  updateRushScore: (bottles: number, score: number, bonus: number) => void;
  updateZeroScore: (
    score: number,
    userPin: { x: number; y: number } | null,
  ) => void;
  updateDecodeScore: (
    score: number,
    detailsFound: number,
    completed: boolean,
  ) => void;
  updateBlendScore: (
    score: number,
    base: number,
    speedBonus: number,
    attempts: number,
    completed: boolean,
  ) => void;
  addCityElementCount: (category: CityCategory) => void;
  finishCityBuilding: (elementsPlacedCount: number) => void;
  updateHuntScore: (
    score: number,
    bottlesFound: number,
    bestTime: number,
  ) => void;
  finishHuntGame: (
    score: number,
    bottlesFound: number,
    bestTime: number,
  ) => void;
  logSocialShare: (
    action: "caption_copied" | "card_downloaded" | "card_shared",
    caption?: string,
  ) => void;
  setScreenshotUploaded: (url: string) => void;
  setScratchRevealed: (revealed: boolean) => void;
  selectReward: (gift: RewardGift) => void;
  claimReward: () => void;
  toggleSound: () => boolean;
  resetGame: () => void;
  loadDemoState: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore
    }
  }, [state]);

  const navigateTo = (screen: ScreenId) => {
    sound.playClick();

    // When navigating to result screen, calculate total score & personality
    // and save the run to Supabase. Done here, using `state` directly,
    // rather than inside the setState updater below — React 18 Strict Mode
    // (dev only) invokes updater functions twice to help catch side
    // effects, so a supabaseInsert placed inside one fires twice and
    // creates duplicate rows.
    if (screen === "screen-result") {
      const total = computeMasterScore(state);
      const pers = computePersonality(state);
      const gift =
        state.selectedGift ||
        REWARD_GIFTS[Math.floor(Math.random() * REWARD_GIFTS.length)];

      supabaseInsert("game_results", {
        user_name: state.userName || "VIP Guest",
        user_city: state.userCity || "Nagpur",
        user_phone: state.userPhone || null,
        personality: pers?.name ?? null,
        total_score: total,
        decode_score: state.decodeScore,
        blend_score: state.blendScore,
        hunt_score: state.huntScore,
      }).catch((err) =>
        console.error("Supabase save (game_results) failed:", err),
      );

      setState((prev) => ({
        ...prev,
        currentScreen: screen,
        totalScore: total,
        personality: pers,
        selectedGift: gift,
      }));
    } else {
      setState((prev) => ({ ...prev, currentScreen: screen }));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setUserName = (name: string) =>
    setState((prev) => ({ ...prev, userName: name }));
  const setUserCity = (city: string) =>
    setState((prev) => ({ ...prev, userCity: city }));
  const setUserPhone = (phone: string) =>
    setState((prev) => ({ ...prev, userPhone: phone }));
  const setOtpVerified = (verified: boolean) =>
    setState((prev) => ({ ...prev, otpVerified: verified }));

  const registerUser = () => {
    // Same reasoning as navigateTo above: read from `state` directly
    // instead of inside a setState updater, so this only ever fires once.
    supabaseInsert("registrations", {
      user_name: state.userName || "VIP Guest",
      user_city: state.userCity || "Nagpur",
      user_phone: state.userPhone || "",
    }).catch((err) =>
      console.error("Supabase save (registrations) failed:", err),
    );
  };

  const updateRushScore = (bottles: number, score: number, bonus: number) => {
    setState((prev) => {
      const newScore = Math.max(prev.scoreRush, score);
      return {
        ...prev,
        bottlesCollected: bottles,
        scoreRush: newScore,
        scoreBottle: newScore,
        bonusPoints: bonus,
      };
    });
  };

  const updateZeroScore = (
    score: number,
    userPin: { x: number; y: number } | null,
  ) => {
    setState((prev) => ({
      ...prev,
      scoreZero: Math.max(prev.scoreZero, score),
      nagpurGuessed: true,
      userCityGuessed: true,
      userPinLocation: userPin,
    }));
  };

  const updateDecodeScore = (
    score: number,
    detailsFound: number,
    completed: boolean,
  ) => {
    setState((prev) => ({
      ...prev,
      decodeScore: Math.max(prev.decodeScore, score),
      decodeDetailsFound: Math.max(prev.decodeDetailsFound, detailsFound),
      decodeCompleted: prev.decodeCompleted || completed,
    }));
  };

  const updateBlendScore = (
    score: number,
    base: number,
    speedBonus: number,
    attempts: number,
    completed: boolean,
  ) => {
    setState((prev) => ({
      ...prev,
      blendScore: Math.max(prev.blendScore, score),
      blendBaseScore: base,
      blendSpeedBonus: speedBonus,
      blendIncorrectAttempts: attempts,
      blendCompleted: prev.blendCompleted || completed,
    }));
  };

  const addCityElementCount = (category: CityCategory) => {
    setState((prev) => ({
      ...prev,
      cityElements: {
        ...prev.cityElements,
        [category]: (prev.cityElements[category] || 0) + 1,
      },
    }));
  };

  const finishCityBuilding = (elementsPlacedCount: number) => {
    setState((prev) => {
      const cityScore = Math.min(3500, elementsPlacedCount * 180 + 1200);
      const updated = {
        ...prev,
        scoreCity: cityScore,
      };
      const total = computeMasterScore(updated);
      const pers = computePersonality(updated);
      const gift =
        prev.selectedGift ||
        REWARD_GIFTS[Math.floor(Math.random() * REWARD_GIFTS.length)];
      return {
        ...updated,
        totalScore: total,
        personality: pers,
        selectedGift: gift,
      };
    });
  };

  const updateHuntScore = (
    score: number,
    bottlesFound: number,
    bestTime: number,
  ) => {
    setState((prev) => ({
      ...prev,
      huntScore: Math.max(prev.huntScore || 0, score),
      huntBottlesFound: Math.max(prev.huntBottlesFound || 0, bottlesFound),
      huntBestTime:
        prev.huntBestTime > 0
          ? Math.min(prev.huntBestTime, bestTime)
          : bestTime,
    }));
  };

  const finishHuntGame = (
    score: number,
    bottlesFound: number,
    bestTime: number,
  ) => {
    setState((prev) => {
      const updated = {
        ...prev,
        huntScore: Math.max(prev.huntScore || 0, score),
        huntBottlesFound: Math.max(prev.huntBottlesFound || 0, bottlesFound),
        huntBestTime:
          prev.huntBestTime > 0
            ? Math.min(prev.huntBestTime, bestTime)
            : bestTime,
        huntCompleted: true,
        scoreCity: Math.max(
          prev.scoreCity || 0,
          Math.min(3500, Math.round(score * 0.12)),
        ),
      };
      const total = computeMasterScore(updated);
      const pers = computePersonality(updated);
      const gift =
        prev.selectedGift ||
        REWARD_GIFTS[Math.floor(Math.random() * REWARD_GIFTS.length)];
      return {
        ...updated,
        totalScore: total,
        personality: pers,
        selectedGift: gift,
      };
    });
  };

  const logSocialShare = (
    action: "caption_copied" | "card_downloaded" | "card_shared",
    caption?: string,
  ) => {
    setState((prev) => {
      supabaseInsert("social_shares", {
        user_name: prev.userName || null,
        user_city: prev.userCity || null,
        personality: prev.personality?.name ?? null,
        total_score: prev.totalScore || null,
        action,
        caption: caption ?? null,
      }).catch((err) =>
        console.error("Supabase save (social_shares) failed:", err),
      );
      return prev;
    });
  };

  const setScreenshotUploaded = (url: string) => {
    setState((prev) => ({
      ...prev,
      screenshotUploaded: true,
      uploadedScreenshotUrl: url,
    }));
  };

  const setScratchRevealed = (revealed: boolean) => {
    setState((prev) => ({ ...prev, scratchRevealed: revealed }));
  };

  const selectReward = (gift: RewardGift) => {
    setState((prev) => ({ ...prev, selectedGift: gift }));
  };

  const claimReward = () => {
    setState((prev) => ({ ...prev, rewardClaimed: true }));
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setState((prev) => ({ ...prev, soundMuted: muted }));
    return muted;
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  };

  const loadDemoState = () => {
    const demo: GameState = {
      userName: "Aarav Sharma",
      userCity: "Nagpur",
      userPhone: "9876543210",
      otpVerified: true,
      currentScreen: "screen-result",
      scoreRush: 1850,
      scoreBottle: 1850,
      bottlesCollected: 14,
      bonusPoints: 200,
      scoreZero: 960,
      nagpurGuessed: true,
      userCityGuessed: true,
      userPinLocation: { x: 380, y: 440 },
      decodeScore: 1150,
      decodeDetailsFound: 5,
      decodeCompleted: true,
      blendScore: 1680,
      blendBaseScore: 1000,
      blendSpeedBonus: 680,
      blendIncorrectAttempts: 0,
      blendCompleted: true,
      cityElements: {
        CITY: 3,
        CULTURE: 3,
        FOOD: 4,
        TECHNOLOGY: 2,
        LIFESTYLE: 2,
        FUTURE: 2,
      },
      scoreCity: 3200,
      huntScore: 27850,
      huntBottlesFound: 15,
      huntCompleted: true,
      huntBestTime: 18.6,
      totalScore: 9480,
      personality: null,
      screenshotUploaded: false,
      uploadedScreenshotUrl: null,
      scratchRevealed: false,
      selectedGift: REWARD_GIFTS[0],
      rewardClaimed: false,
      soundMuted: false,
    };
    demo.personality = computePersonality(demo);
    setState(demo);
  };

  return (
    <GameContext.Provider
      value={{
        state,
        setUserName,
        setUserCity,
        setUserPhone,
        setOtpVerified,
        registerUser,
        navigateTo,
        updateRushScore,
        updateZeroScore,
        updateDecodeScore,
        updateBlendScore,
        addCityElementCount,
        finishCityBuilding,
        updateHuntScore,
        finishHuntGame,
        logSocialShare,
        setScreenshotUploaded,
        setScratchRevealed,
        selectReward,
        claimReward,
        toggleSound,
        resetGame,
        loadDemoState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
