"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { UserProfile, UserRole } from "./types";

/**
 * Phase 1 stub: provides a stable shape so dashboard layouts can compile
 * and components can call `useAuth()` without runtime errors. Phase 2
 * replaces the body of this provider with real Firebase wiring
 * (`onAuthStateChanged`, `getIdToken`, sign-in / sign-out actions, and
 * `POST /api/v1/auth/sync`).
 */

export interface AuthContextValue {
  firebaseUser: { uid: string; email: string | null } | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  /** Returns the current Firebase ID token, refreshing if needed. */
  getIdToken: () => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const PHASE_2 = "Auth flow is wired in Phase 2.";

const defaultContext: AuthContextValue = {
  firebaseUser: null,
  profile: null,
  role: null,
  loading: false,
  getIdToken: async () => null,
  signIn: async () => {
    throw new Error(PHASE_2);
  },
  signInWithGoogle: async () => {
    throw new Error(PHASE_2);
  },
  signUp: async () => {
    throw new Error(PHASE_2);
  },
  signOut: async () => {
    throw new Error(PHASE_2);
  },
};

const AuthContext = createContext<AuthContextValue>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Phase 1 keeps this as a constant; Phase 2 will wire up state, listeners,
  // and the `/auth/sync` call. The shape stays identical so consumers don't
  // need to change.
  const value = useMemo(() => defaultContext, []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
