/**
 * Shared utilities for dashboard data formatting.
 * Imported by server components (async pages) and client components alike.
 */

/** Human-readable relative time from an ISO string */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Compact number: 1234 → "1.2K", 1500000 → "1.5M" */
export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Nigerian Naira: 847000 → "₦847,000" */
export function fmtNaira(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${Math.round(n).toLocaleString()}`;
}

/** Percentage change between two periods, with sign and direction */
export function pctChange(curr: number, prev: number): { change: string; positive: boolean } {
  if (curr === 0 && prev === 0) return { change: "—", positive: true };
  if (prev === 0)               return { change: curr > 0 ? "New" : "—", positive: curr > 0 };
  const p = ((curr - prev) / prev) * 100;
  return { change: `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`, positive: p >= 0 };
}

/** Sum a numeric field across an array of DB rows */
export function sumField<T extends Record<string, unknown>>(
  arr: T[] | null | undefined,
  key: keyof T,
): number {
  return arr?.reduce((s, r) => s + (Number(r[key]) || 0), 0) ?? 0;
}

/** Normalise platform slug → display label */
export function platformLabel(platform: string): string {
  const MAP: Record<string, string> = {
    x:         "X (Twitter)",
    linkedin:  "LinkedIn",
    instagram: "Instagram",
    tiktok:    "TikTok",
    threads:   "Threads",
    youtube:   "YouTube",
    whatsapp:  "WhatsApp",
  };
  return MAP[platform] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

/** Date range helpers */
export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
