"use client";

import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { CRUMB_FOR_PATH } from "./nav-items";
import { cn } from "@/lib/utils/cn";

interface TopbarProps {
  onToggleSidebar: () => void;
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

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const pathname = usePathname() ?? "/dashboard";
  const parts = pathname.split("/").filter(Boolean);
  const head = parts.length > 0 ? prettyCrumb(parts[0]!) : "Newsroom";
  const tail =
    parts.length > 1 ? prettyCrumb(parts[parts.length - 1]!) : null;

  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-center gap-3 px-3.5 py-3 border-b-[1.5px] border-ink bg-paper",
        "lg:px-[22px]",
      )}
    >
      <button
        type="button"
        aria-label="Open sidebar"
        onClick={onToggleSidebar}
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-[4px] border-[1.5px] border-ink bg-paper"
      >
        <Menu className="w-4 h-4" strokeWidth={1.6} />
      </button>

      <div className="flex lg:hidden items-baseline gap-1.5">
        <span className="serif font-extrabold text-[20px] tracking-[-0.02em]">
          Deligo
        </span>
      </div>

      <nav
        aria-label="Breadcrumb"
        className="hidden lg:flex items-center gap-1.5 font-hand text-[12px] text-muted"
      >
        <span>{head}</span>
        {tail ? (
          <>
            <span>/</span>
            <span className="text-ink font-bold">{tail}</span>
          </>
        ) : null}
      </nav>

      <div className="grow" />

      <label
        className={cn(
          "hidden lg:flex items-center gap-2 h-8 w-[260px] px-2.5",
          "border-[1.5px] border-ink rounded-[4px] bg-paper-2",
          "focus-within:ring-2 focus-within:ring-accent/40",
        )}
        aria-label="Search dashboard"
      >
        <Search className="w-3.5 h-3.5 text-muted" strokeWidth={1.6} />
        <input
          type="search"
          placeholder="Search drafts, media…"
          className="bg-transparent grow outline-none font-hand text-[12.5px] text-ink placeholder:text-muted"
        />
      </label>

      <button
        type="button"
        aria-label="Notifications"
        className="inline-flex items-center justify-center w-9 h-9 rounded-[4px] border-[1.5px] border-ink bg-paper hover:bg-paper-2 text-ink"
      >
        <Bell className="w-4 h-4" strokeWidth={1.6} aria-hidden />
      </button>
    </div>
  );
}
