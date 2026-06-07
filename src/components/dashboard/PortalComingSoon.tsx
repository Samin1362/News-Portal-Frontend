"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import type { PortalInfo } from "@/lib/config/portals";

/**
 * Shown when an editor/admin lands here but their portal URL env var is unset
 * (Phase 7 cross-portal fallback). Beats a crash or a redirect to nowhere —
 * the user gets a clear message and a way out (sign out / go home).
 */
export function PortalComingSoon({ portal }: { portal: PortalInfo }) {
  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();

  async function handleSignOut() {
    try {
      await auth.signOut();
      toast.info("Signed out.");
      router.replace("/");
    } catch {
      toast.error("Could not sign out. Try again.");
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <p className="font-hand text-[12px] text-accent tracking-widest">
          {portal.label.toUpperCase()} PORTAL
        </p>
        <h1 className="serif text-[30px] font-extrabold tracking-tight mt-2">
          The {portal.label} portal isn&apos;t wired up here yet.
        </h1>
        <p className="font-sans text-[14px] text-muted mt-3 leading-relaxed">
          Your account has {portal.label.toLowerCase()} access, which lives in a
          separate portal. That portal&apos;s address hasn&apos;t been
          configured for this environment yet — check back soon.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Btn variant="ghost">
            <Link href="/">Go to the public site</Link>
          </Btn>
          <Btn variant="primary" onClick={handleSignOut}>
            Sign out
          </Btn>
        </div>
      </div>
    </div>
  );
}
