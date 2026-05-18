"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomTabs } from "./BottomTabs";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Two-column app shell. Sticky sidebar on desktop (lg+), slide-over drawer
 * on mobile with a hamburger toggle in the topbar. Bottom tab bar appears
 * only on mobile. Mirrors the editor portal shell so the look-and-feel
 * stays consistent across newsroom apps.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userRole = role ?? "reader";

  return (
    <div className="grid lg:grid-cols-[240px_1fr] min-h-screen bg-paper">
      <Sidebar
        role={userRole}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex flex-col min-w-0 bg-paper">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <div className="px-3.5 lg:px-[26px] py-[22px] pb-[90px] lg:pb-[40px] flex flex-col gap-[22px] stagger">
          {children}
        </div>
      </main>
      <BottomTabs role={userRole} />
    </div>
  );
}
