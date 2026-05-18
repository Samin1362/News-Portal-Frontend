"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth/types";
import { useJournalistCounts } from "@/hooks/useJournalistCounts";
import { cn } from "@/lib/utils/cn";
import { SIDEBAR_GROUPS, type SidebarItem } from "./nav-items";
import { UserMenu } from "./UserMenu";

interface SidebarProps {
  role: UserRole;
  /** Mobile drawer state — desktop sidebar ignores both. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const { counts } = useJournalistCounts();

  const resolveCount = (item: SidebarItem): number => {
    if (!item.countKey || !counts) return 0;
    if (item.countKey === "drafts") return counts.draft;
    if (item.countKey === "submitted") return counts.review;
    if (item.countKey === "rejected") return counts.rejected;
    return 0;
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-ink/35 lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "z-40 bg-paper-2 border-r-[1.5px] border-ink",
          "flex flex-col gap-0.5 p-3 pt-4",
          "fixed inset-y-0 left-0 w-[260px]",
          "lg:sticky lg:top-0 lg:h-screen lg:w-[240px] lg:translate-x-0",
          "transition-transform duration-300 ease-out overflow-y-auto",
          open
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-baseline gap-1.5 px-1.5 pb-4 pt-1">
          <span className="serif font-extrabold text-[22px] tracking-[-0.02em]">
            Deligo
          </span>
          <span className="font-hand text-[11px] text-accent">
            · {roleTag(role)}
          </span>
        </div>

        {SIDEBAR_GROUPS.map((group, gIdx) => {
          const visible = group.items.filter((i) => i.roles.includes(role));
          if (visible.length === 0) return null;
          return (
            <div key={`${group.label}-${gIdx}`}>
              <div className="font-hand text-[10px] text-muted tracking-[0.12em] px-2 pb-1 pt-3">
                {group.label}
              </div>
              {visible.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                const count = resolveCount(item);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2.5 px-2.5 py-2 rounded-[4px]",
                      "font-hand text-[13.5px] text-ink cursor-pointer",
                      "transition-[background,color,padding] duration-[180ms]",
                      "hover:bg-ink/5 hover:pl-3.5",
                      "focus:outline-none focus:ring-2 focus:ring-accent/40",
                      isActive &&
                        "bg-ink text-paper hover:bg-ink hover:pl-3.5",
                    )}
                  >
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute left-[-12px] top-2 bottom-2 w-[3px] bg-accent rounded-[2px]"
                      />
                    ) : null}
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px]",
                        isActive ? "text-paper" : "text-muted",
                      )}
                      strokeWidth={1.6}
                    />
                    <span className="grow">{item.label}</span>
                    {item.countKey && count > 0 ? (
                      <span
                        className={cn(
                          "ml-auto font-hand text-[11px] px-[7px] py-[1px] rounded-full border-[1.2px]",
                          isActive
                            ? "bg-accent text-paper border-accent"
                            : "bg-paper text-ink border-ink",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          );
        })}

        <UserMenu onNavigate={onClose} />
      </aside>
    </>
  );
}

function roleTag(role: UserRole): string {
  if (role === "admin") return "admin";
  if (role === "editor") return "editor";
  if (role === "journalist") return "journalist";
  return "newsroom";
}
