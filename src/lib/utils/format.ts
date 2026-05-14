import { formatDistanceToNowStrict, parseISO } from "date-fns";

/** "3h ago", "2d ago", etc. Returns "—" for null/invalid input. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
  } catch {
    return "—";
  }
}

/** "12 May 2026" — used inline next to author meta. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return parseISO(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/** 1234 → "1.2k", 1_500_000 → "1.5m". */
export function compactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}
