import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { sound } from "../../utils/audio";

/**
 * Replaces the hand-rolled <canvas> drawing in SocialPostScreen.tsx.
 * That version had real bugs worth not repeating here:
 *  - fillStyle = '#warm-beige' is not a color, it silently keeps the
 *    previous fillStyle (D12) — this component only ever uses the real
 *    hex/CSS-var tokens already defined in src/index.css.
 *  - it hard-coded coordinates for one fixed layout; this renders the
 *    actual on-screen DOM node via html-to-image, so preview and
 *    download are pixel-identical (no separate canvas re-implementation
 *    to keep in sync).
 *
 * Text-only layout: no bottle art. The middle block (archetype, tagline,
 * score, name) is vertically centered in the remaining space between the
 * wordmark and the footer, rather than being anchored to where the bottle
 * used to sit.
 *
 * Needs one new dependency: `npm install html-to-image`
 */

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350; // 4:5 — more feed real estate than a square post

export const ShareCard: React.FC = () => {
  const { state } = useGame();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const personality = state.personality;
  const archetypeName = personality?.name ?? "THE LUXURY EDITOR";
  const tagline =
    personality?.tagline ??
    personality?.quote?.replace(/^"|"$/g, "") ??
    "Elegance is the quiet harmony of craft and provenance.";
  const totalScore = state.totalScore > 0 ? state.totalScore : 7200;
  const scoreMax = 10000;

  const firstName = (state.userName || "VIP Guest").split(" ")[0];
  const lastInitial = (state.userName || "").trim().split(" ")[1]?.[0];
  const displayName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;

  const captionText = `I'm ${archetypeName} 🥃 India, but make it your own. ✨

Your style. Your story. Your Indian Edit. What's yours?\n\n#TheIndianEdit #IndianStyle #YourEdit #IndianMalt`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    sound.playSuccess();
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `The-Indian-Edit-${(state.userName || "Nagpur").replace(/\s+/g, "-")}-Archetype.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      pixelRatio: 1,
    });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "the-indian-edit.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: captionText });
    } else {
      handleDownload();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Scaled preview — the ref'd node is always rendered at full 1080x1350
          so the exported PNG matches this exactly, just visually scaled down */}
      <div
        className="overflow-hidden rounded-2xl border border-(--gold-border) shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        style={{ width: CARD_WIDTH * 0.32, height: CARD_HEIGHT * 0.32 }}
      >
        <div
          ref={cardRef}
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: "scale(0.32)",
            transformOrigin: "top left",
            background:
              "radial-gradient(1100px 700px at 50% 30%, var(--bg-tertiary) 0%, var(--bg-secondary) 55%, var(--bg-primary) 100%)",
          }}
          className="relative flex h-full flex-col text-(--cream-white)"
        >
          <div className="pointer-events-none absolute inset-11 border border-(--gold-border)" />

          {/* Wordmark */}
          <div className="relative z-10 pt-22 text-center">
            <div className="font-serif italic text-[34px] text-(--gold-light)">
              The Indian Edit
            </div>
            <div className="mt-2.5 text-[13px] tracking-[3.5px] text-(--muted-sand)">
              THE INDIAN EDIT — MILE MAP OF INDIA
            </div>
          </div>

          {/* Result — vertically centered in the space between wordmark and footer,
              now that there's no bottle art anchoring it lower on the card */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-25 text-center">
            <div className="font-serif text-[80px] font-bold leading-[1.05] tracking-[-0.5px] text-(--cream-white)">
              {archetypeName.replace(/^THE\s+/i, "The ")}
            </div>
            <div className="font-serif italic mt-7 max-w-180 text-[28px] leading-snug text-(--gold-light)">
              "{tagline}"
            </div>

            <div className="mt-12 flex items-center justify-center gap-4.5 text-[20px]">
              <span className="font-semibold text-(--cream-white)">
                Score {totalScore.toLocaleString()} /{" "}
                {scoreMax.toLocaleString()}
              </span>
              <span className="h-1.25 w-1.25 rounded-full bg-(--gold-primary)" />
              <span className="text-(--muted-sand)">
                {state.userCity || "Nagpur"}
              </span>
            </div>
            <div className="mt-3.5 text-[16px] text-(--muted-sand)">
              {displayName}
            </div>
          </div>

          <div className="relative z-10 mx-auto h-px w-22.5 bg-(--gold-border)" />

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between px-22 pt-6 pb-10">
            <div className="flex flex-col gap-1.5">
              <div className="text-[16px] font-semibold text-(--gold-light)">
                @TheIndianEdit
              </div>
              <div className="text-[13px] text-(--muted-sand)">
                #TheIndianEdit #theindianwhisky #abdl_india
              </div>
            </div>
            <div className="flex h-16.5 w-16.5 items-center justify-center border border-(--gold-border) text-center text-[9px] tracking-wider text-(--muted-sand)">
              SCAN
              <br />
              TO
              <br />
              PLAY
            </div>
          </div>

          <div className="relative z-10 pb-7 text-center text-[11.5px] text-(--muted-sand) opacity-70">
            Please drink responsibly. For consumption by persons of legal
            drinking age only.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="btn-gold flex items-center gap-2 px-5 py-2.5 text-xs disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          <span>{exporting ? "Preparing…" : "Download card (.png)"}</span>
        </button>
      </div>
    </div>
  );
};
