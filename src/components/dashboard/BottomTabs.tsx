"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth/types";
import { useJournalistCounts } from "@/hooks/useJournalistCounts";
import { cn } from "@/lib/utils/cn";
import { BOTTOM_TABS, type SidebarItem } from "./nav-items";

/**
 * Mobile-only bottom tab bar — surfaces 4 most-used routes. Hidden on
 * ≥1024px (where the sticky sidebar is visible). Each tab carries an
 * optional red notification dot if its count is non-zero.
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
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 flex justify-around bg-paper border-t-[1.5px] border-ink"
      style={{ paddingBottom: "calc(6px + env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const count = resolveCount(tab);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={count > 0 ? `${tab.label} (${count} new)` : tab.label}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[44px] flex-1 rounded-[4px] font-hand text-[10px]",
              "focus:outline-none focus:ring-2 focus:ring-accent/40",
              isActive ? "text-ink" : "text-muted",
            )}
          >
            <Icon
              className={cn(
                "w-[18px] h-[18px]",
                isActive ? "text-accent" : "text-muted",
              )}
              strokeWidth={1.6}
            />
            <span>{tab.label}</span>
            {count > 0 ? (
              <span
                aria-hidden
                className="absolute top-1 right-2 w-1.5 h-1.5 bg-accent rounded-full"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
