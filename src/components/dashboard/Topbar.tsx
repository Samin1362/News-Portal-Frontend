"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { CRUMB_FOR_PATH } from "./nav-items";
import { CommandPalette } from "./CommandPalette";
import { NotificationsMenu } from "./NotificationsMenu";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils/cn";

interface TopbarProps {
  onToggleSidebar: () => void;
  /** True when mobile drawer is open — drives aria-expanded. */
  sidebarOpen: boolean;
}

function prettyCrumb(segment: string): string {
  if (!segment) return "Newsroom";
  const fromMap = CRUMB_FOR_PATH[segment];
  if (fromMap) return fromMap;
  return segment
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/**
 * Sticky top bar mirroring the admin shell — drawer toggle, breadcrumb,
 * ⌘K search trigger, on-shift pill, notifications menu, user chip.
 * Functionality preserved from the previous topbar (mobile drawer toggle
 * is still the sole responsibility of the parent shell).
 */
export function Topbar({ onToggleSidebar, sidebarOpen }: TopbarProps) {
  const pathname = usePathname() ?? "/dashboard";
  const { profile, role } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const parts = pathname.split("/").filter(Boolean);
  const head = parts.length > 0 ? prettyCrumb(parts[0]!) : "Newsroom";
  const tail =
    parts.length > 1 ? prettyCrumb(parts[parts.length - 1]!) : null;

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Global ⌘K / Ctrl+K toggles the palette from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isK = e.key === "k" || e.key === "K";
      if (!isK) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) {
        if (!(e.metaKey || e.ctrlKey)) return;
      }
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onShift =
    role === "journalist" || role === "editor" || role === "admin";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 bg-paper border-b-[1.5px] border-ink",
        )}
      >
        <div className="flex items-center gap-3 px-3.5 sm:px-5 lg:px-[22px] h-14">
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            aria-controls="primary-nav-drawer"
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-[4px] hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Menu className="w-4 h-4" strokeWidth={1.6} aria-hidden />
          </button>

          <Link
            href="/"
            aria-label="Deligo home"
            className="flex lg:hidden items-baseline gap-1.5 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="serif font-extrabold text-[20px] tracking-[-0.02em]">
              Deligo
            </span>
          </Link>

          <nav
            aria-label="Breadcrumb"
            className="hidden md:flex items-center gap-2 font-hand text-[12px] text-muted pl-1"
          >
            <span>{head}</span>
            {tail ? (
              <>
                <span className="text-ink/30">/</span>
                <span className="text-ink font-semibold truncate max-w-[28ch]">
                  {tail}
                </span>
              </>
            ) : null}
          </nav>

          <div className="flex-1" />

          {/* ⌘K search trigger — wide pill on lg+, icon-only otherwise. */}
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            aria-keyshortcuts="Meta+K Control+K"
            className={cn(
              "hidden lg:flex items-center gap-2 px-3 h-9 bg-paper-2 border-[1.5px] border-ink rounded-md",
              "min-w-[220px] xl:min-w-[260px] text-left",
              "hover:bg-paper transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "shadow-[2px_2px_0_var(--color-ink)]",
            )}
          >
            <Search size={14} aria-hidden className="text-muted" />
            <span className="flex-1 font-sans text-[13px] text-muted">
              Search…
            </span>
            <kbd className="font-mono text-[10px] text-muted bg-paper border border-ink/30 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-[4px] hover:bg-paper-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Search className="w-4 h-4" strokeWidth={1.6} aria-hidden />
          </button>

          {onShift ? (
            <Pill variant="green" dot className="hidden md:inline-flex">
              on shift
            </Pill>
          ) : null}

          <span
            aria-hidden
            className="hidden sm:inline-block w-px h-6 bg-ink/15"
          />

          <NotificationsMenu />

          {profile ? (
            <Link
              href="/dashboard/profile"
              className={cn(
                "hidden sm:inline-flex items-center gap-2 h-9 pl-1 pr-2 border-[1.5px] border-ink rounded-[4px]",
                "hover:bg-paper-2 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              )}
              aria-label="Your profile"
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/15 font-hand font-bold text-ink text-[11px]"
              >
                {initialsFor(profile.displayName)}
              </span>
              <span className="font-sans text-[12px] font-semibold truncate max-w-[120px]">
                {profile.displayName}
              </span>
            </Link>
          ) : null}
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}

function initialsFor(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
