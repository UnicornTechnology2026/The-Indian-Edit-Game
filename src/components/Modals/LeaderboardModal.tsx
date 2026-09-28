import React, { useEffect, useMemo, useState } from "react";
import { supabaseSelect } from "../../lib/supabaseClient";
import {
  X,
  Trophy,
  Crown,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LeaderboardRow {
  user_name: string;
  user_city: string;
  total_score: number;
  decode_score: number;
  blend_score: number;
  hunt_score: number;
}

interface LeaderboardEntry {
  name: string;
  city: string;
  level1: number;
  level2: number;
  level3: number;
  total: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortKey = "name" | "city" | "level1" | "level2" | "level3" | "total";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadLeaderboard = () => {
    setLoading(true);
    setError(null);
    supabaseSelect<LeaderboardRow>("game_results", {
      columns:
        "user_name,user_city,total_score,decode_score,blend_score,hunt_score",
      orderBy: "total_score",
      ascending: false,
      limit: 500,
    })
      .then((rows) => {
        setEntries(
          rows.map((row) => ({
            name: row.user_name || "VIP Guest",
            city: row.user_city || "—",
            level1: row.decode_score ?? 0,
            level2: row.blend_score ?? 0,
            level3: row.hunt_score ?? 0,
            total: row.total_score ?? 0,
          })),
        );
      })
      .catch((err) => {
        console.error("Failed to load leaderboard:", err);
        setError("Could not load the leaderboard. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    loadLeaderboard();
    setSearch("");
    setSortKey("total");
    setSortDir("desc");
    setPage(1);
  }, [isOpen]);

  // Reset to page 1 whenever the filter or sort changes
  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir]);

  // Filter, then sort. Ranks are computed AFTER sorting by total score
  // descending (independent of the user's current sort) so "#1" always
  // means the actual highest score, not just top of the current view.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) || e.city.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const ranked = useMemo(() => {
    const byTotalDesc = [...filtered].sort((a, b) => b.total - a.total);
    const rankMap = new Map<LeaderboardEntry, number>();
    byTotalDesc.forEach((e, i) => rankMap.set(e, i + 1));
    return filtered.map((e) => ({ ...e, rank: rankMap.get(e)! }));
  }, [filtered]);

  const sorted = useMemo(() => {
    const list = [...ranked];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name" || sortKey === "city") {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      } else {
        cmp = a[sortKey] - b[sortKey];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [ranked, sortKey, sortDir]);

  // Early return happens AFTER every hook has been called, so hook order
  // stays identical between renders regardless of `isOpen`.
  if (!isOpen) return null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "city" ? "asc" : "desc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[#d4af37]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#d4af37]" />
    );
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageStart = (clampedPage - 1) * pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pageSize);

  const columns: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "name", label: "Name" },
    { key: "city", label: "Place" },
    { key: "level1", label: "L1", align: "right" },
    { key: "level2", label: "L2", align: "right" },
    { key: "level3", label: "L3", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#22160f] border border-[#d4af37]/50 shadow-2xl text-[#faf6f0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#3d261a]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-serif text-xl font-bold text-[#faf6f0]">
              Leaderboard
            </h3>
            {!loading && !error && (
              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#3d261a] text-[#a69383] font-mono">
                {sorted.length} players
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadLeaderboard}
              className="p-1.5 rounded-lg text-[#a69383] hover:text-[#faf6f0] hover:bg-[#3d261a] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#a69383] hover:text-[#faf6f0] hover:bg-[#3d261a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search + page size */}
        {!loading && !error && entries.length > 0 && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-[#3d261a]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a69383]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or place..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#170f0a] border border-[#3d261a] text-xs text-[#e5d8cb] placeholder:text-[#6b5c4f] focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs bg-[#170f0a] border border-[#3d261a] rounded-lg px-2 py-1.5 text-[#e5d8cb] focus:outline-none focus:border-[#d4af37]/60"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#a69383]">
            <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
            <span className="text-xs tracking-wider uppercase">
              Loading Leaderboard...
            </span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center px-6">
            <p className="text-sm text-[#e5a5a5]">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="px-4 py-1.5 rounded-full bg-[#d4af37] text-[#170f0a] font-semibold text-xs hover:bg-[#f5d77f] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && entries.length === 0 && (
          <div className="py-16 text-center text-[#a69383] text-sm">
            No scores yet. Be the first to complete the experience!
          </div>
        )}

        {/* Table */}
        {!loading && !error && entries.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {sorted.length === 0 ? (
                <div className="py-16 text-center text-[#a69383] text-sm">
                  No players match "{search}".
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#22160f] z-10">
                    <tr className="text-[9px] font-bold uppercase tracking-wider text-[#a69383]">
                      <th className="py-2 pr-2 text-left w-10">#</th>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key)}
                          className={`py-2 px-2 cursor-pointer select-none hover:text-[#e5d8cb] transition-colors ${
                            col.align === "right" ? "text-right" : "text-left"
                          }`}
                        >
                          <span
                            className={`inline-flex items-center gap-1 ${
                              col.align === "right" ? "flex-row-reverse" : ""
                            }`}
                          >
                            {col.label}
                            {sortIcon(col.key)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3d261a]">
                    {pageRows.map((entry) => {
                      const isTop3 = entry.rank <= 3;
                      const rankColor =
                        entry.rank === 1
                          ? "text-[#d4af37]"
                          : entry.rank === 2
                            ? "text-[#c0c0c0]"
                            : entry.rank === 3
                              ? "text-[#cd7f32]"
                              : "text-[#a69383]";
                      return (
                        <tr
                          key={`${entry.name}-${entry.rank}`}
                          className={`transition-colors hover:bg-[#2e1e15]/60 ${
                            isTop3 ? "bg-[#d4af37]/6" : ""
                          }`}
                        >
                          <td className="py-2 pr-2">
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-bold ${rankColor}`}
                            >
                              {entry.rank === 1 && (
                                <Crown className="w-3 h-3" />
                              )}
                              {entry.rank}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-[#e5d8cb] font-medium max-w-40 truncate">
                            {entry.name}
                          </td>
                          <td className="py-2 px-2 text-[#a69383] max-w-32 truncate">
                            {entry.city}
                          </td>
                          <td className="py-2 px-2 text-right text-[#a69383] tabular-nums">
                            {entry.level1.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right text-[#a69383] tabular-nums">
                            {entry.level2.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right text-[#a69383] tabular-nums">
                            {entry.level3.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-[#f5d77f] tabular-nums">
                            {entry.total.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {sorted.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-[#3d261a] text-[11px] text-[#a69383]">
                <span>
                  Showing {pageStart + 1}–
                  {Math.min(pageStart + pageSize, sorted.length)} of{" "}
                  {sorted.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={clampedPage <= 1}
                    className="p-1.5 rounded-lg border border-[#3d261a] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#d4af37]/50 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono">
                    {clampedPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={clampedPage >= totalPages}
                    className="p-1.5 rounded-lg border border-[#3d261a] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#d4af37]/50 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end px-6 py-4 border-t border-[#3d261a]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#d4af37] text-[#170f0a] font-semibold text-xs hover:bg-[#f5d77f] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
