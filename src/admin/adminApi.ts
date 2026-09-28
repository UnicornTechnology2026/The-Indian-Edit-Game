// Admin API: Supabase Auth (email + password) and authenticated data reads.
// Uses raw fetch, same style as ../lib/supabaseClient.ts (no extra dependency).
//
// SECURITY NOTE: hiding the dashboard in the UI is NOT what protects the data.
// The real protection is Row Level Security in Supabase (see
// supabase-admin-setup.sql): only signed-in users listed in `admin_users`
// can SELECT from the customer tables.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

const SESSION_KEY = "indianEditAdminSession";

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  email: string;
}

export interface GameResultRow {
  user_name: string | null;
  user_city: string | null;
  user_phone: string | null;
  personality: string | null;
  total_score: number | null;
  decode_score: number | null;
  blend_score: number | null;
  hunt_score: number | null;
  coupon_code?: string | null;
  coupon_name?: string | null;
  coupon_value?: string | null;
  created_at?: string | null;
}

export interface RegistrationRow {
  user_name: string | null;
  user_city: string | null;
  user_phone: string | null;
  created_at?: string | null;
}

export interface SocialShareRow {
  user_name: string | null;
  user_city: string | null;
  personality: string | null;
  total_score: number | null;
  action: string | null;
  caption?: string | null;
  created_at?: string | null;
}

export interface DashboardData {
  results: GameResultRow[];
  registrations: RegistrationRow[];
  shares: SocialShareRow[];
  warnings: string[];
}

/** Thrown when the session is missing/expired/not an admin. */
export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

function requireEnv(): { url: string; key: string } {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
    );
  }
  return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
}

// ---------- session storage ----------

export function loadSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AdminSession;
    if (!s.accessToken || !s.refreshToken || !s.expiresAt) return null;
    return s;
  } catch {
    return null;
  }
}

function saveSession(s: AdminSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable; session lives only in memory */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// ---------- auth ----------

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user?: { email?: string };
}

function toSession(data: TokenResponse, fallbackEmail: string): AdminSession {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    email: data.user?.email || fallbackEmail,
  };
}

/** Sign in with the Supabase Auth email + password, then verify admin access. */
export async function adminLogin(
  email: string,
  password: string,
): Promise<AdminSession> {
  const { url, key } = requireEnv();
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new AdminAuthError("Too many attempts. Please wait and try again.");
    }
    if (res.status === 400 || res.status === 401) {
      throw new AdminAuthError("Invalid email or password.");
    }
    throw new AdminAuthError(`Sign-in failed (${res.status}). Try again.`);
  }

  const session = toSession((await res.json()) as TokenResponse, email.trim());

  if (!(await isAdmin(session))) {
    await adminLogout(session);
    throw new AdminAuthError("This account does not have admin access.");
  }

  saveSession(session);
  return session;
}

async function refreshSession(s: AdminSession): Promise<AdminSession | null> {
  const { url, key } = requireEnv();
  const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: s.refreshToken }),
  });
  if (!res.ok) return null;
  const next = toSession((await res.json()) as TokenResponse, s.email);
  saveSession(next);
  return next;
}

/** Returns a non-expired session (refreshing if needed) or null. */
export async function getValidSession(): Promise<AdminSession | null> {
  const s = loadSession();
  if (!s) return null;
  if (s.expiresAt - 60_000 > Date.now()) return s;
  try {
    const next = await refreshSession(s);
    if (!next) clearSession();
    return next;
  } catch {
    return s.expiresAt > Date.now() ? s : null;
  }
}

export async function adminLogout(s: AdminSession | null): Promise<void> {
  clearSession();
  if (!s) return;
  try {
    const { url, key } = requireEnv();
    await fetch(`${url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${s.accessToken}` },
    });
  } catch {
    /* best effort */
  }
}

// ---------- data ----------

function authHeaders(s: AdminSession): Record<string, string> {
  const { key } = requireEnv();
  return { apikey: key, Authorization: `Bearer ${s.accessToken}` };
}

/** True when the signed-in user is listed in the admin_users table. */
export async function isAdmin(s: AdminSession): Promise<boolean> {
  const { url } = requireEnv();
  const res = await fetch(`${url}/rest/v1/admin_users?select=user_id&limit=1`, {
    headers: authHeaders(s),
  });
  if (res.status === 404) {
    throw new Error(
      "Admin tables are not set up yet. Run supabase-admin-setup.sql in the Supabase SQL editor.",
    );
  }
  if (!res.ok) return false;
  const rows = (await res.json()) as unknown[];
  return Array.isArray(rows) && rows.length > 0;
}

// PostgREST caps a response at 1000 rows by default, so page through.
async function fetchAll<T>(
  s: AdminSession,
  table: string,
  orderBy: string,
): Promise<T[]> {
  const { url } = requireEnv();
  const PAGE = 1000;
  const MAX = 50_000;
  const out: T[] = [];

  for (let from = 0; from < MAX; from += PAGE) {
    const res = await fetch(
      `${url}/rest/v1/${table}?select=*&order=${orderBy}.desc`,
      {
        headers: {
          ...authHeaders(s),
          "Range-Unit": "items",
          Range: `${from}-${from + PAGE - 1}`,
        },
      },
    );

    if (res.status === 416) break; // range beyond the last row
    if (res.status === 401) {
      throw new AdminAuthError("Your session expired. Please sign in again.");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Could not load ${table} (${res.status}): ${text}`);
    }

    const page = (await res.json()) as T[];
    out.push(...page);
    if (page.length < PAGE) break;
  }
  return out;
}

export async function fetchDashboardData(
  s: AdminSession,
): Promise<DashboardData> {
  const [results, regs, shares] = await Promise.allSettled([
    fetchAll<GameResultRow>(s, "game_results", "created_at"),
    fetchAll<RegistrationRow>(s, "registrations", "created_at"),
    fetchAll<SocialShareRow>(s, "social_shares", "created_at"),
  ]);

  // An expired session on any request means: sign in again.
  for (const r of [results, regs, shares]) {
    if (r.status === "rejected" && r.reason instanceof AdminAuthError) {
      throw r.reason;
    }
  }
  // Game results are the core data; without them there is no dashboard.
  if (results.status === "rejected") throw results.reason;

  const warnings: string[] = [];
  if (regs.status === "rejected") warnings.push(String(regs.reason.message));
  if (shares.status === "rejected")
    warnings.push(String(shares.reason.message));

  return {
    results: results.value,
    registrations: regs.status === "fulfilled" ? regs.value : [],
    shares: shares.status === "fulfilled" ? shares.value : [],
    warnings,
  };
}
