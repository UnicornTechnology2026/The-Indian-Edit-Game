import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { REWARD_GIFTS } from "../../data/rewards";
import { Gift, Copy, Check, Trophy, CheckCircle2 } from "lucide-react";
import { sound } from "../../utils/audio";
import { ScratchReveal } from "../ScratchCard/ScratchReveal";

export const ScratchCardScreen: React.FC = () => {
  const { state, setScratchRevealed, claimReward, navigateTo } = useGame();

  const [copiedCode, setCopiedCode] = useState(false);
  const [claimed, setClaimed] = useState(state.rewardClaimed);

  const gift = state.selectedGift || REWARD_GIFTS[0];

  const voucherCode = `EDIT-NGP-${(state.userPhone || "7892").slice(-4)}-ROYAL`;

  const handleCopy = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopiedCode(true);
    sound.playClick();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleClaim = () => {
    sound.playSuccess();
    setClaimed(true);
    claimReward();
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 animate-fade-in text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2e1e15] border border-[#d4af37]/40 text-xs text-[#f5d77f] mb-3">
        <Gift className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>GRAND FINALE PRIVILEGE</span>
      </div>

      <h2 className="font-serif text-3xl sm:text-4xl font-bold gold-gradient-text">
        Gold Foil Scratch Card
      </h2>

      <p className="text-xs text-[#f2ead9] mt-1 max-w-sm mx-auto">
        Rub the metallic foil surface to reveal your limited-edition privilege
        code.
      </p>

      <div className="mt-6 gold-card p-6 relative overflow-hidden max-w-md mx-auto">
        <ScratchReveal
          revealed={state.scratchRevealed}
          onReveal={() => setScratchRevealed(true)}
          className="w-full aspect-16/10 rounded-xl"
        >
          <div className="w-full h-full rounded-xl bg-linear-to-b from-[#160602] to-[#2e1a10] border border-[#d4af37]/50 p-5 flex flex-col items-center justify-center text-center shadow-inner">
            <div className="w-14 h-14 rounded-full bg-[#170f0a] border-2 border-[#d4af37] flex items-center justify-center text-3xl mb-2 shadow">
              {gift.icon || "🎁"}
            </div>

            <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-bold">
              OFFICIAL PRIVILEGE
            </span>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#fff1b8] mt-0.5">
              {gift.name}
            </h3>

            <p className="text-xs text-[#f5d77f] mt-1 font-semibold">
              Value: {gift.value}
            </p>

            <p className="text-[11px] text-[#a69383] max-w-xs mt-1">
              {gift.description}
            </p>
          </div>
        </ScratchReveal>
      </div>
    </div>
  );
};
