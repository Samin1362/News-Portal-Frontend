"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomTabs } from "./BottomTabs";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  useStoredNavExpanded,
  writeStoredNavExpanded,
} from "@/hooks/useStoredNavExpanded";
import { cn } from "@/lib/utils/cn";

/**
 * App shell — sticky sidebar (rail or expanded on desktop, off-canvas
 * drawer on mobile), sticky topbar with breadcrumb + ⌘K search +
 * notification menu, and a mobile-only bottom tab bar. Mirrors the admin
 * portal so the two newsroom apps feel like a single product.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const expanded = useStoredNavExpanded();
  const userRole = role ?? "reader";

  // One toggle drives both: on lg+ it flips the persisted desktop rail ↔
  // full-drawer state; on smaller widths it toggles the off-canvas overlay.
  const handleToggle = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      writeStoredNavExpanded(!expanded);
    } else {
      setSidebarOpen((v) => !v);
    }
  }, [expanded]);

  return (
    <div className="min-h-screen bg-paper">
      {/* Skip-to-content link — visible only when keyboard-focused. */}
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-1.5 focus:bg-ink focus:text-paper focus:rounded-sm focus:font-sans focus:text-[12px] focus:font-semibold"
      >
        Skip to content
      </a>

      <Sidebar
        role={userRole}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "flex flex-col min-h-screen",
          "transition-[padding-left] duration-300",
          "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          expanded ? "lg:pl-[260px]" : "lg:pl-14",
        )}
      >
        <Topbar onToggleSidebar={handleToggle} sidebarOpen={sidebarOpen} />

        <main
          id="dashboard-main"
          tabIndex={-1}
          className={cn(
            "flex-1 px-3.5 sm:px-6 lg:px-[26px] py-[22px]",
            "pb-[100px] lg:pb-[40px]",
            "focus:outline-none",
          )}
        >
          <div className="stagger flex flex-col gap-[22px] max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </main>

        <BottomTabs role={userRole} />
      </div>
    </div>
  );
}
