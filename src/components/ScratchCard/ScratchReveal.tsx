import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { sound } from "../../utils/audio";

interface ScratchRevealProps {
  /** The content underneath the foil (coupon / prize). Always in the DOM, but
   *  the opaque gold foil canvas sits on top until the customer scratches it. */
  children: React.ReactNode;
  /** 0–100. Reveal fires once the scratched percentage crosses this. */
  threshold?: number;
  /** Called once, the moment the threshold is crossed. */
  onReveal?: () => void;
  /** Controlled reveal state — lets the parent persist "already revealed"
   *  (e.g. from GameContext) instead of this component owning it alone. */
  revealed?: boolean;
  /** Show the "Instant reveal" shortcut. Off by default so the customer has to
   *  scratch the foil themselves before the coupon appears. */
  allowInstantReveal?: boolean;
  className?: string;
  /** "gold" = metallic gold foil (default). "glass" = amber/copper glass card
   *  that matches the bottle (no gold, no artwork). */
  variant?: "gold" | "glass" | "image";
  /** "diamond" paints the gold foil only inside a diamond (rhombus), so the
   *  transparent corners don't count towards the scratched percentage. */
  shape?: "rect" | "diamond";
  /** Used by variant="image": the picture painted as the scratch layer
   *  (PNG with transparent corners works for non-rectangular cards). */
  coverImage?: HTMLImageElement | null;
  /** variant="image": vertical position (0–1) of the printed cover text. */
  coverTextY?: number;
  /** Diameter of the scratch "coin" in CSS px. */
  brushSize?: number;
  /** Text printed on the glass card's scratch layer. */
  coverTitle?: string;
  coverSubtitle?: string;
  /** Called once, on the first touch/click on the scratch layer. */
  onScratchStart?: () => void;
}

const BRUSH_SIZE = 52; // px, diameter of the "coin" used to scratch

// Number of sampled pixels that are still covered (alpha > 0).
function countOpaque(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !canvas.width || !canvas.height) return 0;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let n = 0;
  for (let i = 3; i < data.length; i += 16) if (data[i] > 0) n++;
  return n;
}

/**
 * Generic gold-foil scratch card. The customer must rub the gold foil away;
 * only then is the content underneath revealed.
 */
export const ScratchReveal: React.FC<ScratchRevealProps> = ({
  children,
  threshold = 40,
  onReveal,
  revealed: revealedProp,
  allowInstantReveal = false,
  className = "",
  variant = "gold",
  shape = "rect",
  coverImage = null,
  coverTextY = 0.56,
  brushSize = BRUSH_SIZE,
  coverTitle = "SCRATCH",
  coverSubtitle = "TO REVEAL YOUR PRIVILEGE",
  onScratchStart,
}) => {
  const [internalRevealed, setInternalRevealed] = useState(false);
  const revealed = revealedProp ?? internalRevealed;

  const [scratchedPct, setScratchedPct] = useState(0);
  // If the foil ever fails to paint we must NOT leave the coupon exposed.
  const [foilFailed, setFoilFailed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const lastCheck = useRef(0);
  const firedRef = useRef(false);
  const lastSize = useRef({ w: 0, h: 0 });
  const startedRef = useRef(false);
  // Opaque (still-covered) samples right after painting. Used as the 100%
  // reference so transparent corners of a non-rectangular card don't count.
  const baselineRef = useRef(0);

  const fireReveal = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setInternalRevealed(true);
    sound.playSuccess();
    onReveal?.();
  }, [onReveal]);

  // Paint the opaque gold foil.
  // NOTE: canvas gradients cannot take CSS variables ("var(--x)" throws a
  // SyntaxError), so we read the computed value of each variable first and
  // fall back to a plain hex colour.
  const paintFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    const { width: w, height: h } = canvas;

    const style = getComputedStyle(containerRef.current || canvas);
    const resolve = (name: string, fallback: string) =>
      style.getPropertyValue(name)?.trim() || fallback;

    ctx.globalCompositeOperation = "source-over";

    // Image scratch layer (e.g. the diamond label): draw it to fill the card.
    if (variant === "image") {
      ctx.clearRect(0, 0, w, h);
      if (coverImage && coverImage.complete && coverImage.naturalWidth) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(coverImage, 0, 0, w, h);
      } else {
        // Image still loading: plain red, matching the label colour.
        ctx.fillStyle = "#a31d2b";
        ctx.fillRect(0, 0, w, h);
      }

      // Subtle embossed gold text so the red foil reads as "scratch me".
      if (coverTitle) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(40,0,0,0.55)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = "rgba(240,214,140,0.92)";
        ctx.font = `600 ${Math.round(w * 0.062)}px "Playfair Display", serif`;
        ctx.fillText(coverTitle, w / 2, h * coverTextY);
        if (coverSubtitle) {
          ctx.fillStyle = "rgba(247,228,180,0.85)";
          ctx.font = `500 ${Math.max(9, Math.round(w * 0.028))}px Poppins, sans-serif`;
          ctx.fillText(coverSubtitle, w / 2, h * coverTextY + w * 0.062);
        }
        ctx.shadowColor = "transparent";
      }
      return;
    }

    // Glass scratch card: amber/copper tones that match the bottle's glass.
    // No gold foil, no bottle artwork.
    if (variant === "glass") {
      const r = Math.min(18, w / 8);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, r);
      ctx.clip();

      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, "#5a1e0f");
      base.addColorStop(0.5, "#8f3a18");
      base.addColorStop(1, "#47180a");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(
        w / 2,
        h * 0.45,
        0,
        w / 2,
        h * 0.45,
        Math.max(w, h) * 0.6,
      );
      glow.addColorStop(0, "rgba(255,150,80,0.30)");
      glow.addColorStop(1, "rgba(255,150,80,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // fine diagonal texture so it reads as a scratch-off surface
      ctx.strokeStyle = "rgba(255,235,210,0.06)";
      ctx.lineWidth = 1;
      for (let i = -h; i < w; i += 9) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }

      // inner border
      ctx.strokeStyle = "rgba(255,225,195,0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(8, 8, w - 16, h - 16, Math.max(r - 6, 4));
      ctx.stroke();

      // text
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#fbe9d2";
      ctx.font = `bold ${Math.round(w * 0.14)}px Montserrat, sans-serif`;
      ctx.fillText(coverTitle, w / 2, h / 2 - w * 0.06);
      ctx.strokeStyle = "rgba(255,225,195,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h / 2 + w * 0.02);
      ctx.lineTo(w * 0.72, h / 2 + w * 0.02);
      ctx.stroke();
      ctx.font = `600 ${Math.max(8, Math.round(w * 0.05))}px Montserrat, sans-serif`;
      ctx.fillStyle = "#f1d3b0";
      ctx.fillText(coverSubtitle, w / 2, h / 2 + w * 0.09);
      ctx.restore();
      return;
    }

    const isDiamond = shape === "diamond";
    if (isDiamond) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(0, h / 2);
      ctx.closePath();
      ctx.clip();
    }

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, resolve("--gold-shimmer", "#fff3c4"));
    grad.addColorStop(0.3, resolve("--gold-primary", "#d4af37"));
    grad.addColorStop(0.6, resolve("--gold-dark", "#937119"));
    grad.addColorStop(0.8, resolve("--gold-shimmer", "#fff3c4"));
    grad.addColorStop(1, resolve("--gold-dark", "#937119"));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = resolve("--gold-light", "#f7e7a9");
    ctx.lineWidth = 3;
    if (isDiamond) {
      const m = Math.max(6, w * 0.05);
      ctx.beginPath();
      ctx.moveTo(w / 2, m * 1.4);
      ctx.lineTo(w - m * 1.4, h / 2);
      ctx.lineTo(w / 2, h - m * 1.4);
      ctx.lineTo(m * 1.4, h / 2);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.strokeRect(10, 10, w - 20, h - 20);
    }

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let x = 20; x < w - 20; x += 20) {
      for (let y = 20; y < h - 20; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const big = isDiamond ? Math.max(11, Math.round(w * 0.085)) : 15;
    const small = isDiamond ? Math.max(8, Math.round(w * 0.048)) : 11;
    ctx.font = `bold ${big}px Montserrat, sans-serif`;
    ctx.fillStyle = "#170f0a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      isDiamond ? "SCRATCH TO REVEAL" : "✨ SCRATCH TO REVEAL ✨",
      w / 2,
      h / 2 - (isDiamond ? small * 0.9 : 10),
    );
    ctx.font = `bold ${small}px Montserrat, sans-serif`;
    ctx.fillStyle = "#3d261a";
    ctx.fillText(
      "YOUR PRIVILEGE REWARD",
      w / 2,
      h / 2 + (isDiamond ? big * 0.7 : 15),
    );
    if (isDiamond) ctx.restore();
  }, [shape, variant, coverImage, coverTitle, coverSubtitle]);

  // Layout effect so the foil is painted before the browser's first paint —
  // the coupon is never visible, not even for a single frame.
  useLayoutEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Match canvas pixel size to the container's layout size. (clientWidth is
    // unaffected by CSS transforms/animations, unlike getBoundingClientRect.)
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      // Only repaint when the size really changed — repainting wipes any
      // scratching the customer has already done.
      if (w === lastSize.current.w && h === lastSize.current.h) return;
      lastSize.current = { w, h };
      canvas.width = w;
      canvas.height = h;
      try {
        paintFoil();
        baselineRef.current = countOpaque(canvas);
        setFoilFailed(false);
      } catch (err) {
        console.error("Scratch foil failed to paint", err);
        setFoilFailed(true);
      }
    };
    lastSize.current = { w: 0, h: 0 };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [revealed, paintFoil]);

  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed || firedRef.current) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !canvas.width || !canvas.height) return;

    const base = baselineRef.current;
    const pct = base
      ? Math.max(
          0,
          Math.min(100, Math.round((1 - countOpaque(canvas) / base) * 100)),
        )
      : 0;
    setScratchedPct(pct);
    if (pct >= threshold) fireReveal();
  }, [revealed, threshold, fireReveal]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    // Erase the foil along the finger/mouse path (a continuous stroke, so fast
    // movement doesn't leave gaps).
    const from = lastPoint.current ?? { x, y };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    lastPoint.current = { x, y };

    const now = performance.now();
    if (now - lastCheck.current > 120) {
      lastCheck.current = now;
      sound.playClick();
      checkScratchPercentage();
    }
  };

  const endStroke = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    // Final check so the last bit of scratching is never missed by the throttle.
    checkScratchPercentage();
  };

  const showInstantButton = !revealed && (allowInstantReveal || foilFailed);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${className}`}
      // Fail closed: if the foil couldn't be painted, hide the coupon rather
      // than exposing it. (The instant-reveal button below stays visible.)
      style={foilFailed && !revealed ? { visibility: "hidden" } : undefined}
    >
      {children}
      {!revealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            if (!startedRef.current) {
              startedRef.current = true;
              onScratchStart?.();
            }
            isDrawing.current = true;
            lastPoint.current = null;
            scratchAt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (isDrawing.current) scratchAt(e.clientX, e.clientY);
          }}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-xl"
        />
      )}
      {showInstantButton && (
        <button
          onClick={fireReveal}
          style={{ visibility: "visible" }}
          className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-[#170f0a]/80 px-2.5 py-1 text-[10px] text-(--gold-light) hover:underline"
        >
          <Sparkles className="h-3 w-3" />
          {foilFailed ? "Reveal" : `Instant reveal (${scratchedPct}%)`}
        </button>
      )}
    </div>
  );
};
