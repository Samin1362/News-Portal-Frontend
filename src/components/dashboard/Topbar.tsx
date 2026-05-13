"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

function prettyCrumb(segment: string): string {
  if (!segment) return "Dashboard";
  return segment
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function Topbar() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b-[1.5px] border-ink bg-paper px-4 sm:px-6 py-2.5 flex items-center gap-3">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 min-w-0"
      >
        {parts.map((p, idx) => (
          <span key={idx} className="flex items-center gap-1.5 min-w-0">
            {idx > 0 ? (
              <span className="font-hand text-[12px] text-muted">/</span>
            ) : null}
            <span
              className={
                idx === parts.length - 1
                  ? "font-hand text-[12px] text-ink truncate"
                  : "font-hand text-[12px] text-muted truncate"
              }
            >
              {prettyCrumb(p)}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      <label
        className="hidden md:flex items-center gap-1.5 h-[30px] w-[260px] px-2 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-muted"
        aria-label="Search dashboard"
      >
        <Search size={14} aria-hidden />
        <input
          type="search"
          placeholder="Search…"
          className="bg-transparent flex-1 outline-none font-hand text-[12px] text-ink placeholder:text-muted"
        />
      </label>

      <button
        type="button"
        aria-label="Notifications"
        className="text-ink hover:text-accent transition-colors"
      >
        <Bell size={18} aria-hidden />
      </button>
    </div>
  );
}
