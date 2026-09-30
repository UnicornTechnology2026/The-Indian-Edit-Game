import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { supabaseSelect } from "../../lib/supabaseClient";
import bottleImg from "../../assets/images/NewBottle.png";
import bannerTop from "../../assets/images/banner-top.webp";

interface LeaderboardRow {
  user_name: string;
  total_score: number;
}

interface Entry {
  name: string;
  total: number;
  rank: number; // global rank, kept even when search filters the list
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 6; // players per page
const FETCH_LIMIT = 100; // how many top scores to load in total

// Where the leaderboard sits on the bottle (percent of the 605x1419 image).
const PANEL = { top: 32, height: 56, left: 3, right: 8 };

const GOLD_TEXT: React.CSSProperties = {
  background: "linear-gradient(180deg,#fff2b8 0%,#e6c25a 45%,#9a7420 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const RANK_COLORS: Record<number, string> = {
  1: "#f5c84c",
  2: "#d9dde3",
  3: "#d98a5b",
};

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const color = RANK_COLORS[rank];
  if (color) {
    return (
      <span
        className="relative inline-flex items-center justify-center"
        style={{ width: "8cqw", height: "8cqw" }}
      >
        <Crown
          style={{ width: "8cqw", height: "8cqw", color, fill: color }}
          strokeWidth={1.2}
        />
        <span
          className="absolute font-serif font-bold"
          style={{ fontSize: "2.8cqw", color: "#3a1208", top: "2.6cqw" }}
        >
          {rank}
        </span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-serif font-bold"
      style={{
        width: "6.4cqw",
        height: "6.4cqw",
        fontSize: "3cqw",
        paddingTop: "1cqw",
        color: "#f1d27a",
        border: "0.35cqw solid #d4af37",
        background: "rgba(30,6,3,0.6)",
      }}
    >
      {rank}
    </span>
  );
};

const Divider: React.FC = () => (
  <div className="flex items-center justify-center" style={{ gap: "1.2cqw" }}>
    <span
      style={{
        height: 1,
        flex: 1,
        background: "linear-gradient(90deg,transparent,#d4af37)",
      }}
    />
    <span style={{ color: "#d4af37", fontSize: "2.4cqw" }}>◆ ❖ ◆</span>
    <span
      style={{
        height: 1,
        flex: 1,
        background: "linear-gradient(270deg,transparent,#d4af37)",
      }}
    />
  </div>
);

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    supabaseSelect<LeaderboardRow>("game_results", {
      columns: "user_name,total_score",
      orderBy: "total_score",
      ascending: false,
      limit: FETCH_LIMIT,
    })
      .then((rows) =>
        setEntries(
          rows.map((r, i) => ({
            name: r.user_name || "VIP Guest",
            total: r.total_score ?? 0,
            rank: i + 1,
          })),
        ),
      )
      .catch((err) => {
        console.error("Failed to load leaderboard:", err);
        setError("Could not load the leaderboard.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    setQuery("");
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? entries.filter((e) => e.name.toLowerCase().includes(q))
    : entries;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    width: "7cqw",
    height: "7cqw",
    borderRadius: 999,
    border: "1px solid rgba(212,175,55,0.7)",
    background: "rgba(35,7,4,0.6)",
    color: "#f1d27a",
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center pl-4">
        <div
          className="relative w-full"
          style={{
            maxWidth: 280,
            aspectRatio: "605 / 1419",
            containerType: "inline-size",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bottle */}
          <img
            src={bottleImg}
            alt="The Indian Edit bottle"
            className="absolute inset-0 w-full h-full select-none pointer-events-none"
            draggable={false}
          />

          {/* Amber panel that covers the original label, feathered at the edges */}
          <div
            className="absolute"
            style={{
              top: `${PANEL.top}%`,
              height: `${PANEL.height}%`,
              left: `${PANEL.left}%`,
              right: `${PANEL.right}%`,
              background:
                "radial-gradient(ellipse at 50% 40%, #8f3016 0%, #6a2010 45%, #3f150c 100%)",
              WebkitMaskImage:
                "linear-gradient(to right,transparent,#000 7%,#000 93%,transparent), linear-gradient(to bottom,transparent,#000 5%,#000 95%,transparent)",
              maskImage:
                "linear-gradient(to right,transparent,#000 7%,#000 93%,transparent), linear-gradient(to bottom,transparent,#000 5%,#000 95%,transparent)",
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          />

          {/* Leaderboard content */}
          <div
            className="absolute flex flex-col"
            style={{
              top: `${PANEL.top + 1.5}%`,
              height: `${PANEL.height - 3}%`,
              left: `${PANEL.left + 3}%`,
              right: `${PANEL.right + 3}%`,
            }}
          >
            {/* Title */}
            <div
              className="flex flex-col items-center"
              style={{ gap: "0.6cqw" }}
            >
              <img src={bannerTop} alt="" className="h-15 w-30" />
              <h3
                className="font-serif font-bold uppercase"
                style={{
                  fontSize: "7.4cqw",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                  ...GOLD_TEXT,
                }}
              >
                Leaderboard
              </h3>
            </div>
            <div style={{ margin: "1.2cqw 0 1.8cqw" }}>
              <Divider />
            </div>
            {/* Search */}
            <div
              className="flex items-center"
              style={{
                gap: "1.8cqw",
                height: "8cqw",
                padding: "5cqw 3.4cqw",
                marginBottom: "1.8cqw",
                borderRadius: 999,
                border: "1px solid rgba(212,175,55,0.7)",
                background: "rgba(35,7,4,0.6)",
              }}
            >
              <Search
                className="shrink-0"
                style={{ width: "3.8cqw", height: "3.8cqw", color: "#e6c25a" }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search player"
                aria-label="Search players"
                className="flex-1 min-w-0 bg-transparent outline-none font-serif placeholder:text-[#f3d9a4]/50"
                style={{ fontSize: "3.4cqw", color: "#f7ecd6" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 flex items-center justify-center"
                  style={{ color: "#e6c25a" }}
                >
                  <X style={{ width: "3.8cqw", height: "3.8cqw" }} />
                </button>
              )}
            </div>
            {/* Column headers */}
            <div
              className="grid font-serif font-bold uppercase"
              style={{
                gridTemplateColumns: "13cqw 1fr auto",
                padding: "0 3cqw",
                fontSize: "2.4cqw",
                letterSpacing: "0.08em",
                color: "#e6c25a",
                borderBottom: "1px solid rgba(212,175,55,0.6)",
                marginBottom: "1.6cqw",
                marginTop: "1cqw",
              }}
            >
              <span>Rank</span>
              <span>Player</span>
              <span>Score</span>
            </div>
            {/* Rows: always 8 slots per page, with clear space between rows */}
            <div
              className="flex-1 min-h-0 grid"
              style={{
                gridTemplateRows: `repeat(${PAGE_SIZE}, 8.4cqw)`,
                rowGap: "2.4cqw",
                alignContent: "start",
              }}
            >
              {loading && (
                <div
                  className="flex items-center justify-center"
                  style={{ gridRow: `1 / span ${PAGE_SIZE}` }}
                >
                  <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
                </div>
              )}

              {!loading && error && (
                <div
                  className="flex flex-col items-center justify-center text-center"
                  style={{
                    gridRow: `1 / span ${PAGE_SIZE}`,
                    gap: "2cqw",
                    color: "#f3d9a4",
                  }}
                >
                  <p style={{ fontSize: "3.4cqw" }}>{error}</p>
                  <button
                    onClick={load}
                    className="rounded-full bg-[#d4af37] text-[#170f0a] font-semibold"
                    style={{ fontSize: "3cqw", padding: "1cqw 4cqw" }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading &&
                !error &&
                entries.length > 0 &&
                filtered.length === 0 && (
                  <div
                    className="flex items-center justify-center text-center"
                    style={{
                      gridRow: `1 / span ${PAGE_SIZE}`,
                      fontSize: "3.4cqw",
                      color: "#f3d9a4",
                    }}
                  >
                    No players found for “{query.trim()}”.
                  </div>
                )}

              {!loading && !error && entries.length === 0 && (
                <div
                  className="flex items-center justify-center text-center"
                  style={{
                    gridRow: `1 / span ${PAGE_SIZE}`,
                    fontSize: "3.4cqw",
                    color: "#f3d9a4",
                  }}
                >
                  No scores yet. Be the first!
                </div>
              )}

              {!loading &&
                !error &&
                pageRows.map((e, i) => {
                  const rank = e.rank; // global rank (unchanged by search)
                  const isFirst = rank === 1;
                  return (
                    <div
                      key={`${e.name}-${rank}`}
                      className="flex items-center"
                      style={{
                        height: "100%",
                        padding: rank > 3 ? "0 4.6cqw" : "0.5cqw 3cqw",
                        borderRadius: 999,
                        border: "1px solid rgba(212,175,55,0.65)",
                        background: isFirst
                          ? "linear-gradient(90deg, rgba(212,175,55,0.45), rgba(90,20,10,0.55))"
                          : "rgba(35,7,4,0.55)",
                        boxShadow: isFirst
                          ? "0 0 12px rgba(212,175,55,0.35)"
                          : "none",
                      }}
                    >
                      <span
                        className="flex items-center shrink-0"
                        style={{ width: rank > 3 ? "11.4cqw" : "13cqw" }}
                      >
                        <RankBadge rank={rank} />
                      </span>
                      <span
                        className="font-serif truncate flex-1 min-w-0"
                        style={{
                          fontSize: "3.6cqw",
                          color: "#f7ecd6",
                          lineHeight: 1.2,
                        }}
                      >
                        {e.name}
                      </span>
                      <span
                        className="font-serif font-bold tabular-nums shrink-0"
                        style={{
                          fontSize: "3.6cqw",
                          color: "#f1d27a",
                          lineHeight: 1.2,
                        }}
                      >
                        {e.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
            </div>
            {/* Pagination */}
            {!loading && !error && filtered.length > 0 && (
              <div
                className="flex items-center justify-center"
                style={{ gap: "4cqw", marginBottom: "-1.5cqw" }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="flex items-center justify-center transition-colors"
                  style={navBtn(currentPage <= 1)}
                >
                  <ChevronLeft style={{ width: "4cqw", height: "4cqw" }} />
                </button>
                <span
                  className="font-serif tabular-nums"
                  style={{
                    fontSize: "3cqw",
                    color: "#f1d27a",
                    letterSpacing: "0.1em",
                  }}
                >
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  className="flex items-center justify-center transition-colors"
                  style={navBtn(currentPage >= totalPages)}
                >
                  <ChevronRight style={{ width: "4cqw", height: "4cqw" }} />
                </button>
              </div>
            )}{" "}
          </div>

          {/* Refresh / close */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={load}
              title="Refresh"
              className="p-2 rounded-full bg-black/50 text-[#f1d27a] hover:bg-black/70 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 rounded-full bg-black/50 text-[#f1d27a] hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
