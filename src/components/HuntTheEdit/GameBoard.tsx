import React, { useState, useRef } from 'react';
import { HiddenBottle, HuntRound } from '../../data/huntData';
import { BottleHotspot } from './BottleHotspot';
import { AlertCircle } from 'lucide-react';

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
  onMiss
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [missEffects, setMissEffects] = useState<MissEffect[]>([]);

  // Handle wrong tap anywhere on the board
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const clickXPercent = ((clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((clientY - rect.top) / rect.height) * 100;

    // Trigger Miss Feedback
    onMiss();

    const newMiss: MissEffect = {
      id: Date.now() + Math.random(),
      x: Math.max(5, Math.min(95, clickXPercent)),
      y: Math.max(5, Math.min(95, clickYPercent))
    };

    setMissEffects((prev) => [...prev, newMiss]);
    setTimeout(() => {
      setMissEffects((prev) => prev.filter((m) => m.id !== newMiss.id));
    }, 900);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Immersive Game Stage Container */}
      <div
        ref={containerRef}
        onClick={handleBoardClick}
        onTouchStart={handleBoardClick}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-[#d4af37]/40 bg-[#0c0503] shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-crosshair touch-manipulation"
        style={{
          aspectRatio: '16/9',
          maxHeight: '72vh'
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
              Luxury heritage scene loaded in ambient mode. Scan for hidden bottles.
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
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Subtle Vignette & Royal Lighting Wash */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />

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
              top: `${m.y}%`
            }}
          >
            <div className="px-2.5 py-1 rounded-full bg-[#8b151b]/80 border border-[#e53e3e]/70 text-[#fed7d7] font-mono text-[11px] font-bold shadow-lg whitespace-nowrap">
              MISS -100
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
