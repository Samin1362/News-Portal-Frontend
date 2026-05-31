"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth/types";
import { useJournalistCounts } from "@/hooks/useJournalistCounts";
import { cn } from "@/lib/utils/cn";
import { BOTTOM_TABS, type SidebarItem } from "./nav-items";

/**
 * Mobile-only bottom tab bar — 4-to-5 most-used routes. Hidden on
 * ≥1024px (the sticky sidebar takes over). Active tab is accent-colored;
 * an unread badge appears when the resolved count > 0. Mirrors the
 * admin portal's `MobileTabs` layout: icon over uppercase font-sans
 * label, top-right numeric badge, safe-area inset for iPhone home bars.
 */
export function BottomTabs({ role }: { role: UserRole }) {
  const pathname = usePathname() ?? "/";
  const { counts } = useJournalistCounts();
  const tabs = BOTTOM_TABS.filter((t) => t.roles.includes(role));

  const resolveCount = (item: SidebarItem): number => {
    if (!item.countKey || !counts) return 0;
    if (item.countKey === "drafts") return counts.draft;
    if (item.countKey === "submitted") return counts.review;
    if (item.countKey === "rejected") return counts.rejected;
    return 0;
  };

  return (
    <nav
      aria-label="Primary mobile navigation"
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-30",
        "bg-paper border-t-[1.5px] border-ink",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const count = resolveCount(tab);
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  count > 0 ? `${tab.label} (${count} pending)` : tab.label
                }
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2",
                  "font-sans text-[10px] font-semibold uppercase tracking-wider",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  isActive ? "text-accent" : "text-ink/70 hover:text-ink",
                )}
              >
                <Icon
                  className={cn(
                    "w-[18px] h-[18px]",
                    isActive ? "text-accent" : "text-muted",
                  )}
                  strokeWidth={1.6}
                  aria-hidden
                />
                <span>{tab.label}</span>
                {count > 0 ? (
                  <span
                    className="absolute top-1 right-[calc(50%-18px)] inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-accent text-paper font-sans text-[9px] font-bold border-[1.5px] border-paper"
                    aria-hidden
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
