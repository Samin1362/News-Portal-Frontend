"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils/cn";

function initialsFor(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

interface UserMenuProps {
  onNavigate?: () => void;
}

/**
 * Profile chip pinned to the bottom of the sidebar, with a popover menu
 * (profile, settings, sign out). Closes on outside-click, Escape, or after
 * a destructive action. Mirrors the editor portal's UserMenu shape so the
 * two shells feel like one product.
 */
export function UserMenu({ onNavigate }: UserMenuProps) {
  const { profile, role, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = profile?.displayName ?? "—";
  const email = profile?.email ?? "";
  const roleLine = role ? `Signed in · ${role}` : "—";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.info("Signed out.");
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign out");
      setSigningOut(false);
    }
  };

  const handleNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={rootRef} className="relative mt-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2.5 w-full px-2.5 py-2 border-[1.5px] border-ink rounded-[4px] bg-paper",
          "transition-[background] duration-[120ms] hover:bg-paper-2 active:translate-y-[0.5px]",
        )}
      >
        <span
          className="rounded-full border-[1.5px] border-ink bg-accent/15 inline-flex items-center justify-center font-hand font-bold text-ink shrink-0 w-[28px] h-[28px] text-[12px]"
          aria-hidden
        >
          {initialsFor(displayName)}
        </span>
        <div className="flex flex-col min-w-0 flex-1 text-left">
          <span className="font-hand text-[13px] font-bold truncate">
            {displayName}
          </span>
          <span className="font-hand text-[10px] text-muted truncate">
            {roleLine}
          </span>
        </div>
        <span
          aria-hidden
          className={cn(
            "font-hand text-muted text-[12px] transition-transform duration-[120ms]",
            open && "rotate-180",
          )}
        >
          ⌄
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute z-50 w-[230px] bg-paper border-[1.5px] border-ink rounded-sm shadow-[4px_4px_0_var(--color-ink)] overflow-hidden bottom-[calc(100%+6px)] left-0"
        >
          <div className="px-3 py-2.5 border-b-[1.5px] border-ink/15 bg-paper-2">
            <p className="serif text-[14px] font-extrabold truncate">
              {displayName}
            </p>
            {email ? (
              <p
                className="font-hand text-[11px] text-muted truncate"
                title={email}
              >
                {email}
              </p>
            ) : null}
            <p className="font-hand text-[10px] text-accent uppercase tracking-[0.08em] mt-0.5">
              {roleLine}
            </p>
          </div>

          <ul className="flex flex-col py-1">
            <li>
              <Link
                href="/dashboard/profile"
                onClick={handleNavigate}
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 font-hand text-[13px] hover:bg-paper-2"
              >
                <UserRound size={14} /> Your profile
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                onClick={handleNavigate}
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 font-hand text-[13px] hover:bg-paper-2"
              >
                <Settings size={14} /> Settings
              </Link>
            </li>
            <li className="border-t-[1.5px] border-ink/15 mt-1 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                role="menuitem"
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 font-hand text-[13px] text-accent",
                  "hover:bg-accent/10 disabled:opacity-60 disabled:cursor-wait text-left",
                )}
              >
                <LogOut size={14} />{" "}
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
