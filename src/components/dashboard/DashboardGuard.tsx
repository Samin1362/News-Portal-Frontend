"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";

/**
 * Redirects unauthenticated users to /login, blocked users to / (after a
 * sign-out + toast), and renders the dashboard otherwise. Children only
 * mount once the auth state is known.
 */
export function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.firebaseUser) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    if (auth.profile?.isBlocked) {
      void auth.signOut();
      toast.error("Your account has been blocked.");
      router.replace("/");
    }
  }, [auth, router, toast]);

  if (auth.loading || !auth.firebaseUser || !auth.profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-hand text-[12px] text-muted">Loading newsroom…</p>
      </div>
    );
  }

  if (auth.profile.isBlocked) return null;

  return <>{children}</>;
}
