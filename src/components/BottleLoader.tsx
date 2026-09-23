import React from "react";
import bottleEmpty from "../assets/images/BottleEmpty.png";
import bottleFilled from "../assets/images/NewBottle.png";

interface BottleLoaderProps {
  percent: number;
  className?: string;
}

/**
 * Renders the bottle "empty," then reveals the full-color bottle from the
 * bottom up as `percent` climbs from 0 → 100. No wave line, no numeric
 * readout, no progress bar — just the fill itself.
 */
export const BottleLoader: React.FC<BottleLoaderProps> = ({
  percent,
  className = "",
}) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const topInset = 100 - clamped;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ aspectRatio: "605 / 1419" }}
    >
      {/* Empty / unfilled bottle */}
      <img
        src={bottleEmpty}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain opacity-85"
      />

      {/* Full-color bottle, clipped to reveal from the bottom up */}
      <img
        src={bottleFilled}
        alt="The Indian Edit"
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain transition-[clip-path] duration-700 ease-linear"
        style={{ clipPath: `inset(${topInset}% 0% 0% 0%)` }}
      />
    </div>
  );
};

export default BottleLoader;
