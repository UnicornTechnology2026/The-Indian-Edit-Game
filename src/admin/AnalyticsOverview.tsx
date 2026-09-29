import React, { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Crown, Minus } from "lucide-react";
import type {
  Analytics,
  CountItem,
  DayPoint,
  Delta,
  LevelStat,
} from "./analytics";
import { formatDuration } from "./analytics";
import type { GameResultRow } from "./adminApi";

// ---------- tokens ----------

const C = {
  ink: "#0c0503",
  panel: "#140a05",
  raised: "#1b0e07",
  gold: "#d4af37",
  goldLight: "#f7e7a9",
  goldDark: "#937119",
  saffron: "#e58325",
  clay: "#d1643a",
  sand: "#ab9580",
  beige: "#ebd9c0",
  cream: "#faf5eb",
  good: "#9ae6b4",
  bad: "#f2938f",
};

const LEVEL_COLORS = [C.goldLight, C.saffron, C.clay];
const PIE_COLORS = [
  "#d4af37",
  "#e58325",
  "#d1643a",
  "#f7e7a9",
  "#ab9580",
  "#8f6a45",
  "#c9485b",
  "#ebd9c0",
];

const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString("en-IN");
const dash = (v?: string | null) => (v && v.trim() ? v : "—");

const longDay = (key: string) => {
  const d = new Date(`${key}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? key
    : d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
};

const hourLabel = (h: number) => {
  const suffix = h < 12 ? "am" : "pm";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${suffix}`;
};

// ---------- layout primitives ----------

const Panel: React.FC<{
  title?: string;
  note?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, note, right, className = "", children }) => (
  <section
    className={`rounded-2xl border border-[#d4af37]/25 bg-[#140a05]/90 p-4 sm:p-5 ${className}`}
  >
    {(title || right) && (
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          {title && (
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#f7e7a9] leading-tight">
              {title}
            </h2>
          )}
          {note && <p className="mt-0.5 text-xs text-[#ab9580]">{note}</p>}
        </div>
        {right}
      </header>
    )}
    {children}
  </section>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-[#ab9580] py-6 text-center">{children}</p>
);

// ---------- delta chip ----------

const DeltaChip: React.FC<{ delta: Delta; days: number }> = ({
  delta,
  days,
}) => {
  if (delta.pct === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#ab9580]">
        <Minus className="w-3.5 h-3.5" />
        no earlier {days} days to compare
      </span>
    );
  }
  const up = delta.pct > 0;
  const flat = delta.pct === 0;
  const color = flat ? C.sand : up ? C.good : C.bad;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums"
      style={{ color }}
    >
      <Icon className="w-3.5 h-3.5" />
      {flat ? "no change" : `${Math.abs(delta.pct)}% ${up ? "up" : "down"}`}
      <span className="font-normal text-[#ab9580]">
        on the previous {days} days
      </span>
    </span>
  );
};

// ---------- range toggle ----------

const RANGES = [7, 14, 30];

const RangeToggle: React.FC<{
  value: number;
  onChange: (n: number) => void;
}> = ({ value, onChange }) => (
  <div
    role="radiogroup"
    aria-label="Date range"
    className="inline-flex rounded-full border border-[#d4af37]/30 bg-[#0c0503] p-0.5"
  >
    {RANGES.map((n) => (
      <button
        key={n}
        role="radio"
        aria-checked={value === n}
        onClick={() => onChange(n)}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#f7e7a9] ${
          value === n
            ? "bg-linear-to-b from-[#f7e7a9] to-[#d4af37] text-[#2d160b]"
            : "text-[#ab9580] hover:text-[#faf5eb]"
        }`}
      >
        {n} days
      </button>
    ))}
  </div>
);

// ---------- smooth line helpers ----------

type Pt = [number, number];

/** Smooth path through points; control points are clamped so curves never dip below the data. */
function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  const minY = Math.min(...pts.map((p) => p[1]));
  const maxY = Math.max(...pts.map((p) => p[1]));
  const clamp = (v: number) => Math.min(maxY, Math.max(minY, v));
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1: Pt = [
      p1[0] + (p2[0] - p0[0]) * t,
      clamp(p1[1] + (p2[1] - p0[1]) * t),
    ];
    const c2: Pt = [
      p2[0] - (p3[0] - p1[0]) * t,
      clamp(p2[1] - (p3[1] - p1[1]) * t),
    ];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// ---------- hero: activity chart ----------

const ActivityChart: React.FC<{ days: DayPoint[] }> = ({ days }) => {
  const W = 720;
  const H = 270;
  const padL = 34;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const [hover, setHover] = useState<number | null>(null);

  const rawMax = Math.max(
    1,
    ...days.flatMap((d) => [d.registrations, d.plays]),
  );
  const niceMax = rawMax <= 4 ? 4 : Math.ceil(rawMax / 4) * 4;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const x = (i: number) =>
    padL + (days.length === 1 ? innerW / 2 : (innerW * i) / (days.length - 1));
  const y = (v: number) => padT + innerH * (1 - v / niceMax);

  const regPts: Pt[] = days.map((d, i) => [x(i), y(d.registrations)]);
  const playPts: Pt[] = days.map((d, i) => [x(i), y(d.plays)]);
  const regPath = smoothPath(regPts);
  const playPath = smoothPath(playPts);
  const baseY = y(0);
  const playArea = `${playPath} L${x(days.length - 1)},${baseY} L${x(0)},${baseY} Z`;
  const ticks = [0, 1, 2, 3, 4].map((i) => Math.round((niceMax / 4) * i));
  const every = Math.ceil(days.length / 7);
  const empty = days.every((d) => d.plays === 0 && d.registrations === 0);
  const hd = hover !== null ? days[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-pan-y"
        role="img"
        aria-label={`Registrations and completed runs for the last ${days.length} days`}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="ie-play-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={C.goldLight} stopOpacity="0.38" />
            <stop offset="1" stopColor={C.gold} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              stroke={C.gold}
              strokeOpacity={t === 0 ? 0.35 : 0.1}
              strokeDasharray={t === 0 ? undefined : "2 5"}
            />
            <text
              x={padL - 8}
              y={y(t) + 3.5}
              textAnchor="end"
              fontSize="10.5"
              fill={C.sand}
            >
              {t}
            </text>
          </g>
        ))}

        {!empty && (
          <>
            <path d={playArea} fill="url(#ie-play-fill)" />
            <path
              d={regPath}
              fill="none"
              stroke={C.saffron}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="1"
              pathLength={1}
              className="ie-draw"
              style={{ animationDelay: "120ms" }}
            />
            <path
              d={playPath}
              fill="none"
              stroke={C.goldLight}
              strokeWidth="2.75"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              className="ie-draw"
            />
          </>
        )}

        {days.map((d, i) =>
          i % every === (days.length - 1) % every ? (
            <text
              key={d.key}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10.5"
              fill={hover === i ? C.goldLight : C.sand}
            >
              {d.label}
            </text>
          ) : null,
        )}

        {hd && hover !== null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={baseY}
              stroke={C.goldLight}
              strokeOpacity="0.4"
            />
            <circle
              cx={x(hover)}
              cy={y(hd.registrations)}
              r="4"
              fill={C.ink}
              stroke={C.saffron}
              strokeWidth="2"
            />
            <circle
              cx={x(hover)}
              cy={y(hd.plays)}
              r="4.5"
              fill={C.ink}
              stroke={C.goldLight}
              strokeWidth="2.5"
            />
          </g>
        )}

        {days.map((d, i) => {
          const w = innerW / Math.max(1, days.length - 1);
          return (
            <rect
              key={d.key}
              x={x(i) - w / 2}
              y={padT}
              width={w}
              height={innerH}
              fill="transparent"
              onPointerEnter={() => setHover(i)}
              onPointerMove={() => setHover(i)}
            >
              <title>{`${longDay(d.key)}: ${d.registrations} registered, ${d.plays} completed`}</title>
            </rect>
          );
        })}
      </svg>

      {empty && (
        <div className="absolute inset-x-0 top-1/3 text-center text-sm text-[#ab9580] pointer-events-none">
          No activity in this period yet.
        </div>
      )}

      {hd && hover !== null && (
        <div
          className="absolute z-10 pointer-events-none rounded-xl border border-[#d4af37]/40 bg-[#0c0503]/95 px-3 py-2 text-xs shadow-lg shadow-black/50 backdrop-blur"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: 0,
            transform: `translateX(${hover > days.length / 2 ? "-105%" : "5%"})`,
          }}
        >
          <div className="font-semibold text-[#faf5eb] mb-1">
            {longDay(hd.key)}
          </div>
          <div className="flex items-center gap-2 text-[#ebd9c0]">
            <i
              className="w-2 h-2 rounded-full"
              style={{ background: C.goldLight }}
            />
            Completed
            <b className="ml-auto pl-4 tabular-nums text-[#f7e7a9]">
              {hd.plays}
            </b>
          </div>
          <div className="flex items-center gap-2 text-[#ebd9c0]">
            <i
              className="w-2 h-2 rounded-full"
              style={{ background: C.saffron }}
            />
            Registered
            <b className="ml-auto pl-4 tabular-nums text-[#f7e7a9]">
              {hd.registrations}
            </b>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- funnel ----------

const Funnel: React.FC<{ a: Analytics }> = ({ a }) => {
  const steps = [
    {
      label: "Registered",
      value: a.totalRegistrations,
      color: C.saffron,
    },
    {
      label: "Finished all 3 levels",
      value: a.totalPlays,
      color: C.goldLight,
    },
    {
      label: "Received a coupon",
      value: a.couponsIssued,
      color: C.gold,
    },
  ];
  const top = Math.max(1, ...steps.map((s) => s.value));
};

// ---------- KPI tile with optional sparkline ----------

const Spark: React.FC<{ values: number[]; color: string }> = ({
  values,
  color,
}) => {
  const W = 120;
  const H = 34;
  const max = Math.max(1, ...values);
  const pts: Pt[] = values.map((v, i) => [
    values.length === 1 ? W / 2 : (W * i) / (values.length - 1),
    H - 3 - (H - 8) * (v / max),
  ]);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-8"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d={smoothPath(pts)}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const Tile: React.FC<{
  label: string;
  value: string;
  hint: React.ReactNode;
  spark?: { values: number[]; color: string };
}> = ({ label, value, hint, spark }) => (
  <div className="rounded-xl border border-[#d4af37]/20 bg-[#140a05]/90 p-4 flex flex-col">
    <div className="text-xs text-[#ab9580]">{label}</div>
    <div className="mt-1 font-serif text-3xl font-bold text-[#faf5eb] tabular-nums leading-none">
      {value}
    </div>
    <div className="mt-2 text-xs text-[#ebd9c0]/80 leading-relaxed">{hint}</div>
    {spark && (
      <div className="mt-auto pt-3">
        <Spark {...spark} />
      </div>
    )}
  </div>
);

// ---------- levels ----------

const LevelPanel: React.FC<{ levels: LevelStat[] }> = ({ levels }) => {
  const totalSecs = levels.reduce((a, l) => a + l.totalSeconds, 0);
  return (
    <Panel
      title="How each level performs"
      note="Average score, how many runs scored, and where players spend their time."
    >
      <div className="grid md:grid-cols-3 gap-3">
        {levels.map((l, i) => {
          const pct = l.max > 0 ? (l.avg / l.max) * 100 : 0;
          return (
            <div
              key={l.label}
              className="rounded-xl bg-[#0c0503] border border-[#d4af37]/15 p-4"
            >
              <div className="flex items-center gap-2">
                <i
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: LEVEL_COLORS[i] }}
                />
                <div className="text-sm font-semibold text-[#faf5eb]">
                  {l.name}
                </div>
                <span className="ml-auto text-xs text-[#ab9580]">
                  {l.short}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div
                    className="font-serif text-3xl font-bold tabular-nums leading-none"
                    style={{ color: LEVEL_COLORS[i] }}
                  >
                    {fmt(l.avg)}
                  </div>
                  <div className="mt-1 text-xs text-[#ab9580]">
                    average points
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-xl font-bold text-[#faf5eb] tabular-nums leading-none">
                    {fmt(l.max)}
                  </div>
                  <div className="mt-1 text-xs text-[#ab9580]">best</div>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-[#ab9580]">Runs that scored</dt>
                <dd className="text-right font-semibold text-[#ebd9c0] tabular-nums">
                  {l.scoredRate}%
                </dd>
                <dt className="text-[#ab9580]">Average time</dt>
                <dd className="text-right font-semibold text-[#ebd9c0] tabular-nums">
                  {formatDuration(l.avgSeconds)}
                </dd>
                <dt className="text-[#ab9580]">Total time</dt>
                <dd className="text-right font-semibold text-[#ebd9c0] tabular-nums">
                  {formatDuration(l.totalSeconds)}
                </dd>
              </dl>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ---------- leaderboard ----------

const Leaders: React.FC<{ players: GameResultRow[] }> = ({ players }) => {
  if (!players.length) return <Empty>No completed runs yet.</Empty>;
  const best = Math.max(1, ...players.map((p) => p.total_score ?? 0));
  return (
    <ol className="space-y-2">
      {players.map((p, i) => (
        <li
          key={i}
          className={`relative overflow-hidden flex items-center gap-3 rounded-xl px-3 py-2.5 ${
            i === 0
              ? "bg-linear-to-r from-[#d4af37]/25 to-[#d4af37]/5 border border-[#d4af37]/50"
              : "bg-[#0c0503] border border-[#d4af37]/10"
          }`}
        >
          <span
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0
                ? "bg-[#f7e7a9] text-[#2d160b]"
                : "bg-[#1f1008] text-[#ab9580]"
            }`}
          >
            {i === 0 ? <Crown className="w-3.5 h-3.5" /> : i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[#faf5eb]">
              {dash(p.user_name)}
            </span>
            <span className="block truncate text-xs text-[#ab9580]">
              {dash(p.user_city)}
              {p.personality ? ` · ${p.personality}` : ""}
            </span>
          </span>
          <span className="text-right">
            <b className="block font-serif text-lg text-[#f7e7a9] tabular-nums leading-none">
              {fmt(p.total_score)}
            </b>
            <span className="text-[10px] text-[#ab9580]">
              {Math.round(((p.total_score ?? 0) / best) * 100)}% of top
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
};

// ---------- donut ----------

const Donut: React.FC<{ items: CountItem[] }> = ({ items }) => {
  if (!items.length)
    return <Empty>Personalities appear after the first run.</Empty>;
  const total = items.reduce((a, i) => a + i.count, 0);
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const GAP = items.length > 1 ? 3 : 0;
  let acc = 0;
  return (
    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5">
      <div className="relative shrink-0 w-36 h-36">
        <svg
          viewBox="0 0 140 140"
          className="w-full h-full -rotate-90"
          role="img"
          aria-label={`Personality split: ${items.map((i) => `${i.label} ${i.count}`).join(", ")}`}
        >
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke="#0c0503"
            strokeWidth="16"
          />
          {items.map((it, i) => {
            const len = (it.count / total) * CIRC;
            const seg = (
              <circle
                key={it.label}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={PIE_COLORS[i % PIE_COLORS.length]}
                strokeWidth="16"
                strokeDasharray={`${Math.max(0, len - GAP)} ${CIRC}`}
                strokeDashoffset={-acc}
              >
                <title>{`${it.label}: ${it.count}`}</title>
              </circle>
            );
            acc += len;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <b className="font-serif text-2xl text-[#faf5eb] tabular-nums leading-none">
            {fmt(total)}
          </b>
          <span className="text-[11px] text-[#ab9580] mt-1">runs</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5 text-xs min-w-0">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            <i
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="truncate text-[#ebd9c0]">{it.label}</span>
            <span className="ml-auto pl-2 tabular-nums text-[#ab9580]">
              {Math.round((it.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------- ranked bars ----------

const Ranked: React.FC<{
  items: CountItem[];
  empty: string;
  sub?: (i: CountItem) => string;
}> = ({ items, empty, sub }) => {
  if (!items.length) return <Empty>{empty}</Empty>;
  const max = Math.max(...items.map((i) => i.count), 1);
  const total = items.reduce((a, i) => a + i.count, 0);
  return (
    <ul className="space-y-3">
      {items.map((i, idx) => (
        <li key={i.label}>
          <div className="flex justify-between items-baseline gap-2 mb-1 text-sm">
            <span className="truncate text-[#ebd9c0]">
              {i.label}
              {sub && (
                <span className="ml-2 text-xs text-[#ab9580]">{sub(i)}</span>
              )}
            </span>
            <span className="tabular-nums text-[#f7e7a9] font-semibold">
              {fmt(i.count)}
              <span className="ml-1.5 text-xs font-normal text-[#ab9580]">
                {Math.round((i.count / total) * 100)}%
              </span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#0c0503] overflow-hidden">
            <div
              className="h-full rounded-full ie-grow"
              style={{
                width: `${(i.count / max) * 100}%`,
                background:
                  idx === 0
                    ? `linear-gradient(90deg, ${C.goldDark}, ${C.goldLight})`
                    : `linear-gradient(90deg, #5c4413, ${C.gold})`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

// ---------- hour of day ----------

const HourStrip: React.FC<{ hourly: number[]; peak: number | null }> = ({
  hourly,
  peak,
}) => {
  const max = Math.max(...hourly);
  if (max === 0) return <Empty>Busy hours appear after the first run.</Empty>;
  return (
    <div>
      <div
        className="flex items-end gap-0.75 h-28"
        role="img"
        aria-label={
          peak !== null
            ? `Busiest hour is ${hourLabel(peak)}`
            : "Runs by hour of day"
        }
      >
        {hourly.map((v, h) => (
          <div
            key={h}
            className="flex-1 rounded-t-sm min-h-0.75"
            title={`${hourLabel(h)}: ${v} run${v === 1 ? "" : "s"}`}
            style={{
              height: `${Math.max(4, (v / max) * 100)}%`,
              background:
                h === peak ? C.goldLight : v > 0 ? "#7a5c1c" : "#24140b",
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[#ab9580]">
        <span>12 am</span>
        <span>6 am</span>
        <span>12 pm</span>
        <span>6 pm</span>
        <span>11 pm</span>
      </div>
      {peak !== null && (
        <p className="mt-3 text-sm text-[#ebd9c0]">
          Players are most active around{" "}
          <b className="text-[#f7e7a9]">{hourLabel(peak)}</b>.
        </p>
      )}
    </div>
  );
};

// ---------- score spread ----------

const ScoreSpread: React.FC<{ a: Analytics }> = ({ a }) => {
  const max = Math.max(...a.scoreBands.map((b) => b.count));
  if (max === 0)
    return <Empty>Score spread appears after the first run.</Empty>;
  return (
    <div>
      <div className="flex items-end gap-2 h-28">
        {a.scoreBands.map((b) => (
          <div
            key={b.label}
            className="flex-1 h-full flex flex-col justify-end items-center gap-1"
            title={`${b.label} points: ${b.count} runs`}
          >
            <span className="text-xs tabular-nums text-[#ebd9c0]">
              {b.count}
            </span>
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${Math.max(3, (b.count / max) * 82)}%`,
                background: b.count === max ? C.goldLight : "#7a5c1c",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 text-[11px] text-[#ab9580]">
        {a.scoreBands.map((b) => (
          <span key={b.label} className="flex-1 text-center tabular-nums">
            {b.label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-[#ebd9c0]">
        Typical run scores{" "}
        <b className="text-[#f7e7a9] tabular-nums">{fmt(a.medianTotal)}</b>{" "}
        points; the best is{" "}
        <b className="text-[#f7e7a9] tabular-nums">{fmt(a.maxTotal)}</b>.
      </p>
    </div>
  );
};

// ---------- main ----------

export const AnalyticsOverview: React.FC<{
  analytics: Analytics;
  range: number;
  onRangeChange: (n: number) => void;
  updatedAt: Date | null;
}> = ({ analytics: a, range, onRangeChange, updatedAt }) => {
  const regSeries = useMemo(
    () => a.daily.map((d) => d.registrations),
    [a.daily],
  );
  const playSeries = useMemo(() => a.daily.map((d) => d.plays), [a.daily]);

  const headline =
    a.playsInRange.current === 0
      ? `No runs completed in the last ${a.rangeDays} days`
      : `${fmt(a.playsInRange.current)} completed run${a.playsInRange.current === 1 ? "" : "s"} in the last ${a.rangeDays} days`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf5eb] leading-tight">
            Campaign analytics
          </h1>
        </div>
        <RangeToggle value={range} onChange={onRangeChange} />
      </div>

      {/* Hero */}
      <div className="grid lg:grid-cols-1 gap-4">
        <section className="lg:col-span-8 rounded-3xl border border-[#d4af37]/45 bg-linear-to-b from-[#1f1008] to-[#140a05] p-5 sm:p-6 shadow-[0_0_60px_-20px_rgba(212,175,55,0.35)]">
          <div className="mt-4">
            <ActivityChart key={range} days={a.daily} />
          </div>

          <div className="mt-2 flex items-center gap-5 text-xs text-[#ebd9c0]">
            <span className="inline-flex items-center gap-2">
              <i
                className="w-4 h-0.75 rounded-full"
                style={{ background: C.goldLight }}
              />
              Completed runs
            </span>
            <span className="inline-flex items-center gap-2">
              <i
                className="w-4 h-0.75 rounded-full"
                style={{ background: C.saffron }}
              />
              Registrations
            </span>
          </div>
        </section>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile
          label="Registered"
          value={fmt(a.totalRegistrations)}
          hint={<>{fmt(a.registrationsToday)} today</>}
          spark={{ values: regSeries, color: C.saffron }}
        />
        <Tile
          label="Completed runs"
          value={fmt(a.totalPlays)}
          hint={
            <>
              {fmt(a.playsToday)} today, {fmt(a.plays7d)} in 7 days
            </>
          }
          spark={{ values: playSeries, color: C.goldLight }}
        />
        <Tile
          label="Average score"
          value={fmt(a.avgTotal)}
          hint={
            <>
              Best run:{" "}
              <b className="text-[#f7e7a9] tabular-nums">{fmt(a.maxTotal)}</b>{" "}
              points
            </>
          }
        />
        <Tile
          label="Total play time"
          value={formatDuration(a.totalPlaySeconds)}
          hint={<>{formatDuration(a.avgPlaySeconds)} per run on average</>}
        />
      </div>

      <LevelPanel levels={a.levels} />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Top 5 players" note="Highest total score.">
          <Leaders players={a.topPlayers} />
        </Panel>
      </div>
    </div>
  );
};
