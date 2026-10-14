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
import bottleImg from "../../assets/images/leaderboard.png";

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

const PAGE_SIZE = 5; // players per page
const FETCH_LIMIT = 100; // how many top scores to load in total

// Where the leaderboard sits ON the bottle, as a percentage of the bottle
// itself (not of the PNG canvas). It starts just under the gold "THE INDIAN
// EDIT" lettering and stops above the engraved "THE INDIAN" at the base.
const CONTENT = { top: 45.8, height: 46.5, left: 8.5, right: 8.5 };

// Lifts the page-turn row (‹ 1 / 1 ›) up. Bigger number = higher on the bottle,
// 0 = original position. Unit: 1 = 1% of the bottle's width.
const PAGINATION_UP = 12;

// Fallback bottle proportions (width / height) until the PNG has loaded.
const DEFAULT_RATIO = 238 / 550;
5;
// ---------------------------------------------------------------------------
// The bottle PNG has transparent margins. We measure the real bottle (its
// opaque pixels) once, then size the card to the bottle itself so the text can
// be placed on the glass with exact percentages and nothing gets squashed.
// ---------------------------------------------------------------------------
interface Bounds {
  nw: number; // natural width of the PNG
  nh: number; // natural height of the PNG
  x: number; // bottle bounding box inside the PNG
  y: number;
  w: number;
  h: number;
}

let boundsCache: Bounds | null = null;

const useBottleBounds = (src: string): Bounds | null => {
  const [bounds, setBounds] = useState<Bounds | null>(boundsCache);

  useEffect(() => {
    if (boundsCache) return;
    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      let result: Bounds = { nw, nh, x: 0, y: 0, w: nw, h: nh };
      try {
        const c = document.createElement("canvas");
        c.width = nw;
        c.height = nh;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const { data } = ctx.getImageData(0, 0, nw, nh);
          let minX = nw,
            minY = nh,
            maxX = -1,
            maxY = -1;
          for (let y = 0; y < nh; y++) {
            for (let x = 0; x < nw; x++) {
              if (data[(y * nw + x) * 4 + 3] > 40) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          if (maxX > minX && maxY > minY) {
            result = {
              nw,
              nh,
              x: minX,
              y: minY,
              w: maxX - minX + 1,
              h: maxY - minY + 1,
            };
          }
        }
      } catch {
        /* fall back to the whole image */
      }
      boundsCache = result;
      setBounds(result);
    };
    img.src = src;
  }, [src]);

  return bounds;
};

const GOLD_TEXT: React.CSSProperties = {
  background: "linear-gradient(180deg,#fff2b8 0%,#e6c25a 45%,#9a7420 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.85))",
};

// Soft shadow so text stays readable straight on the bottle (no panel behind it).
const TEXT_SHADOW = "0 1px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)";

const RANK_COLORS: Record<number, string> = {
  1: "#f5c84c",
  2: "#d9dde3",
  3: "#d98a5b",
};

// Same width for the header "Rank" column and every row's rank cell so the
// columns line up exactly.
const RANK_COL = "12cqw";
const SIDE_PAD = "3.2cqw";

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const color = RANK_COLORS[rank];
  if (color) {
    return (
      <span
        className="relative inline-flex items-center justify-center"
        style={{ width: "6.6cqw", height: "6.6cqw" }}
      >
        <Crown
          style={{ width: "6.6cqw", height: "6.6cqw", color, fill: color }}
          strokeWidth={1.2}
        />
        <span
          className="absolute font-serif font-bold"
          style={{ fontSize: "2.4cqw", color: "#3a1208", top: "2.2cqw" }}
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
        width: "5.4cqw",
        height: "5.4cqw",
        fontSize: "2.6cqw",
        color: "#f1d27a",
        border: "0.3cqw solid #d4af37",
        background: "rgba(30,6,3,0.45)",
        textShadow: TEXT_SHADOW,
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
    <span style={{ color: "#d4af37", fontSize: "2.2cqw" }}>◆ ❖ ◆</span>
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
  const bounds = useBottleBounds(bottleImg);

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
    width: "6cqw",
    height: "6cqw",
    borderRadius: 999,
    border: "1px solid rgba(212,175,55,0.7)",
    background: "rgba(20,4,2,0.35)",
    color: "#f1d27a",
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  const ratio = bounds ? bounds.w / bounds.h : DEFAULT_RATIO;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-hidden overflow-x-hidden bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Refresh / close — pinned to the screen corner, off the bottle */}
      <div className="fixed top-3 right-3 z-10 flex gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            load();
          }}
          title="Refresh"
          className="p-2 rounded-full bg-black/50 text-[#f1d27a] hover:bg-black/70 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close"
          className="p-2 rounded-full bg-black/50 text-[#f1d27a] hover:bg-black/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="min-h-full flex items-center justify-center px-4 py-3">
        <div
          className="relative"
          style={{
            // Capped by the 340px max AND the viewport height, so the card
            // always shrinks proportionally (never squashed or stretched).
            width: `min(100%, 270px, calc((100svh - 24px) * ${ratio}))`,
            aspectRatio: `${ratio}`,
            containerType: "inline-size",
            visibility: bounds ? "visible" : "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bottle — the PNG is cropped to the bottle's own edges */}
          <img
            src={bottleImg}
            alt="The Indian Edit bottle"
            className="absolute select-none pointer-events-none"
            style={
              bounds
                ? {
                    maxWidth: "none",
                    width: `${(bounds.nw / bounds.w) * 100}%`,
                    height: `${(bounds.nh / bounds.h) * 100}%`,
                    left: `${(-bounds.x / bounds.w) * 100}%`,
                    top: `${(-bounds.y / bounds.h) * 100}%`,
                  }
                : { inset: 0, width: "100%", height: "100%" }
            }
            draggable={false}
          />

          {/* Leaderboard content */}
          <div
            className="absolute flex flex-col"
            style={{
              top: `${CONTENT.top}%`,
              height: `${CONTENT.height}%`,
              left: `${CONTENT.left}%`,
              right: `${CONTENT.right}%`,
            }}
          >
            {/* Title */}
            <div
              className="flex flex-col items-center"
              style={{ gap: "0.4cqw" }}
            >
              <h3
                className="font-serif font-bold uppercase"
                style={{
                  fontSize: "6.6cqw",
                  letterSpacing: "0.03em",
                  lineHeight: 1,
                  ...GOLD_TEXT,
                }}
              >
                Leaderboard
              </h3>
            </div>
            <div style={{ margin: "1cqw 0 1.6cqw" }}>
              <Divider />
            </div>
            {/* Search */}
            <div
              className="flex items-center shrink-0"
              style={{
                gap: "1.6cqw",
                height: "8cqw",
                padding: `4cqw ${SIDE_PAD}`,
                marginBottom: "1.6cqw",
                borderRadius: 999,
                border: "1px solid rgba(212,175,55,0.7)",
                background: "rgba(20,4,2,0.3)",
              }}
            >
              <Search
                className="shrink-0"
                style={{ width: "3.4cqw", height: "3.4cqw", color: "#e6c25a" }}
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
                className="flex-1 min-w-0 bg-transparent outline-none font-serif placeholder:text-[#f3d9a4]/60"
                style={{ fontSize: "3.2cqw", color: "#f7ecd6" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 flex items-center justify-center"
                  style={{ color: "#e6c25a" }}
                >
                  <X style={{ width: "3.4cqw", height: "3.4cqw" }} />
                </button>
              )}
            </div>
            {/* Column headers */}
            <div
              className="grid font-serif font-bold uppercase shrink-0"
              style={{
                gridTemplateColumns: `${RANK_COL} 1fr auto`,
                padding: `0 ${SIDE_PAD}`,
                fontSize: "2.2cqw",
                letterSpacing: "0.08em",
                color: "#e6c25a",
                textShadow: TEXT_SHADOW,
                borderBottom: "1px solid rgba(212,175,55,0.6)",
                paddingBottom: "0.6cqw",
                marginBottom: "2.6cqw",
              }}
            >
              <span>Rank</span>
              <span>Player</span>
              <span>Score</span>
            </div>
            {/* Rows: always PAGE_SIZE slots per page, with clear space between */}
            <div
              className="flex-1 min-h-0 grid"
              style={{
                gridTemplateRows: `repeat(${PAGE_SIZE}, 8cqw)`,
                rowGap: "3.5cqw",
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
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  <p style={{ fontSize: "3.2cqw" }}>{error}</p>
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
                      fontSize: "3.2cqw",
                      color: "#f3d9a4",
                      textShadow: TEXT_SHADOW,
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
                    fontSize: "3.2cqw",
                    color: "#f3d9a4",
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  No scores yet. Be the first!
                </div>
              )}

              {!loading &&
                !error &&
                pageRows.map((e) => {
                  const rank = e.rank; // global rank (unchanged by search)
                  const isFirst = rank === 1;
                  return (
                    <div
                      key={`${e.name}-${rank}`}
                      className="flex items-center"
                      style={{
                        height: "100%",
                        padding: `4cqw ${SIDE_PAD}`,
                        borderRadius: 999,
                        border: "1px solid rgba(212,175,55,0.6)",
                        background: isFirst
                          ? "linear-gradient(90deg, rgba(212,175,55,0.35), rgba(90,20,10,0.15))"
                          : "rgba(20,4,2,0.28)",
                        boxShadow: isFirst
                          ? "0 0 12px rgba(212,175,55,0.35)"
                          : "none",
                      }}
                    >
                      <span
                        className="flex items-center shrink-0"
                        style={{ width: RANK_COL }}
                      >
                        <RankBadge rank={rank} />
                      </span>
                      <span
                        className="font-serif truncate flex-1 min-w-0"
                        style={{
                          fontSize: "4cqw",
                          color: "#f7ecd6",
                          lineHeight: 1.2,
                          textShadow: TEXT_SHADOW,
                        }}
                      >
                        {e.name}
                      </span>
                      <span
                        className="font-serif font-bold tabular-nums shrink-0"
                        style={{
                          fontSize: "4cqw",
                          color: "#f1d27a",
                          lineHeight: 1.2,
                          textShadow: TEXT_SHADOW,
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
                className="flex items-center justify-center shrink-0"
                style={{
                  gap: "3.5cqw",
                  paddingTop: "1cqw",
                  position: "relative",
                  top: `-${PAGINATION_UP}cqw`,
                }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="flex items-center justify-center transition-colors"
                  style={navBtn(currentPage <= 1)}
                >
                  <ChevronLeft style={{ width: "3.6cqw", height: "3.6cqw" }} />
                </button>
                <span
                  className="font-serif tabular-nums"
                  style={{
                    fontSize: "2.8cqw",
                    color: "#f1d27a",
                    letterSpacing: "0.1em",
                    textShadow: TEXT_SHADOW,
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
                  <ChevronRight style={{ width: "3.6cqw", height: "3.6cqw" }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
