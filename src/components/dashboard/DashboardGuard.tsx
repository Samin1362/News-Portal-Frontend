"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { portalForRole } from "@/lib/config/portals";
import { PortalComingSoon } from "@/components/dashboard/PortalComingSoon";

/**
 * Gates the dashboard tree (Phase 2 + Phase 7):
 *  - unauthenticated → /login
 *  - blocked → sign-out + toast + /
 *  - editor / admin → redirected to their dedicated portal (Phase 7); if the
 *    portal URL isn't configured, a "Coming soon" screen is shown instead of
 *    crashing or looping.
 *  - reader / journalist → render the dashboard.
 */
export function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();
  // Guard against firing the redirect/toast twice (effect re-runs, StrictMode).
  const redirected = useRef(false);

  const portal = portalForRole(auth.profile?.role);

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
      return;
    }
    // Editors/admins belong in their own portal — hand them off once.
    if (portal?.url && !redirected.current) {
      redirected.current = true;
      toast.info(`${portal.label}s have their own portal — taking you there…`);
      window.location.replace(portal.url);
    }
  }, [auth, router, toast, portal]);

  if (auth.loading || !auth.firebaseUser || !auth.profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-hand text-[12px] text-muted">Loading newsroom…</p>
      </div>
    );
  }

  if (auth.profile.isBlocked) return null;

  // Editor/admin: either mid-redirect (URL set) or no portal configured.
  if (portal) {
    if (portal.url) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="font-hand text-[12px] text-muted">
            Redirecting to the {portal.label} portal…
          </p>
        </div>
      );
    }
    return <PortalComingSoon portal={portal} />;
  }

  return <>{children}</>;
}
