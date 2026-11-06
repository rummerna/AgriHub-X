export function generateOtp(): string {
  // Rejection sampling avoids modulo bias across all six-digit codes.
  const value = new Uint32Array(1);
  const limit = Math.floor(2 ** 32 / 900000) * 900000;
  do { crypto.getRandomValues(value); } while (value[0] >= limit);
  return String(100000 + value[0] % 900000);
}
/** Maps an OTP insert error to an HTTP response; the DB rate-limit trigger raises P0001. */
export function otpInsertFailure(err: { code?: string; message?: string } | null): { status: number; body: Record<string, unknown> } {
  if (err?.code === "P0001") return { status: 429, body: { success: false, error: err.message } };
  return { status: 503, body: { success: false, error: "Could not send code", fallback: "email" } };
}
