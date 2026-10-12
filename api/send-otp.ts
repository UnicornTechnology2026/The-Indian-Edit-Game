import { randomInt } from "node:crypto";
import {
  OTP_TTL_MS,
  RESEND_GAP_MS,
  hashCode,
  isValidIndianMobile,
  sb,
  sendOtpSms,
} from "./_lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const phone = req.body?.phone;
  if (!isValidIndianMobile(phone))
    return res
      .status(400)
      .json({ error: "Enter a valid 10-digit mobile number." });

  try {
    // Both checks at the same time
    const [dup, prevRes] = await Promise.all([
      sb("rpc/phone_already_registered", {
        method: "POST",
        body: JSON.stringify({ p_phone: phone }),
      }),
      sb(`otp_codes?phone=eq.${phone}&select=last_sent_at`),
    ]);

    if (dup.ok && (await dup.json()) === true)
      return res.status(409).json({ error: "This number has already played." });

    const prev = await prevRes.json();
    if (
      prev[0] &&
      Date.now() - new Date(prev[0].last_sent_at).getTime() < RESEND_GAP_MS
    )
      return res
        .status(429)
        .json({ error: "Please wait before requesting another code." });

    const code = String(randomInt(100000, 1000000));

    // Save the code and send the SMS at the same time
    const savePromise = sb("otp_codes?on_conflict=phone", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify({
        phone,
        code_hash: hashCode(phone, code),
        expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
        last_sent_at: new Date().toISOString(),
        attempts: 0,
      }),
    });

    try {
      const [save] = await Promise.all([savePromise, sendOtpSms(phone, code)]);
      if (!save.ok) throw new Error(await save.text());
    } catch (e) {
      // sending failed: remove the row so the user can retry right away
      await sb(`otp_codes?phone=eq.${phone}`, { method: "DELETE" }).catch(
        () => {},
      );
      throw e;
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("send-otp failed:", e);
    return res
      .status(502)
      .json({ error: "Could not send the code. Please try again." });
  }
}
