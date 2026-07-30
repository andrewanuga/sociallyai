// Small input hardening helpers for API routes. React escapes on render, so
// the main risks are oversized payloads and control characters — bound both.

const CONTROL = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

/** Coerce to a trimmed string, strip control chars (keeps \n and \t), cap length. */
export function cleanText(v: unknown, max = 5000): string {
  if (typeof v !== "string") return "";
  return v.replace(CONTROL, "").trim().slice(0, max);
}

export function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

/** Restrict a value to an allowed set (else a fallback). */
export function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}
