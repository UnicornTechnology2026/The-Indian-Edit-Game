import {
  MAX_ATTEMPTS,
  hashCode,
  isValidIndianMobile,
  safeEqual,
  sb,
} from "./_lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const { phone, code } = req.body || {};
  if (!isValidIndianMobile(phone) || !/^\d{6}$/.test(String(code)))
    return res.status(400).json({ error: "Invalid request." });

  try {
    const rows = await (
      await sb(`otp_codes?phone=eq.${phone}&select=*`)
    ).json();
    const row = rows[0];
    if (!row || new Date(row.expires_at).getTime() < Date.now())
      return res
        .status(400)
        .json({ error: "Code expired. Please request a new one." });
    if (row.attempts >= MAX_ATTEMPTS)
      return res
        .status(429)
        .json({ error: "Too many attempts. Please request a new code." });

    if (!safeEqual(row.code_hash, hashCode(phone, String(code)))) {
      await sb(`otp_codes?phone=eq.${phone}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify({ attempts: row.attempts + 1 }),
      });
      return res
        .status(400)
        .json({ error: "Incorrect code. Please try again." });
    }

    await sb(`otp_codes?phone=eq.${phone}`, { method: "DELETE" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("verify-otp failed:", e);
    return res
      .status(500)
      .json({ error: "Verification failed. Please try again." });
  }
}
