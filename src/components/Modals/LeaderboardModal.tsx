import React from "react";
import { X, Trophy, Medal, Award, Crown } from "lucide-react";
import { useGame } from "../../context/GameContext";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  city: string;
  archetype: string;
  score: number;
  badge: string;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Parag Giradkar",
    city: "Nagpur",
    archetype: "THE MODERN MAVERICK",
    score: 9840,
    badge: "Gold Grandmaster",
  },
  {
    rank: 2,
    name: "Ananya Deshmukh",
    city: "Nagpur",
    archetype: "THE LUXURY EDITOR",
    score: 9690,
    badge: "Heritage Patron",
  },
  {
    rank: 3,
    name: "Rohan Kulkarni",
    city: "Mumbai",
    archetype: "THE HERITAGE CURATOR",
    score: 9550,
    badge: "Zero Mile Elite",
  },
  {
    rank: 4,
    name: "Meera Sen",
    city: "Pune",
    archetype: "THE CREATIVE VISIONARY",
    score: 9410,
    badge: "Blend Maestro",
  },
  {
    rank: 5,
    name: "Kabir Varma",
    city: "Bengaluru",
    archetype: "THE FUTURE BUILDER",
    score: 9280,
    badge: "City Architect",
  },
  {
    rank: 6,
    name: "Devika Singhania",
    city: "Delhi",
    archetype: "THE MODERN MAVERICK",
    score: 9140,
    badge: "Heritage Patron",
  },
  {
    rank: 7,
    name: "Aditya Patil",
    city: "Nagpur",
    archetype: "THE LUXURY EDITOR",
    score: 8990,
    badge: "Master Blender",
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state } = useGame();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#22160f] border border-[#d4af37]/50 shadow-2xl p-6 text-[#faf6f0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#3d261a]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h3 className="font-serif text-xl font-bold text-[#faf6f0]">
                Nagpur Edit Hall of Fame
              </h3>
              <p className="text-xs text-[#a69383]">
                Top Master Blenders & City Curators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a69383] hover:text-[#faf6f0] hover:bg-[#3d261a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Standing Card */}
        {state.userName && (
          <div className="mt-4 p-4 rounded-xl bg-linear-to-r from-[#3d261a] to-[#22160f] border border-[#d4af37]/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#d4af37] text-[#170f0a] font-bold flex items-center justify-center text-sm shadow">
                ★
              </div>
              <div>
                <div className="text-xs font-bold text-[#faf6f0] flex items-center gap-1.5">
                  <span>{state.userName}</span>
                  <span className="text-[10px] text-[#f5d77f] font-normal px-2 py-0.5 rounded-full bg-[#170f0a]/60 border border-[#d4af37]/30">
                    {state.userCity || "Nagpur"}
                  </span>
                </div>
                <div className="text-[11px] text-[#d4af37]">
                  {state.personality?.name || "In Progress"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#a69383] uppercase tracking-wider font-bold">
                Your Score
              </div>
              <div className="font-serif text-lg font-bold text-[#f5d77f]">
                {state.totalScore > 0
                  ? state.totalScore.toLocaleString()
                  : (
                      state.scoreRush +
                      state.scoreZero +
                      state.decodeScore +
                      state.blendScore
                    ).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="mt-4 space-y-2">
          {LEADERBOARD_DATA.map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={entry.rank}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  entry.rank === 1
                    ? "bg-[#332014]/90 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    : isTop3
                      ? "bg-[#2a1a11] border-[#d4af37]/40"
                      : "bg-[#1e130d] border-[#3d261a]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      entry.rank === 1
                        ? "bg-[#d4af37] text-[#170f0a]"
                        : entry.rank === 2
                          ? "bg-slate-300 text-[#170f0a]"
                          : entry.rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-[#2e1e15] text-[#a69383]"
                    }`}
                  >
                    {entry.rank === 1 ? (
                      <Crown className="w-3.5 h-3.5" />
                    ) : (
                      entry.rank
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#faf6f0] flex items-center gap-2">
                      <span>{entry.name}</span>
                      <span className="text-[10px] text-[#a69383]">
                        ({entry.city})
                      </span>
                    </div>
                    <div className="text-[10px] text-[#d4af37] tracking-wider uppercase">
                      {entry.archetype}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif text-sm font-bold text-[#f5d77f]">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#a69383]">{entry.badge}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#d4af37] text-[#170f0a] font-semibold text-xs hover:bg-[#f5d77f] transition-colors"
          >
            Close Rankings
          </button>
        </div>
      </div>
    </div>
  );
};
