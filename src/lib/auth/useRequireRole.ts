"use client";

import type { UserRole } from "./types";
import { useAuth } from "./AuthProvider";

/**
 * Phase 1 returns the auth state plus a derived `isAllowed`; Phase 2 adds
 * the redirect side-effects (push to /login if no user, push to / if the
 * role doesn't match).
 */
export function useRequireRole(allowed: UserRole[]) {
  const auth = useAuth();
  const isAllowed = auth.role !== null && allowed.includes(auth.role);
  return { ...auth, isAllowed };
}
