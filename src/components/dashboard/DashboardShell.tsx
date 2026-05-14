"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "@/lib/auth/AuthProvider";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  return (
    <div className="min-h-full flex bg-paper">
      <Sidebar role={role ?? "reader"} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
