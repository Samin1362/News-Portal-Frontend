"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { Btn } from "@/components/ui/Btn";
import { portalForRole } from "@/lib/config/portals";

/**
 * Auth-aware header trailing slot.
 *  - Signed-out: renders the Sign in / Subscribe pair (matches Phase 1 design).
 *  - Signed-in: renders an avatar button with a dropdown
 *    (My dashboard / My profile / Sign out).
 *
 * Rendered as a client component because it depends on `useAuth()`. The rest
 * of the Header stays server-rendered.
 */
export function HeaderUserMenu() {
  const { firebaseUser, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) {
    return (
      <div className="h-7 w-[160px] rounded-sm bg-paper-2 animate-pulse" />
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex items-center gap-2">
        <Btn variant="ghost" size="sm">
          <Link href="/login">Sign in</Link>
        </Btn>
        <Btn variant="solid" size="sm">
          <Link href="/register">Subscribe</Link>
        </Btn>
      </div>
    );
  }

  const initials = (profile?.displayName ?? firebaseUser.email ?? "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Editors/admins live in a separate portal — offer a quick jump (Phase 7).
  const portal = portalForRole(profile?.role);

  async function handleSignOut() {
    try {
      await signOut();
      toast.info("Signed out.");
      router.replace("/");
    } catch {
      toast.error("Could not sign out. Try again.");
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 h-[30px] px-2 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-ink hover:bg-paper-2 transition-colors"
      >
        <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-ink text-paper text-[10px] font-bold">
          {initials || <User size={12} aria-hidden />}
        </span>
        <span className="hidden sm:inline max-w-[100px] truncate">
          {profile?.displayName ?? "Account"}
        </span>
        <ChevronDown size={12} aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-[200px] border-[1.5px] border-ink rounded-sm bg-paper shadow-sm z-50"
        >
          <div className="px-3 py-2 border-b border-black/10">
            <div className="font-sans text-[13px] text-ink truncate">
              {profile?.displayName}
            </div>
            <div className="font-hand text-[11px] text-muted truncate">
              {profile?.email ?? firebaseUser.email}
            </div>
            <div className="font-hand text-[11px] text-accent mt-0.5">
              {profile?.role ?? "reader"}
            </div>
          </div>
          {portal?.url ? (
            <a
              href={portal.url}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-1.5 px-3 py-2 font-hand text-[12px] text-ink hover:bg-paper-2"
            >
              <ExternalLink size={12} aria-hidden />
              Go to {portal.label} portal
            </a>
          ) : (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-3 py-2 font-hand text-[12px] text-ink hover:bg-paper-2"
            >
              My dashboard
            </Link>
          )}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block px-3 py-2 font-hand text-[12px] text-ink hover:bg-paper-2"
          >
            My profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            role="menuitem"
            className="w-full flex items-center gap-1.5 px-3 py-2 font-hand text-[12px] text-accent hover:bg-paper-2 border-t border-black/10 text-left"
          >
            <LogOut size={12} aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
