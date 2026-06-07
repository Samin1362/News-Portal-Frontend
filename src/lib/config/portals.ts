import type { UserRole } from "@/lib/auth/types";

/**
 * Sibling-portal config (Phase 7 — cross-portal redirects, post-split).
 *
 * Editor and admin users don't belong in this app (the reader/journalist
 * frontend). When one signs in, the dashboard redirects them to their
 * dedicated portal. URLs come from env so each environment can point at the
 * right deploy; if a URL is unset we fall back to a "Coming soon" screen
 * rather than crashing.
 */

const EDITOR_PORTAL_URL = (
  process.env.NEXT_PUBLIC_EDITOR_PORTAL_URL ?? ""
).replace(/\/$/, "");

const ADMIN_PORTAL_URL = (
  process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL ?? ""
).replace(/\/$/, "");

export interface PortalInfo {
  /** The role that owns this portal. */
  role: Extract<UserRole, "editor" | "admin">;
  /** Human label used in toasts / links ("Editor", "Admin"). */
  label: string;
  /** Deployed URL, or null when the env var is unset. */
  url: string | null;
}

const PORTALS: Record<"editor" | "admin", PortalInfo> = {
  editor: {
    role: "editor",
    label: "Editor",
    url: EDITOR_PORTAL_URL || null,
  },
  admin: {
    role: "admin",
    label: "Admin",
    url: ADMIN_PORTAL_URL || null,
  },
};

/** Roles that live in a separate portal rather than this app. */
export function isExternalPortalRole(
  role: UserRole | null | undefined,
): role is "editor" | "admin" {
  return role === "editor" || role === "admin";
}

/** Portal metadata for an editor/admin role, or null for reader/journalist. */
export function portalForRole(
  role: UserRole | null | undefined,
): PortalInfo | null {
  if (!isExternalPortalRole(role)) return null;
  return PORTALS[role];
}
