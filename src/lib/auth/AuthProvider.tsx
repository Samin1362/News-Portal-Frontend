"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase/client";
import { syncMe } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/client";
import type { UserProfile, UserRole } from "./types";

export interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
  /** True while we resolve the initial auth state. Drops to false once known. */
  loading: boolean;
  /** Returns the current Firebase ID token, forcing a refresh when requested. */
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-fetches the Mongo profile via `/auth/sync`. Used after profile edits. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedUidRef = useRef<string | null>(null);

  const syncProfileFor = useCallback(async (user: FirebaseUser) => {
    const token = await user.getIdToken();
    try {
      const next = await syncMe(token);
      setProfile(next);
      return next;
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT") {
        // Another account already owns this email — sign out so the user can
        // recover cleanly. The /login page surfaces this via the toast.
        await fbSignOut(getFirebaseAuth());
        setProfile(null);
        syncedUidRef.current = null;
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        syncedUidRef.current = null;
        setLoading(false);
        return;
      }
      if (syncedUidRef.current === user.uid) {
        // Already synced for this user this session — token refreshes are
        // handled separately when an authenticated request needs them.
        setLoading(false);
        return;
      }
      try {
        await syncProfileFor(user);
        syncedUidRef.current = user.uid;
      } catch {
        // syncProfileFor already handled CONFLICT; for other failures we let
        // the firebase user stand and surface the failure on the next request.
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [syncProfileFor]);

  const getIdToken = useCallback(
    async (forceRefresh = false): Promise<string | null> => {
      const user = getFirebaseAuth().currentUser;
      if (!user) return null;
      return user.getIdToken(forceRefresh);
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    // onAuthStateChanged drives the /auth/sync call.
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(getFirebaseAuth(), googleProvider);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      // onAuthStateChanged will fire and trigger /auth/sync automatically.
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(getFirebaseAuth());
    syncedUidRef.current = null;
  }, []);

  const refreshProfile = useCallback(async () => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    await syncProfileFor(user);
  }, [syncProfileFor]);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      role: profile?.role ?? null,
      loading,
      getIdToken,
      signIn,
      signInWithGoogle,
      signUp,
      sendPasswordReset,
      signOut,
      refreshProfile,
    }),
    [
      firebaseUser,
      profile,
      loading,
      getIdToken,
      signIn,
      signInWithGoogle,
      signUp,
      sendPasswordReset,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
