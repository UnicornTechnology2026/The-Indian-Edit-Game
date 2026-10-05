import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  AdminAuthError,
  AdminSession,
  DashboardData,
  GameResultRow,
  RegistrationRow,
  deleteRows,
  fetchDashboardData,
  getValidSession,
} from "./adminApi";
import {
  Analytics,
  computeAnalytics,
  downloadCsv,
  formatDuration,
  playedFlag,
  runSeconds,
  registeredPhonesWhoPlayed,
} from "./analytics";

import { AnalyticsOverview } from "./AnalyticsOverview";

import logo from "../assets/images/editLogo.svg";

// ---------- helpers ----------

const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString("en-IN");

const fmtDate = (s?: string | null) => {
  const d = s ? new Date(s) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
};
const dateValue = (s?: string | null) => {
  const t = s ? new Date(s).getTime() : 0;
  return Number.isNaN(t) ? 0 : t;
};

type Tab = "overview" | "players" | "times" | "registrations";

// ---------- small UI pieces ----------

const Card: React.FC<{
  title?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, right, className = "", children }) => (
  <section
    className={`rounded-2xl border border-[#d4af37]/30 bg-[#140a05]/90 p-4 sm:p-5 ${className}`}
  >
    {(title || right) && (
      <div className="flex items-center justify-between gap-3 mb-3">
        {title && (
          <h2 className="font-serif text-sm sm:text-base font-bold tracking-wide text-[#f7e7a9]">
            {title}
          </h2>
        )}
        {right}
      </div>
    )}
    {children}
  </section>
);

// ---------- generic data table ----------

interface Column<T> {
  key: string;
  label: string;
  cell: (row: T) => React.ReactNode;
  sort?: (row: T) => string | number;
  csv?: (row: T) => string | number;
  align?: "left" | "right";
}

function DataTable<T>({
  rows,
  columns,
  searchText,
  exportName,
  defaultSort,
  pageSize = 15,
  emptyText = "No records found.",
  getId,
  onDelete,
  showSrNo = false,
}: {
  rows: T[];
  columns: Column<T>[];
  searchText: (row: T) => string;
  exportName: string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  pageSize?: number;
  emptyText?: string;
  /** Row primary key; rows without one cannot be deleted. */
  getId?: (row: T) => number | string | undefined;
  /** Deletes the given ids, then the parent reloads the data. */
  onDelete?: (ids: (number | string)[]) => Promise<void>;
  showSrNo?: boolean;
}) {
  const [selected, setSelected] = useState<Set<number | string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const canDelete = !!(getId && onDelete);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState(defaultSort?.key ?? "");
  const [dir, setDir] = useState<"asc" | "desc">(defaultSort?.dir ?? "desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? rows.filter((r) => searchText(r).toLowerCase().includes(needle))
      : rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sort) return filtered;
    const f = col.sort;
    return [...filtered].sort((a, b) => {
      const x = f(a);
      const y = f(b);
      const c =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y));
      return dir === "asc" ? c : -c;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, dir]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = sorted.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  const toggleSort = (key: string) => {
    if (key === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("desc");
    }
  };

  const idsOf = (list: T[]) =>
    list
      .map((r) => getId?.(r))
      .filter((id): id is number | string => id !== undefined);
  const pageIds = idsOf(slice);
  const allIds = idsOf(sorted);
  const pageAllSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const selectedCount = allIds.filter((id) => selected.has(id)).length;

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (pageAllSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  const toggleOne = (id: number | string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const deleteIds = async (ids: (number | string)[]) => {
    if (!ids.length || !onDelete) return;
    const ok = window.confirm(
      `Permanently delete ${ids.length} record${ids.length === 1 ? "" : "s"}? This cannot be undone.`,
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await onDelete(ids);
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } finally {
      setDeleting(false);
    }
  };
  const deleteSelected = () =>
    deleteIds(allIds.filter((id) => selected.has(id)));

  const exportCsv = () => {
    const cols = columns.filter((c) => c.csv || c.sort);
    downloadCsv(
      `${exportName}-${new Date().toISOString().slice(0, 10)}.csv`,
      cols.map((c) => c.label),
      sorted.map((r) => cols.map((c) => (c.csv ?? c.sort)!(r))),
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-3">
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ab9580]" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, city, phone, coupon…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0c0503] border border-[#d4af37]/30 focus:border-[#d4af37] outline-none text-xs"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-[#ab9580]">
          <span>
            {fmt(sorted.length)} record{sorted.length === 1 ? "" : "s"}
          </span>
          {canDelete && selectedCount > 0 && (
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e53e3e]/60 bg-[#8b151b]/30 text-[#fed7d7] hover:bg-[#8b151b]/50 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete ({fmt(selectedCount)})
            </button>
          )}
          <button
            onClick={exportCsv}
            disabled={!sorted.length}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/40 text-[#f7e7a9] hover:bg-[#d4af37]/10 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {canDelete && rows.length > 0 && allIds.length === 0 && (
        <div className="mb-2 rounded-lg border border-[#e58325]/50 bg-[#e58325]/10 px-3 py-2 text-xs text-[#fbd38d]">
          These records have no <code>id</code> column, so they can't be
          deleted. Run supabase-admin-delete.sql (it adds one) and refresh.
        </div>
      )}

      {canDelete && pageAllSelected && allIds.length > pageIds.length && (
        <div className="mb-2 text-xs text-[#ab9580]">
          {selectedCount === allIds.length ? (
            <>All {fmt(allIds.length)} matching records are selected. </>
          ) : (
            <>This page is selected. </>
          )}
          <button
            className="underline text-[#f7e7a9]"
            onClick={() =>
              setSelected(
                selectedCount === allIds.length ? new Set() : new Set(allIds),
              )
            }
          >
            {selectedCount === allIds.length
              ? "Clear selection"
              : `Select all ${fmt(allIds.length)} matching records`}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#d4af37]/20">
        <table className="w-full text-xs">
          <thead className="bg-[#1f1008] text-[#ab9580]">
            <tr>
              {canDelete && (
                <th className="px-3 py-2.5 w-8">
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={pageAllSelected}
                    onChange={togglePage}
                    className="accent-[#d4af37]"
                  />
                </th>
              )}
              {showSrNo && (
                <th className="px-3 py-2.5 font-semibold tracking-wide whitespace-nowrap text-left w-14">
                  Sr. No.
                </th>
              )}
              {columns.map((c) => {
                const active = c.key === sortKey;
                return (
                  <th
                    key={c.key}
                    className={`px-3 py-2.5 font-semibold tracking-wide whitespace-nowrap ${
                      c.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {c.sort ? (
                      <button
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 hover:text-[#f7e7a9]"
                      >
                        {c.label}
                        {active ? (
                          dir === "asc" ? (
                            <ArrowUp className="w-3 h-3 text-[#d4af37]" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-[#d4af37]" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={
                    columns.length + (canDelete ? 1 : 0) + (showSrNo ? 1 : 0)
                  }
                  className="px-3 py-8 text-center text-[#ab9580]"
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {slice.map((r, i) => (
              <tr
                key={i}
                className="border-t border-[#d4af37]/10 hover:bg-[#d4af37]/5"
              >
                {canDelete && (
                  <td className="px-3 py-2.5">
                    {getId!(r) !== undefined && (
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={selected.has(getId!(r)!)}
                        onChange={() => toggleOne(getId!(r)!)}
                        className="accent-[#d4af37]"
                      />
                    )}
                  </td>
                )}
                {showSrNo && (
                  <td className="px-3 py-2.5 whitespace-nowrap tabular-nums text-[#ab9580]">
                    {safePage * pageSize + i + 1}
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2.5 whitespace-nowrap ${
                      c.align === "right" ? "text-right tabular-nums" : ""
                    }`}
                  >
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-[#ab9580]">
          <span>
            Page {safePage + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="p-1.5 rounded-lg border border-[#d4af37]/30 hover:bg-[#d4af37]/10 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(pages - 1, safePage + 1))}
              disabled={safePage >= pages - 1}
              className="p-1.5 rounded-lg border border-[#d4af37]/30 hover:bg-[#d4af37]/10 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- table definitions ----------

const dash = (v?: string | null) => (v && v.trim() ? v : "—");

const CouponBadge: React.FC<{ row: GameResultRow }> = ({ row }) =>
  row.coupon_code ? (
    <div className="leading-tight">
      <span className="font-mono text-[#f7e7a9]">{row.coupon_code}</span>
      {(row.coupon_name || row.coupon_value) && (
        <span className="block text-[10px] text-[#ab9580]">
          {[row.coupon_name, row.coupon_value].filter(Boolean).join(" · ")}
        </span>
      )}
    </div>
  ) : (
    <span className="text-[#ab9580]">—</span>
  );

const playerColumns: Column<GameResultRow>[] = [
  {
    key: "name",
    label: "Name",
    cell: (r) => <span className="font-semibold">{dash(r.user_name)}</span>,
    sort: (r) => r.user_name || "",
  },
  {
    key: "city",
    label: "City",
    cell: (r) => dash(r.user_city),
    sort: (r) => r.user_city || "",
  },
  {
    key: "phone",
    label: "Phone",
    cell: (r) => dash(r.user_phone),
    sort: (r) => r.user_phone || "",
  },
  {
    key: "l1",
    label: "Level 1",
    align: "right",
    cell: (r) => fmt(r.decode_score),
    sort: (r) => r.decode_score ?? 0,
  },
  {
    key: "l2",
    label: "Level 2",
    align: "right",
    cell: (r) => fmt(r.blend_score),
    sort: (r) => r.blend_score ?? 0,
  },
  {
    key: "l3",
    label: "Level 3",
    align: "right",
    cell: (r) => fmt(r.hunt_score),
    sort: (r) => r.hunt_score ?? 0,
  },
  {
    key: "total",
    label: "Total",
    align: "right",
    cell: (r) => (
      <span className="font-bold text-[#f7e7a9]">{fmt(r.total_score)}</span>
    ),
    sort: (r) => r.total_score ?? 0,
  },
  {
    key: "coupon",
    label: "Coupon",
    cell: (r) => <CouponBadge row={r} />,
    sort: (r) => r.coupon_code || "",
    csv: (r) =>
      [r.coupon_code, r.coupon_name, r.coupon_value]
        .filter(Boolean)
        .join(" | "),
  },
];

const timeColumns: Column<GameResultRow>[] = [
  {
    key: "name",
    label: "Name",
    cell: (r) => <span className="font-semibold">{dash(r.user_name)}</span>,
    sort: (r) => r.user_name || "",
  },
  {
    key: "city",
    label: "City",
    cell: (r) => dash(r.user_city),
    sort: (r) => r.user_city || "",
  },
  {
    key: "t1",
    label: "Level 1 time",
    align: "right",
    cell: (r) => formatDuration(r.decode_time_seconds),
    sort: (r) => r.decode_time_seconds ?? 0,
    csv: (r) => formatDuration(r.decode_time_seconds),
  },
  {
    key: "t2",
    label: "Level 2 time",
    align: "right",
    cell: (r) => formatDuration(r.blend_time_seconds),
    sort: (r) => r.blend_time_seconds ?? 0,
    csv: (r) => formatDuration(r.blend_time_seconds),
  },
  {
    key: "t3",
    label: "Level 3 time",
    align: "right",
    cell: (r) => formatDuration(r.hunt_time_seconds),
    sort: (r) => r.hunt_time_seconds ?? 0,
    csv: (r) => formatDuration(r.hunt_time_seconds),
  },
  {
    key: "ttotal",
    label: "Total time",
    align: "right",
    cell: (r) => (
      <span className="font-bold text-[#f7e7a9]">
        {formatDuration(runSeconds(r))}
      </span>
    ),
    sort: (r) => runSeconds(r),
    csv: (r) => formatDuration(runSeconds(r)),
  },
];

const timeSearch = (r: GameResultRow) =>
  [r.user_name, r.user_city].filter(Boolean).join(" ");

const playerSearch = (r: GameResultRow) =>
  [
    r.user_name,
    r.user_city,
    r.user_phone,
    r.coupon_code,
    r.coupon_name,
    r.coupon_value,
  ]
    .filter(Boolean)
    .join(" ");

// ---------- dashboard ----------

interface AdminDashboardProps {
  session: AdminSession;
  onSignOut: (message?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSignOut,
}) => {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Keep the latest onSignOut without re-triggering the fetch effect.
  const signOutRef = useRef(onSignOut);
  signOutRef.current = onSignOut;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const s = await getValidSession();
      if (!s) {
        signOutRef.current("Your session expired. Please sign in again.");
        return;
      }
      setData(await fetchDashboardData(s));
      setUpdatedAt(new Date());
    } catch (err) {
      if (err instanceof AdminAuthError) {
        signOutRef.current(err.message);
        return;
      }
      setError(err instanceof Error ? err.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 60_000);
    return () => clearInterval(t);
  }, [load]);

  const playedPhones = useMemo(
    () => registeredPhonesWhoPlayed(data?.results ?? []),
    [data],
  );

  const registrationColumns: Column<RegistrationRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        cell: (r) => <span className="font-semibold">{dash(r.user_name)}</span>,
        sort: (r) => r.user_name || "",
      },
      {
        key: "city",
        label: "City",
        cell: (r) => dash(r.user_city),
        sort: (r) => r.user_city || "",
      },
      {
        key: "phone",
        label: "Phone",
        cell: (r) => dash(r.user_phone),
        sort: (r) => r.user_phone || "",
      },
      {
        key: "played",
        label: "Finished game",
        cell: (r) =>
          playedFlag(r, playedPhones) ? (
            <span className="text-[#9ae6b4]">Yes</span>
          ) : (
            <span className="text-[#ab9580]">Not yet</span>
          ),
        sort: (r) => (playedFlag(r, playedPhones) ? 1 : 0),
        csv: (r) => (playedFlag(r, playedPhones) ? "Yes" : "No"),
      },
    ],
    [playedPhones],
  );

  const handleDelete = useCallback(
    (table: "game_results" | "registrations") =>
      async (ids: (number | string)[]) => {
        setError("");
        try {
          const s = await getValidSession();
          if (!s) {
            signOutRef.current("Your session expired. Please sign in again.");
            return;
          }
          await deleteRows(s, table, ids);
          await load(true);
        } catch (err) {
          if (err instanceof AdminAuthError) {
            signOutRef.current(err.message);
            return;
          }
          setError(err instanceof Error ? err.message : "Delete failed.");
        }
      },
    [load],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "players", label: "Players & Scores" },
    { id: "times", label: "Play Time" },
    { id: "registrations", label: "Registrations" },
  ];

  const [range, setRange] = useState(14);

  const analytics: Analytics | null = useMemo(
    () => (data ? computeAnalytics(data, range) : null),
    [data, range],
  );

  return (
    <div className="min-h-screen text-[#faf5eb]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#d4af37]/30 bg-[#0c0503]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
          <div className="min-w-0">
            <button
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
              title="Return to Experience Home"
            >
              <div className="ml-10">
                <img src={logo} alt="" className="h-25 w-35" />
              </div>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-[#d4af37] text-[#f7e7a9] font-semibold"
                    : "border-transparent text-[#ab9580] hover:text-[#faf5eb]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0 py-1.5">
            <button
              onClick={() => load()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/40 text-xs text-[#f7e7a9] hover:bg-[#d4af37]/10 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => onSignOut()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/40 text-xs text-[#f7e7a9] hover:bg-[#d4af37]/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-4">
        {loading && !data && (
          <div className="flex items-center justify-center py-24 text-[#d4af37]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {data && analytics && tab === "overview" && (
          <AnalyticsOverview
            analytics={analytics}
            range={range}
            onRangeChange={setRange}
            updatedAt={updatedAt}
          />
        )}

        {data && tab === "players" && (
          <Card title="Every player · points per level · coupon">
            <DataTable
              rows={data.results}
              columns={playerColumns}
              searchText={playerSearch}
              exportName="players"
              defaultSort={{ key: "total", dir: "desc" }}
              getId={(r) => r.id}
              onDelete={handleDelete("game_results")}
              showSrNo
            />
          </Card>
        )}

        {data && tab === "times" && (
          <Card title="Time spent per level · total time">
            <DataTable
              rows={data.results}
              columns={timeColumns}
              searchText={timeSearch}
              exportName="play-times"
              defaultSort={{ key: "ttotal", dir: "desc" }}
              getId={(r) => r.id}
              onDelete={handleDelete("game_results")}
              showSrNo
            />
          </Card>
        )}

        {data && tab === "registrations" && (
          <Card title="All registrations">
            <DataTable
              rows={data.registrations}
              columns={registrationColumns}
              searchText={(r) =>
                [r.user_name, r.user_city, r.user_phone]
                  .filter(Boolean)
                  .join(" ")
              }
              exportName="registrations"
              defaultSort={{ key: "date", dir: "desc" }}
              getId={(r) => r.id}
              onDelete={handleDelete("registrations")}
              showSrNo
            />
          </Card>
        )}
      </main>
    </div>
  );
};
