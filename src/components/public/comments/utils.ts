import { ApiError } from "@/lib/api/client";

/**
 * Maps the backend's `ApiError.code` to user-friendly copy for comment
 * actions. Anything we don't recognise falls back to the raw message
 * so the surface stays diagnosable.
 */
export function commentErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "FORBIDDEN":
        // Covers comment-blocked users, comments disabled on the article,
        // replying to a non-approved comment, and trying to comment on an
        // unpublished article.
        return err.message || "You can't do that here.";
      case "UNAUTHORIZED":
        return "Please sign in to continue.";
      case "CONFLICT":
        // Reporting the same comment twice surfaces here.
        return err.message || "You've already done that.";
      case "BAD_REQUEST":
      case "VALIDATION_ERROR":
      case "UNPROCESSABLE_ENTITY":
        return err.message || "That input wasn't accepted.";
      case "NOT_FOUND":
        return "This comment no longer exists.";
      default:
        return err.message || "Something went wrong.";
    }
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const STEPS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

/**
 * Compact relative timestamp ("2 hours ago"). Standalone instead of using
 * the date-fns helper from `lib/utils/format.ts` because comment lists
 * frequently re-render and Intl is essentially free.
 */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = (then - Date.now()) / 1000;
  for (const [unit, secs] of STEPS) {
    if (Math.abs(seconds) >= secs || unit === "second") {
      return RTF.format(Math.round(seconds / secs), unit);
    }
  }
  return "";
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
