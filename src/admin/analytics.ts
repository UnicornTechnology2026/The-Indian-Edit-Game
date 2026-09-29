import type { DashboardData, GameResultRow, RegistrationRow } from "./adminApi";

export interface CountItem {
  label: string;
  count: number;
}
export interface CouponItem {
  code: string;
  name: string;
  value: string;
  count: number;
}
export interface DayPoint {
  key: string;
  label: string;
  registrations: number;
  plays: number;
}
export interface LevelStat {
  label: string;
  short: string;
  name: string;
  avg: number;
  max: number;
  players: number;
  avgSeconds: number; // average over runs that recorded a time
  totalSeconds: number;
  scoredRate: number; // % of completed runs that scored in this level
}

export interface Delta {
  current: number;
  previous: number;
  /** % change vs the previous period; null when there is nothing to compare */
  pct: number | null;
}

export interface Band {
  label: string;
  count: number;
}
export interface Analytics {
  rangeDays: number;
  registrationsInRange: Delta;
  playsInRange: Delta;
  peakDay: DayPoint | null;
  hourly: number[]; // 24 buckets, local time, completed runs
  peakHour: number | null;
  scoreBands: Band[];
  medianTotal: number;
  totalRegistrations: number;
  totalPlays: number;
  uniquePlayers: number;
  completionRate: number; // 0-100
  playsToday: number;
  plays7d: number;
  registrationsToday: number;
  avgTotal: number;
  maxTotal: number;
  totalPlaySeconds: number;
  avgPlaySeconds: number;
  couponsIssued: number;
  levels: LevelStat[];
  daily: DayPoint[];
  cities: CountItem[];
  personalities: CountItem[];
  coupons: CouponItem[];
  couponsUnrecorded: number;
  topPlayers: GameResultRow[];
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function parseDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Normalises a phone to its last 10 digits so "+91 98..." and "98..." match. */
export function phoneKey(phone?: string | null): string {
  return (phone || "").replace(/\D/g, "").slice(-10);
}

function tally(
  values: (string | null | undefined)[],
  limit: number,
): CountItem[] {
  const map = new Map<string, CountItem>();
  for (const raw of values) {
    const label = (raw || "").trim();
    if (!label) continue;
    const k = label.toLowerCase();
    const cur = map.get(k);
    if (cur) cur.count += 1;
    else map.set(k, { label, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

function levelStat(
  label: string,
  short: string,
  name: string,
  rows: GameResultRow[],
  pick: (r: GameResultRow) => number | null,
  pickTime: (r: GameResultRow) => number | null,
): LevelStat {
  const scores = rows.map((r) => num(pick(r)));
  const times = rows.map((r) => num(pickTime(r))).filter((t) => t > 0);
  const totalSeconds = times.reduce((a, b) => a + b, 0);
  const played = scores.filter((s) => s > 0);
  return {
    label,
    short,
    name,
    scoredRate: scores.length
      ? Math.round((played.length / scores.length) * 100)
      : 0,
    avg: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
    max: scores.length ? Math.max(...scores) : 0,
    players: played.length,
    avgSeconds: times.length ? Math.round(totalSeconds / times.length) : 0,
    totalSeconds,
  };
}

/** Total time for one run: the stored total, else the sum of the levels. */
export function runSeconds(r: GameResultRow): number {
  const stored = num(r.total_time_seconds);
  if (stored > 0) return stored;
  return (
    num(r.decode_time_seconds) +
    num(r.blend_time_seconds) +
    num(r.hunt_time_seconds)
  );
}

/** 75 -> "1m 15s", 3700 -> "1h 1m", 0/null -> "—" */
export function formatDuration(seconds?: number | null): string {
  const s = Math.round(num(seconds));
  if (s <= 0) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

export function computeAnalytics(data: DashboardData, days = 14): Analytics {
  const { results, registrations } = data;
  const now = new Date();
  const todayKey = dayKey(now);

  // ----- daily series (last N days, oldest first) -----
  const daily: DayPoint[] = [];
  const index = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const p: DayPoint = {
      key: dayKey(d),
      label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
      registrations: 0,
      plays: 0,
    };
    daily.push(p);
    index.set(p.key, p);
  }
  for (const r of registrations) {
    const d = parseDate(r.created_at);
    if (d) {
      const p = index.get(dayKey(d));
      if (p) p.registrations += 1;
    }
  }
  for (const r of results) {
    const d = parseDate(r.created_at);
    if (d) {
      const p = index.get(dayKey(d));
      if (p) p.plays += 1;
    }
  }

  const sevenDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6,
  ).getTime();
  const playsToday = results.filter((r) => {
    const d = parseDate(r.created_at);
    return d ? dayKey(d) === todayKey : false;
  }).length;
  const plays7d = results.filter((r) => {
    const d = parseDate(r.created_at);
    return d ? d.getTime() >= sevenDaysAgo : false;
  }).length;
  const registrationsToday = registrations.filter((r) => {
    const d = parseDate(r.created_at);
    return d ? dayKey(d) === todayKey : false;
  }).length;

  // ----- players -----
  const uniqueSet = new Set(
    results.map(
      (r) =>
        phoneKey(r.user_phone) ||
        `${(r.user_name || "").toLowerCase()}|${(r.user_city || "").toLowerCase()}`,
    ),
  );
  const totals = results.map((r) => num(r.total_score));

  // ----- coupons -----
  const couponMap = new Map<string, CouponItem>();
  let couponsUnrecorded = 0;
  for (const r of results) {
    const code = (r.coupon_code || "").trim();
    if (!code) {
      couponsUnrecorded += 1;
      continue;
    }
    const cur = couponMap.get(code);
    if (cur) cur.count += 1;
    else
      couponMap.set(code, {
        code,
        name: r.coupon_name || code,
        value: r.coupon_value || "",
        count: 1,
      });
  }
  const coupons = [...couponMap.values()].sort((a, b) => b.count - a.count);
  // ----- range vs previous range -----
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const DAY = 86_400_000;
  const rangeStart = startOfToday - (days - 1) * DAY;
  const prevStart = rangeStart - days * DAY;
  const countBetween = (
    rows: { created_at?: string | null }[],
    from: number,
    to: number,
  ) =>
    rows.filter((r) => {
      const d = parseDate(r.created_at);
      return d ? d.getTime() >= from && d.getTime() < to : false;
    }).length;
  const delta = (rows: { created_at?: string | null }[]): Delta => {
    const current = countBetween(rows, rangeStart, startOfToday + DAY);
    const previous = countBetween(rows, prevStart, rangeStart);
    return {
      current,
      previous,
      pct:
        previous > 0
          ? Math.round(((current - previous) / previous) * 100)
          : null,
    };
  };

  // ----- hour of day -----
  const hourly = Array.from({ length: 24 }, () => 0);
  for (const r of results) {
    const d = parseDate(r.created_at);
    if (d) hourly[d.getHours()] += 1;
  }
  const hourMax = Math.max(...hourly);

  // ----- score bands -----
  const topScore = totals.length ? Math.max(...totals) : 0;
  const step = Math.max(1, Math.ceil((topScore + 1) / 5));
  const scoreBands: Band[] = Array.from({ length: 5 }, (_, i) => ({
    label: `${i * step}–${(i + 1) * step - 1}`,
    count: 0,
  }));
  if (topScore > 0) {
    for (const t of totals) {
      scoreBands[Math.min(4, Math.floor(t / step))].count += 1;
    }
  }
  const sortedTotals = [...totals].sort((a, b) => a - b);
  const medianTotal = sortedTotals.length
    ? Math.round(
        (sortedTotals[Math.floor((sortedTotals.length - 1) / 2)] +
          sortedTotals[Math.ceil((sortedTotals.length - 1) / 2)]) /
          2,
      )
    : 0;
  const peakDay = daily.reduce<DayPoint | null>(
    (best, d) => (d.plays > 0 && (!best || d.plays > best.plays) ? d : best),
    null,
  );

  return {
    rangeDays: days,
    registrationsInRange: delta(registrations),
    playsInRange: delta(results),
    peakDay,
    hourly,
    peakHour: hourMax > 0 ? hourly.indexOf(hourMax) : null,
    scoreBands,
    medianTotal,
    totalRegistrations: registrations.length,
    totalPlays: results.length,
    uniquePlayers: uniqueSet.size,
    completionRate: registrations.length
      ? Math.min(100, Math.round((results.length / registrations.length) * 100))
      : 0,
    playsToday,
    plays7d,
    registrationsToday,
    avgTotal: totals.length
      ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
      : 0,
    maxTotal: totals.length ? Math.max(...totals) : 0,
    totalPlaySeconds: results.reduce((a, r) => a + runSeconds(r), 0),
    avgPlaySeconds: (() => {
      const t = results.map(runSeconds).filter((x) => x > 0);
      return t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : 0;
    })(),
    couponsIssued: results.length - couponsUnrecorded,
    levels: [
      levelStat(
        "Level 1 · Decode The Bottle",
        "Level 1",
        "Decode The Bottle",
        results,
        (r) => r.decode_score,
        (r) => r.decode_time_seconds ?? null,
      ),
      levelStat(
        "Level 2 · Master The Blend",
        "Level 2",
        "Master The Blend",
        results,
        (r) => r.blend_score,
        (r) => r.blend_time_seconds ?? null,
      ),
      levelStat(
        "Level 3 · Hunt The Edit",
        "Level 3",
        "Hunt The Edit",
        results,
        (r) => r.hunt_score,
        (r) => r.hunt_time_seconds ?? null,
      ),
    ],
    daily,
    // Registrations cover everyone who signed up; fall back to results if empty.
    cities: tally(
      (registrations.length ? registrations : results).map((r) => r.user_city),
      8,
    ),
    personalities: tally(
      results.map((r) => r.personality),
      8,
    ),
    coupons,
    couponsUnrecorded,
    topPlayers: [...results]
      .sort((a, b) => num(b.total_score) - num(a.total_score))
      .slice(0, 5),
  };
}

/** Registrations that never produced a game result (by phone). */
export function registeredPhonesWhoPlayed(
  results: GameResultRow[],
): Set<string> {
  return new Set(results.map((r) => phoneKey(r.user_phone)).filter(Boolean));
}

export function playedFlag(reg: RegistrationRow, played: Set<string>): boolean {
  const k = phoneKey(reg.user_phone);
  return k ? played.has(k) : false;
}

// ---------- CSV ----------

// Prefix cells that spreadsheets would treat as formulas (CSV injection),
// since names/cities are user-entered.
function csvCell(v: string | number | null | undefined): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const body = [headers, ...rows]
    .map((r) => r.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
