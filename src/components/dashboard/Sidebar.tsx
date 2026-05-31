"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth/types";
import { useJournalistCounts } from "@/hooks/useJournalistCounts";
import { useMyRoleRequest } from "@/hooks/useMyRoleRequest";
import {
  useStoredNavExpanded,
  writeStoredNavExpanded,
} from "@/hooks/useStoredNavExpanded";
import { cn } from "@/lib/utils/cn";
import { SIDEBAR_GROUPS, type SidebarItem } from "./nav-items";
import { UserMenu } from "./UserMenu";

interface SidebarProps {
  role: UserRole;
  /** Mobile drawer state. */
  open: boolean;
  onClose: () => void;
}

interface NavBadge {
  label: string;
  /** "warn" = amber (pending), undefined = default accent. */
  tone?: "warn";
}

/**
 * Two-mode sidebar mirroring the admin shell.
 *
 *  - Mobile: slide-over drawer with a backdrop, full-width labels.
 *  - Desktop ≥1024px: sticky panel that toggles between a 56px icon rail
 *    and a 260px expanded drawer. Preference is persisted in localStorage
 *    via `useStoredNavExpanded`.
 *
 * Each group is rendered with a section header. Clicking a group icon
 * while in rail mode promotes the drawer to expanded so the sub-routes
 * become visible (matches admin's rail-click behaviour).
 */
export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const { counts } = useJournalistCounts();
  const { data: roleRequest } = useMyRoleRequest();
  const expanded = useStoredNavExpanded();

  // ESC closes the mobile overlay (no-op on desktop where drawer is sticky).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock only while mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const promoteFromRail = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches &&
      !expanded
    ) {
      writeStoredNavExpanded(true);
    }
  }, [expanded]);

  const resolveBadge = useCallback(
    (item: SidebarItem): NavBadge | null => {
      if (!item.countKey) return null;
      if (item.countKey === "role-request") {
        if (roleRequest?.status === "pending")
          return { label: "Pending", tone: "warn" };
        if (roleRequest?.status === "rejected") return { label: "Rejected" };
        return null;
      }
      if (!counts) return null;
      let n = 0;
      if (item.countKey === "drafts") n = counts.draft;
      else if (item.countKey === "submitted") n = counts.review;
      else if (item.countKey === "rejected") n = counts.rejected;
      return n > 0 ? { label: String(n) } : null;
    },
    [counts, roleRequest?.status],
  );

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px]",
          "transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      <aside
        id="primary-nav-drawer"
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-paper-2 border-r-[1.5px] border-ink",
          "shadow-2xl lg:shadow-none",
          "flex flex-col overflow-x-visible",
          "transition-[width,transform] duration-300 will-change-transform",
          "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          "w-[260px]",
          expanded ? "lg:w-[260px]" : "lg:w-14",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex items-center h-14 border-b-[1.5px] border-ink/40 shrink-0 px-3">
          <Link
            href="/"
            onClick={onClose}
            aria-label="Deligo home"
            className={cn(
              "serif font-extrabold tracking-tight flex items-center",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm",
            )}
          >
            <span
              className={cn(
                "text-[18px] whitespace-nowrap",
                expanded ? "lg:inline" : "lg:hidden",
              )}
            >
              Deligo<span className="text-accent">·</span>
              <span className="font-hand text-accent text-[12px]">
                {roleTag(role)}
              </span>
            </span>
            <span
              className={cn(
                "text-[20px] leading-none hidden",
                expanded ? "lg:hidden" : "lg:inline-flex",
              )}
            >
              D<span className="text-accent">·</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-visible py-3 px-2">
          {SIDEBAR_GROUPS.map((group) => {
            const visible = group.items.filter((i) => i.roles.includes(role));
            if (visible.length === 0) return null;
            return (
              <div key={group.label} className="mb-1">
                <div
                  className={cn(
                    "font-hand text-[10px] text-muted tracking-[0.14em] uppercase",
                    "px-2 pb-1 pt-3",
                    expanded ? "" : "lg:hidden",
                  )}
                >
                  {group.label}
                </div>
                {!expanded ? (
                  <GroupRailDivider />
                ) : null}
                <ul className="space-y-1">
                  {visible.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
                    const badge = resolveBadge(item);
                    return (
                      <li key={item.key} className="relative group">
                        <Link
                          href={item.href}
                          onClick={() => {
                            promoteFromRail();
                            onClose();
                          }}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "relative flex items-center gap-2.5 rounded-md font-sans text-[13px] transition-colors",
                            "px-3 py-2",
                            expanded
                              ? "lg:px-3 lg:justify-start"
                              : "lg:px-0 lg:justify-center",
                            isActive
                              ? "nav-active bg-ink text-paper hover:bg-ink"
                              : "text-ink hover:bg-paper",
                          )}
                        >
                          <Icon
                            size={16}
                            aria-hidden
                            className={cn(
                              "shrink-0",
                              isActive ? "text-paper" : "text-muted",
                            )}
                            strokeWidth={1.6}
                          />
                          <span
                            className={cn(
                              "flex-1 truncate",
                              expanded ? "" : "lg:hidden",
                            )}
                          >
                            {item.label}
                          </span>
                          {badge ? (
                            <>
                              <span
                                className={cn(
                                  "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full",
                                  "font-sans text-[10px] font-bold border-[1.2px] whitespace-nowrap",
                                  isActive
                                    ? "bg-paper text-ink border-paper"
                                    : badge.tone === "warn"
                                      ? "bg-[color:var(--color-warn)] text-paper border-[color:var(--color-warn)]"
                                      : "bg-accent text-paper border-accent",
                                  expanded ? "" : "lg:hidden",
                                )}
                              >
                                {badge.label}
                              </span>
                              {/* Tiny dot indicator while in rail mode. */}
                              <span
                                aria-hidden
                                className={cn(
                                  "absolute top-1 right-1 w-2 h-2 rounded-full hidden",
                                  badge.tone === "warn"
                                    ? "bg-[color:var(--color-warn)]"
                                    : "bg-accent",
                                  expanded ? "lg:hidden" : "lg:inline-block",
                                )}
                              />
                            </>
                          ) : null}
                        </Link>
                        {!expanded ? (
                          <RailTooltip label={item.label} badge={badge?.label} />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div
          className={cn(
            "p-3 border-t-[1.5px] border-ink/40 shrink-0",
            expanded ? "" : "lg:hidden",
          )}
        >
          <UserMenu onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}

function GroupRailDivider() {
  return (
    <div
      aria-hidden
      className="hidden lg:block h-px mx-2 mt-1 mb-1 bg-ink/15"
    />
  );
}

function RailTooltip({ label, badge }: { label: string; badge?: string }) {
  return (
    <span
      role="tooltip"
      className={cn(
        "hidden lg:flex items-center gap-1 absolute left-full top-1/2 -translate-y-1/2 ml-2",
        "px-2 py-1 bg-ink text-paper font-sans text-[11px] rounded",
        "whitespace-nowrap pointer-events-none shadow-md z-[60]",
        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        "transition-opacity duration-150",
      )}
    >
      {label}
      {badge ? (
        <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-paper font-mono text-[9px] font-bold">
          {badge}
        </span>
      ) : null}
    </span>
  );
}

function roleTag(role: UserRole): string {
  if (role === "admin") return "admin";
  if (role === "editor") return "editor";
  if (role === "journalist") return "newsroom";
  return "reader";
}
