import React from 'react';
import { Sparkles } from 'lucide-react';

interface FoundIndicatorProps {
  foundCount: number;
  totalCount?: number;
}

export const FoundIndicator: React.FC<FoundIndicatorProps> = ({
  foundCount,
  totalCount = 5
}) => {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-[#140a05]/90 backdrop-blur-md border border-[#d4af37]/35 shadow-lg max-w-sm mx-auto">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
        <span className="font-serif text-xs font-bold tracking-[0.2em] text-[#faf5eb] uppercase">
          FOUND
        </span>
        <span className="font-mono text-xs font-bold text-[#f7e7a9]">
          {foundCount} / {totalCount}
        </span>
      </div>

      {/* 5 bottle icons */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalCount }).map((_, idx) => {
          const isFound = idx < foundCount;
          return (
            <div
              key={idx}
              className={`relative transition-all duration-500 flex items-center justify-center ${
                isFound
                  ? 'scale-110 text-[#d4af37]'
                  : 'opacity-35 text-[#ab9580]'
              }`}
              title={isFound ? `Bottle ${idx + 1} Found!` : `Bottle ${idx + 1} Hidden`}
            >
              {/* Mini Bottle Silhouette */}
              <div
                className={`w-4 h-7 rounded-t-sm rounded-b-md border transition-all duration-300 flex flex-col items-center justify-start pt-0.5 ${
                  isFound
                    ? 'bg-gradient-to-b from-[#f7e7a9] via-[#d4af37] to-[#8b4513] border-[#fff3c4] shadow-[0_0_10px_rgba(212,175,55,0.7)]'
                    : 'bg-[#1c0e07] border-[#ab9580]/40'
                }`}
              >
                {/* Cap */}
                <div
                  className={`w-2 h-1 rounded-xs ${
                    isFound ? 'bg-[#fff3c4]' : 'bg-[#ab9580]/50'
                  }`}
                />
                {/* Diamond Seal Accent */}
                {isFound && (
                  <div className="w-1.5 h-1.5 rotate-45 bg-[#8b151b] mt-1 shadow-xs" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
