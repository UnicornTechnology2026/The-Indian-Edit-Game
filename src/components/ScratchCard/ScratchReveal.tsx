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
}

const BRUSH_SIZE = 52; // px, diameter of the "coin" used to scratch

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
    ctx.strokeRect(10, 10, w - 20, h - 20);

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let x = 20; x < w - 20; x += 20) {
      for (let y = 20; y < h - 20; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = "bold 15px Montserrat, sans-serif";
    ctx.fillStyle = "#170f0a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ SCRATCH TO REVEAL ✨", w / 2, h / 2 - 10);
    ctx.font = "bold 11px Montserrat, sans-serif";
    ctx.fillStyle = "#3d261a";
    ctx.fillText("YOUR PRIVILEGE REWARD", w / 2, h / 2 + 15);
  }, []);

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

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    let sampled = 0;
    for (let i = 3; i < data.length; i += 16) {
      sampled++;
      if (data[i] === 0) transparent++;
    }
    const pct = sampled ? Math.round((transparent / sampled) * 100) : 0;
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
    ctx.lineWidth = BRUSH_SIZE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_SIZE / 2, 0, Math.PI * 2);
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
