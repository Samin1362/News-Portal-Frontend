"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "./types";

interface Options {
  /** Path to send unauthenticated users to. Defaults to `/login`. */
  loginPath?: string;
  /** Path to send role-mismatched users to. Defaults to `/`. */
  fallbackPath?: string;
}

/**
 * Guards a route to a set of roles. Redirects unauthenticated users to the
 * login page and role-mismatched users to the homepage. Returns the auth
 * state plus an `isAllowed` flag so consumers can show a loading shell
 * while the auth state resolves.
 */
export function useRequireRole(
  allowed: UserRole[],
  { loginPath = "/login", fallbackPath = "/" }: Options = {},
) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.firebaseUser) {
      router.replace(loginPath);
      return;
    }
    if (auth.profile?.isBlocked) {
      void auth.signOut();
      router.replace("/");
      return;
    }
    if (auth.role && !allowed.includes(auth.role)) {
      router.replace(fallbackPath);
    }
  }, [auth, router, allowed, loginPath, fallbackPath]);

  const isAllowed =
    !auth.loading &&
    !!auth.firebaseUser &&
    !!auth.role &&
    allowed.includes(auth.role);

  return { ...auth, isAllowed };
}

/** Redirect-to-login guard with no role restriction. */
export function useRequireAuth(loginPath = "/login") {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.firebaseUser) {
      router.replace(loginPath);
    }
  }, [auth, router, loginPath]);

  return auth;
}
