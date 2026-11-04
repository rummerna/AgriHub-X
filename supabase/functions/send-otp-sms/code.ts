export function generateOtp(): string {
  // Rejection sampling avoids modulo bias across all six-digit codes.
  const value = new Uint32Array(1);
  const limit = Math.floor(2 ** 32 / 900000) * 900000;
  do { crypto.getRandomValues(value); } while (value[0] >= limit);
  return String(100000 + value[0] % 900000);
}