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
  Gift,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  Gamepad2,
  Percent,
  Timer,
  TrendingUp,
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
  CountItem,
  DayPoint,
  computeAnalytics,
  downloadCsv,
  formatDuration,
  playedFlag,
  runSeconds,
  registeredPhonesWhoPlayed,
} from "./analytics";

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

const Kpi: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}> = ({ icon, label, value, hint }) => (
  <div className="rounded-2xl border border-[#d4af37]/30 bg-[#140a05]/90 p-4">
    <div className="flex items-center gap-2 text-[#d4af37]">
      {icon}
      <span className="text-[10px] sm:text-[11px] tracking-widest uppercase text-[#ab9580]">
        {label}
      </span>
    </div>
    <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#faf5eb] tabular-nums">
      {value}
    </div>
    {hint && <div className="mt-0.5 text-[11px] text-[#ab9580]">{hint}</div>}
  </div>
);

const BarList: React.FC<{
  items: CountItem[];
  empty?: string;
}> = ({ items, empty = "No data yet." }) => {
  if (!items.length) return <p className="text-xs text-[#ab9580]">{empty}</p>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#ebd9c0] truncate pr-2">{i.label}</span>
            <span className="font-mono text-[#f7e7a9]">{fmt(i.count)}</span>
          </div>
          <div className="h-2 rounded-full bg-[#0c0503] overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#937119] to-[#f7e7a9]"
              style={{ width: `${(i.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

const DailyChart: React.FC<{ days: DayPoint[] }> = ({ days }) => {
  const W = 700;
  const H = 220;
  const padL = 30;
  const padB = 26;
  const padT = 10;
  const max = Math.max(1, ...days.flatMap((d) => [d.registrations, d.plays]));
  const slot = (W - padL) / days.length;
  const barW = Math.min(16, slot * 0.34);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const ticks = [0, Math.ceil(max / 2), max];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Registrations and plays per day"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padL}
            x2={W}
            y1={y(t)}
            y2={y(t)}
            stroke="#d4af37"
            strokeOpacity="0.15"
          />
          <text
            x={padL - 6}
            y={y(t) + 3}
            textAnchor="end"
            fontSize="10"
            fill="#ab9580"
          >
            {t}
          </text>
        </g>
      ))}
      {days.map((d, i) => {
        const cx = padL + slot * i + slot / 2;
        return (
          <g key={d.key}>
            <rect
              x={cx - barW - 1}
              y={y(d.registrations)}
              width={barW}
              height={H - padB - y(d.registrations)}
              rx="2"
              fill="#937119"
            >
              <title>{`${d.label}: ${d.registrations} registered`}</title>
            </rect>
            <rect
              x={cx + 1}
              y={y(d.plays)}
              width={barW}
              height={H - padB - y(d.plays)}
              rx="2"
              fill="#f7e7a9"
            >
              <title>{`${d.label}: ${d.plays} completed`}</title>
            </rect>
            {((days.length - 1 - i) % 2 === 0 || days.length <= 8) && (
              <text
                x={cx}
                y={H - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#ab9580"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

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
                  colSpan={columns.length + (canDelete ? 1 : 0)}
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
  session,
  onSignOut,
}) => {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const analytics: Analytics | null = useMemo(
    () => (data ? computeAnalytics(data) : null),
    [data],
  );

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
      {
        key: "date",
        label: "Registered",
        cell: (r) => fmtDate(r.created_at),
        sort: (r) => dateValue(r.created_at),
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
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[#e53e3e]/60 bg-[#8b151b]/30 px-4 py-3 text-xs text-[#fed7d7]"
          >
            {error}
          </div>
        )}
        {data?.warnings.map((w) => (
          <div
            key={w}
            className="rounded-xl border border-[#e58325]/50 bg-[#e58325]/10 px-4 py-3 text-xs text-[#fbd38d]"
          >
            {w}
          </div>
        ))}

        {loading && !data && (
          <div className="flex items-center justify-center py-24 text-[#d4af37]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {data && analytics && tab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Kpi
                icon={<UserPlus className="w-4 h-4" />}
                label="Registered"
                value={fmt(analytics.totalRegistrations)}
                hint={`${fmt(analytics.registrationsToday)} today`}
              />
              <Kpi
                icon={<Gamepad2 className="w-4 h-4" />}
                label="Completed runs"
                value={fmt(analytics.totalPlays)}
                hint={`${fmt(analytics.playsToday)} today · ${fmt(analytics.plays7d)} last 7 days`}
              />
              <Kpi
                icon={<Users className="w-4 h-4" />}
                label="Unique players"
                value={fmt(analytics.uniquePlayers)}
              />
              <Kpi
                icon={<Percent className="w-4 h-4" />}
                label="Completion rate"
                value={`${analytics.completionRate}%`}
                hint="completed ÷ registered"
              />
              <Kpi
                icon={<TrendingUp className="w-4 h-4" />}
                label="Avg total score"
                value={fmt(analytics.avgTotal)}
              />
              <Kpi
                icon={<Trophy className="w-4 h-4" />}
                label="Highest score"
                value={fmt(analytics.maxTotal)}
              />
              <Kpi
                icon={<Timer className="w-4 h-4" />}
                label="Total play time"
                value={formatDuration(analytics.totalPlaySeconds)}
                hint={`${formatDuration(analytics.avgPlaySeconds)} avg per run`}
              />
              <Kpi
                icon={<Gift className="w-4 h-4" />}
                label="Coupons issued"
                value={fmt(analytics.couponsIssued)}
              />
            </div>

            <Card
              title="Last 14 days"
              right={
                <div className="flex items-center gap-3 text-[11px] text-[#ab9580]">
                  <span className="flex items-center gap-1">
                    <i className="w-2.5 h-2.5 rounded-sm bg-[#937119]" />
                    Registered
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="w-2.5 h-2.5 rounded-sm bg-[#f7e7a9]" />
                    Completed
                  </span>
                </div>
              }
            >
              <DailyChart days={analytics.daily} />
            </Card>

            <div className="grid lg:grid-cols-3 gap-4">
              <Card title="Points by level" className="lg:col-span-2">
                <div className="grid sm:grid-cols-3 gap-3">
                  {analytics.levels.map((l) => (
                    <div
                      key={l.label}
                      className="rounded-xl border border-[#d4af37]/20 bg-[#0c0503] p-3"
                    >
                      <div className="text-[11px] text-[#ab9580] mb-2">
                        {l.label}
                      </div>
                      <div className="font-serif text-xl font-bold text-[#f7e7a9] tabular-nums">
                        {fmt(l.avg)}
                      </div>
                      <div className="text-[10px] text-[#ab9580] mb-2">
                        average
                      </div>
                      <div className="text-[11px] text-[#ebd9c0]">
                        Best: <b className="tabular-nums">{fmt(l.max)}</b>
                      </div>
                      <div className="text-[11px] text-[#ebd9c0]">
                        Scored: <b className="tabular-nums">{fmt(l.players)}</b>{" "}
                        players
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#d4af37]/15 text-[11px] text-[#ebd9c0]">
                        Time spent:{" "}
                        <b className="tabular-nums">
                          {formatDuration(l.totalSeconds)}
                        </b>
                      </div>
                      <div className="text-[11px] text-[#ebd9c0]">
                        Avg per run:{" "}
                        <b className="tabular-nums">
                          {formatDuration(l.avgSeconds)}
                        </b>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Top 5 players">
                {analytics.topPlayers.length === 0 ? (
                  <p className="text-xs text-[#ab9580]">No games yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {analytics.topPlayers.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate">
                          <span className="text-[#d4af37] font-bold mr-2">
                            {i + 1}
                          </span>
                          {dash(p.user_name)}
                          <span className="text-[#ab9580]">
                            {" "}
                            · {dash(p.user_city)}
                          </span>
                        </span>
                        <span className="font-mono text-[#f7e7a9]">
                          {fmt(p.total_score)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card title="Top cities">
                <BarList items={analytics.cities} />
              </Card>
              <Card title="Personalities">
                <BarList items={analytics.personalities} />
              </Card>
              <Card title="Coupons given">
                <BarList
                  items={analytics.coupons.map((c) => ({
                    label: c.value ? `${c.code} · ${c.value}` : c.code,
                    count: c.count,
                  }))}
                  empty="No coupon data recorded yet."
                />
                {analytics.couponsUnrecorded > 0 && (
                  <p className="mt-3 text-[11px] text-[#ab9580]">
                    {fmt(analytics.couponsUnrecorded)} earlier run(s) have no
                    coupon recorded.
                  </p>
                )}
              </Card>
            </div>
          </>
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
            />
          </Card>
        )}
      </main>
    </div>
  );
};
