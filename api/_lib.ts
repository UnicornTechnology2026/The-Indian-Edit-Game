import { createHash, timingSafeEqual } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const OTP_TTL_MS = 5 * 60 * 1000;
export const RESEND_GAP_MS = 45 * 1000;
export const MAX_ATTEMPTS = 3;

export const isValidIndianMobile = (p: unknown): p is string =>
  typeof p === "string" && /^[6-9]\d{9}$/.test(p);

export const hashCode = (phone: string, code: string) =>
  createHash("sha256")
    .update(`${phone}:${code}:${process.env.OTP_SECRET || ""}`)
    .digest("hex");

export const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
};

export async function sb(
  path: string,
  init: RequestInit & { prefer?: string } = {},
) {
  if (!SUPABASE_URL || !SERVICE_KEY)
    throw new Error("Supabase server env vars missing");
  const { prefer, ...rest } = init;
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
  });
}

export async function sendOtpSms(phone: string, code: string) {
  const url = process.env.APITXT_SEND_URL; // https://apitxt.com/api/sendOTP
  const authkey = process.env.APITXT_AUTH_KEY;
  if (!url || !authkey) throw new Error("APITxT env vars missing");

  const body = new URLSearchParams({
    authkey,
    mobile: `91${phone}`,
    otp: code,
    channel: "sms",
  });
  if (process.env.APITXT_TEMPLATE_ID)
    body.set("template_id", process.env.APITXT_TEMPLATE_ID);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  console.log("APITxT response:", res.status, text); // remove once it works
  if (!res.ok) throw new Error(`APITxT ${res.status}: ${text}`);

  try {
    const json = JSON.parse(text);
    const failed =
      json.success === false ||
      ["error", "failed", "fail", false].includes(json.status);
    if (failed) throw new Error(`APITxT rejected: ${text}`);
  } catch (e) {
    if (e instanceof SyntaxError) return;
    throw e;
  }
}
