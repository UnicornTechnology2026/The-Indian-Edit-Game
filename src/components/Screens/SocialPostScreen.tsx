import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { Copy, Check, ArrowRight, Image as ImageIcon } from "lucide-react";
import { sound } from "../../utils/audio";
import { ShareCard } from "../ShareCard/ShareCard";

export const SocialPostScreen: React.FC = () => {
  const { state, navigateTo } = useGame();
  const [copied, setCopied] = useState(false);

  const personalityName = state.personality?.name || "THE LUXURY EDITOR";
  const totalScore =
    state.totalScore > 0
      ? state.totalScore
      : state.scoreRush +
        state.scoreZero +
        state.decodeScore +
        state.blendScore +
        state.scoreCity;

  const captionText = `I'm ${personalityName}  India, but make it your own. Your style. Your story. Your Indian Edit.\n\n#theindianedit #theindianwhisky #abdl_india #indianWhisky`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2e1e15] border border-[#d4af37]/40 text-xs text-[#f5d77f]">
          <ImageIcon className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>YOUR RESULT</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#faf6f0] mt-1">
          Share Your Archetype
        </h2>
        <p className="text-xs text-[#f2ead9 ] mt-1">
          Download your card or copy the caption to post on Instagram.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: the actual card + its own download/share buttons */}
        <div className="md:col-span-6 flex justify-center">
          <ShareCard />
        </div>

        {/* Right: caption + next step */}
        <div className="md:col-span-6 space-y-4">
          <div className="gold-card p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2">
              Social Media Caption
            </h4>
            <div className="p-3.5 rounded-xl bg-[#170f0a] border border-[#3d261a] text-xs text-(--warm-beige) font-mono whitespace-pre-line leading-relaxed">
              {captionText}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleCopyCaption}
                className="px-4 py-2.5 rounded-full border border-[#d4af37]/40 bg-[#22160f] text-xs font-semibold text-[#f5d77f] hover:bg-[#2e1e15] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-[#d4af37]" />
                )}
                <span>{copied ? "Caption Copied!" : "Copy Caption"}</span>
              </button>
            </div>
          </div>

          {/* Next Step Incentive Card */}
          <div className="p-4 rounded-xl bg-[#22160f] border border-[#d4af37]/40 space-y-2">
            <div className="text-xs font-bold text-[#faf6f0]">
              Upload Share Proof to Unlock Royal Scratch Card
            </div>
            <p className="text-[11px] text-[#a69383]">
              Post your card or story, upload a screenshot, and claim your gold
              foil privilege prize!
            </p>

            <button
              onClick={() => {
                sound.playClick();
                navigateTo("screen-upload");
              }}
              className="w-full py-3 btn-gold text-xs font-bold flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Verify Share & Unlock Scratch Reward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
