import React, { useState } from "react";
import { GameProvider, useGame } from "./context/GameContext";
import { Header } from "./components/Header";

// Screens
import { LoginScreen } from "./components/Screens/LoginScreen";
import { OtpScreen } from "./components/Screens/OtpScreen";
import { WelcomeScreen } from "./components/Screens/WelcomeScreen";
import { Level1DecodeTheBottle } from "./components/Screens/Level1DecodeTheBottle";
import { Level2MasterTheBlend } from "./components/Screens/Level2MasterTheBlend";
import { Level3HuntTheEdit } from "./components/Screens/Level3HuntTheEdit";
import { SocialPostScreen } from "./components/Screens/SocialPostScreen";
import { UploadScreen } from "./components/Screens/UploadScreen";
import { ScratchCardScreen } from "./components/Screens/ScratchCardScreen";

// Modals
import { SettingsModal } from "./components/Modals/SettingsModal";
import { LeaderboardModal } from "./components/Modals/LeaderboardModal";
import { IntroHeroSplash } from "./components/IntroHeroSplash";
import { AgeGateModal } from "./components/Agegatemodal";

import { LoadingScreen } from "./components/LoadingScreen";

const MainExperience: React.FC = () => {
  const { state } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [showIntroSplash, setShowIntroSplash] = useState(true);
  const [showAgeGate, setShowAgeGate] = useState(false);

  const renderActiveScreen = () => {
    switch (state.currentScreen) {
      case "screen-login":
        return <LoginScreen />;
      case "screen-otp":
        return <OtpScreen />;
      case "screen-welcome":
        return <WelcomeScreen />;
      case "screen-level-1":
        return <Level1DecodeTheBottle />;
      case "screen-level-2":
        return <Level2MasterTheBlend />;
      case "screen-level-3":
        return <Level3HuntTheEdit />;
      case "screen-result":
        return <SocialPostScreen />;
      case "screen-social":
        return <SocialPostScreen />;
      case "screen-upload":
        return <UploadScreen />;
      case "screen-scratch":
        return <ScratchCardScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#d4af37]/30 selection:text-[#fff3c4]">
      {/* Full-screen intro — blocks everything underneath */}
      {showIntroSplash && (
        <IntroHeroSplash
          onEnter={() => {
            setShowIntroSplash(false);
            setShowAgeGate(true); // step 2: age modal
          }}
        />
      )}

      {/* Age gate — shown after "Enter The Experience", before the login form */}
      {showAgeGate && <AgeGateModal onEnter={() => setShowAgeGate(false)} />}

      {/* Only mount Header + screens AFTER intro is closed */}
      {!showIntroSplash && !showAgeGate && (
        <>
          <div>
            <Header
              onShowIntroSplash={() => setShowIntroSplash(true)}
              onShowLeaderboard={() => setIsLeaderboardOpen(true)}
            />
            <main className="w-full">{renderActiveScreen()}</main>
          </div>

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
          <LeaderboardModal
            isOpen={isLeaderboardOpen}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export function App() {
  const [appLoaded, setAppLoaded] = useState(false);

  if (!appLoaded) {
    return <LoadingScreen onComplete={() => setAppLoaded(true)} />;
  }

  return (
    <GameProvider>
      <MainExperience />
    </GameProvider>
  );
}

export default App;
