import React, { useLayoutEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { sound } from "../../utils/audio";
import coverImg from "../../assets/images/indian-edit-cover.png";

// Matches the native size of the new cover image (2:3)
const CARD_WIDTH = 1024;
const CARD_HEIGHT = 1536;
// Max on-screen preview width (desktop). On smaller screens the preview
// shrinks to fit its container so it never overflows the viewport.
const PREVIEW_MAX_WIDTH = 410;

export const ShareCard: React.FC = () => {
  const { state } = useGame();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(PREVIEW_MAX_WIDTH / CARD_WIDTH);

  // Keep the preview scale in sync with the width actually available
  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setScale(w / CARD_WIDTH);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const personality = state.personality;
  const archetypeName = personality?.name ?? "THE LUXURY EDITOR";
  const tagline =
    personality?.tagline ??
    personality?.quote?.replace(/^"|"$/g, "") ??
    "Elegance is the quiet harmony of craft and provenance.";
  const totalScore = state.totalScore > 0 ? state.totalScore : 0;
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
    <div className="flex w-full flex-col items-center gap-5">
      {/* Responsive preview: the box fills the available width (up to
          PREVIEW_MAX_WIDTH) at a fixed 2:3 ratio. The card itself is always
          rendered at full 1024x1536 (so the exported PNG is unaffected) and
          is visually scaled down by an outer wrapper. */}
      <div
        ref={previewRef}
        className="relative w-full overflow-hidden rounded-2xl border border-(--gold-border) shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        style={{
          maxWidth: PREVIEW_MAX_WIDTH,
          aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            ref={cardRef}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
            className="relative text-(--cream-white)"
          >
            {/* New Instagram post artwork (logo + courtyard) */}
            <img
              src={coverImg}
              alt=""
              crossOrigin="anonymous"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Personalised result — sits in the empty dark area of the artwork */}
            <div
              className="absolute z-10 flex flex-col items-center text-center"
              style={{ top: 500, left: 210, width: 700 }}
            >
              <div className="text-[18px] tracking-[6px] text-(--gold-light) opacity-80">
                YOUR ARCHETYPE
              </div>
              <div
                className="font-serif mt-6 text-[72px] font-bold leading-[1.05] tracking-[-0.5px] text-(--cream-white)"
                style={{ textShadow: "0 2px 18px rgba(0,0,0,0.7)" }}
              >
                {archetypeName.replace(/^THE\s+/i, "The ")}
              </div>
              <div
                className="font-serif italic mt-6 max-w-150 text-[28px] leading-snug text-(--gold-light)"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}
              >
                "{tagline}"
              </div>
            </div>

            {/* Footer: handle + legal line over a soft dark gradient for legibility */}
            <div
              className="absolute inset-x-0 bottom-0 z-10 pb-8 pt-24 text-center"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
              }}
            >
              {/* <div className="mt-4 text-[12px] text-(--cream-white) opacity-70">
              Please drink responsibly. For consumption by persons of legal
              drinking age only.
            </div> */}
            </div>
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
