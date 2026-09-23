import React from "react";
import { HiddenBottle, DEBUG_MODE } from "../../data/huntData";
import { Sparkles, Check } from "lucide-react";
import NewBottle from "../../assets/images/NewBottle.png";

interface BottleHotspotProps {
  bottle: HiddenBottle;
  isFound: boolean;
  justFound: boolean;
  onBottleClick: (
    e: React.MouseEvent | React.TouchEvent,
    bottle: HiddenBottle,
  ) => void;
}

export const BottleHotspot: React.FC<BottleHotspotProps> = ({
  bottle,
  isFound,
  justFound,
  onBottleClick,
}) => {
  // Hit area padding for comfortable finger tapping on mobile
  const hitPaddingX = 2.0; // %
  const hitPaddingY = 2.0; // %

  const hitLeft = Math.max(0, bottle.x - hitPaddingX);
  const hitTop = Math.max(0, bottle.y - hitPaddingY);
  const hitWidth = bottle.width + hitPaddingX * 2;
  const hitHeight = bottle.height + hitPaddingY * 2;

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isFound) return;
    onBottleClick(e, bottle);
  };

  return (
    <>
      {/* 1. The Authentic Blended Bottle in the Scene */}
      <div
        className="absolute pointer-events-none transition-all duration-700 select-none z-10 flex items-center justify-center"
        style={{
          left: `${bottle.x}%`,
          top: `${bottle.y}%`,
          width: `${bottle.width}%`,
          height: `${bottle.height}%`,
          transform: `rotate(${bottle.rotation || 0}deg)`,
          transformOrigin: "center center",
        }}
      >
        <img
          src={NewBottle}
          alt="The Indian Edit Bottle"
          className={`w-full h-full object-contain transition-all duration-500 filter ${
            isFound
              ? "opacity-100 drop-shadow-[0_0_16px_rgba(212,175,55,0.9)] scale-105"
              : "drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
          }`}
          style={{
            opacity: isFound ? 1 : bottle.opacity || 0.82,
          }}
          referrerPolicy="no-referrer"
        />

        {/* Shimmering Discovery Aura & Ring */}
        {isFound && (
          <div className="absolute inset-0 -m-1 rounded-lg border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.8)] animate-pulse">
            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#d4af37] text-[#070403] flex items-center justify-center text-[10px] font-bold shadow-md">
              <Check className="w-2.5 h-2.5" />
            </span>
          </div>
        )}

        {/* Just Found Floating Burst Notification */}
        {justFound && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap pointer-events-none animate-bounce flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-[#d4af37] to-[#f7e7a9] text-[#070403] font-bold text-xs shadow-[0_4px_20px_rgba(212,175,55,0.9)]">
            <Sparkles className="w-3 h-3 text-[#070403]" />
            <span>FOUND! 200</span>
          </div>
        )}
      </div>

      {/* 2. Invisible Touchable Hotspot with Expanded Hit Area */}
      {!isFound && (
        <button
          type="button"
          tabIndex={0}
          aria-label={`Hidden bottle near ${bottle.hint}`}
          onClick={handleClick}
          onTouchStart={handleClick}
          className={`absolute z-20 cursor-pointer rounded-lg select-none outline-none focus:outline-none ${
            DEBUG_MODE
              ? "bg-red-500/20 border-2 border-red-500 text-[10px] text-white font-mono p-1 flex items-center justify-center"
              : "bg-transparent border-0"
          }`}
          style={{
            left: `${hitLeft}%`,
            top: `${hitTop}%`,
            width: `${hitWidth}%`,
            height: `${hitHeight}%`,
          }}
        >
          {DEBUG_MODE && <span>{bottle.id}</span>}
        </button>
      )}
    </>
  );
};
