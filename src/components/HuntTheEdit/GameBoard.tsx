import React, { useState, useRef, useLayoutEffect } from "react";
import { HiddenBottle, HuntRound, SCORING } from "../../data/huntData";
import { BottleHotspot } from "./BottleHotspot";
import { AlertCircle } from "lucide-react";

interface MissEffect {
  id: number;
  x: number; // %
  y: number; // %
}

interface GameBoardProps {
  round: HuntRound;
  foundBottleIds: string[];
  justFoundId: string | null;
  onBottleFound: (bottle: HiddenBottle) => void;
  onMiss: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  round,
  foundBottleIds,
  justFoundId,
  onBottleFound,
  onMiss,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [missEffects, setMissEffects] = useState<MissEffect[]>([]);

  // Board layout. The scene art is 16:9 landscape. On a portrait phone we rotate
  // the whole board 90deg so it fills the screen height instead of shrinking
  // into a thin strip. `long` / `short` are the board's own (pre-rotation) sides.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    rotated: boolean;
    long: number;
    short: number;
  }>({
    rotated: false,
    long: 0,
    short: 0,
  });

  useLayoutEffect(() => {
    const compute = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const availH = Math.max(200, vh - top - 12);
      const portraitPhone = vw < 768 && vh > vw;

      let next: { rotated: boolean; long: number; short: number };
      if (portraitPhone) {
        const availW = vw - 16;
        const long = Math.floor(Math.min(availH, availW * (16 / 9)));
        next = { rotated: true, long, short: Math.floor(long * (9 / 16)) };
      } else {
        const maxW = Math.min(vw - 16, 1024);
        const long = Math.floor(Math.min(maxW, availH * (16 / 9)));
        next = { rotated: false, long, short: Math.floor(long * (9 / 16)) };
      }
      setLayout((prev) =>
        prev.rotated === next.rotated &&
        prev.long === next.long &&
        prev.short === next.short
          ? prev
          : next,
      );
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    // Re-measure when content above the board changes height (e.g. site header hides)
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(compute)
        : null;
    ro?.observe(document.body);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
      ro?.disconnect();
    };
  }, []);

  // Handle wrong tap anywhere on the board
  const handleBoardClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // When the board is rotated 90deg clockwise, map screen coords back into
    // the board's own coordinate space.
    const clickXPercent = layout.rotated
      ? ((clientY - rect.top) / rect.height) * 100
      : ((clientX - rect.left) / rect.width) * 100;
    const clickYPercent = layout.rotated
      ? (1 - (clientX - rect.left) / rect.width) * 100
      : ((clientY - rect.top) / rect.height) * 100;

    // Trigger Miss Feedback
    onMiss();

    const newMiss: MissEffect = {
      id: Date.now() + Math.random(),
      x: Math.max(5, Math.min(95, clickXPercent)),
      y: Math.max(5, Math.min(95, clickYPercent)),
    };

    setMissEffects((prev) => [...prev, newMiss]);
    setTimeout(() => {
      setMissEffects((prev) => prev.filter((m) => m.id !== newMiss.id));
    }, 900);
  };

  const { rotated, long, short } = layout;
  const ready = long > 0;

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Footprint on screen: swaps width/height when the board is rotated */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{
          width: ready ? (rotated ? short : long) : "100%",
          height: ready ? (rotated ? long : short) : undefined,
          aspectRatio: ready ? undefined : "16/9",
        }}
      >
        {/* Immersive Game Stage Container (always 16:9 in its own space) */}
        <div
          ref={containerRef}
          onClick={handleBoardClick}
          className="absolute top-0 left-0 rounded-2xl overflow-hidden border border-[#d4af37]/40 bg-[#0c0503] shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-crosshair touch-manipulation"
          style={{
            width: ready ? long : "100%",
            height: ready ? short : "100%",
            transformOrigin: "top left",
            transform: rotated
              ? `translateX(${short}px) rotate(90deg)`
              : undefined,
          }}
        >
          {/* Loading Spinner */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0603] text-[#f7e7a9] z-20">
              <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-3" />
              <span className="font-serif text-xs tracking-widest uppercase">
                Preparing {round.title}...
              </span>
            </div>
          )}

          {/* Fallback state if background image fails */}
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#170b05] text-[#ebd9c0] p-6 z-20 text-center">
              <AlertCircle className="w-10 h-10 text-[#d4af37] mb-2" />
              <h3 className="font-serif text-lg font-bold text-[#faf5eb]">
                {round.title}
              </h3>
              <p className="text-xs text-[#ab9580] max-w-sm mt-1">
                Luxury heritage scene loaded in ambient mode. Scan for hidden
                bottles.
              </p>
            </div>
          )}

          {/* High Resolution Immersive Scene Background */}
          <img
            src={round.background}
            alt={`Scene: ${round.title}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Subtle Vignette & Royal Lighting Wash */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/40 via-transparent to-black/20" />

          {/* 5 Hidden Bottle Hotspots and Visual Embeds */}
          {round.bottles.map((bottle) => {
            const isFound = foundBottleIds.includes(bottle.id);
            const isJustFound = justFoundId === bottle.id;
            return (
              <BottleHotspot
                key={bottle.id}
                bottle={bottle}
                isFound={isFound}
                justFound={isJustFound}
                onBottleClick={(_, b) => onBottleFound(b)}
              />
            );
          })}

          {/* Floating Miss Indicators */}
          {missEffects.map((m) => (
            <div
              key={m.id}
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-fade-out"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
              }}
            >
              <div className="px-2.5 py-1 rounded-full bg-[#8b151b]/80 border border-[#e53e3e]/70 text-[#fed7d7] font-mono text-[11px] font-bold shadow-lg whitespace-nowrap">
                MISS {SCORING.WRONG_TAP}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
