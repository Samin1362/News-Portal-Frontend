"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Gauge,
  Image as ImageIcon,
  ListChecks,
  MessageSquare,
  Megaphone,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils/cn";

type Item = {
  href: string;
  label: string;
  Icon: typeof Gauge;
  roles: UserRole[];
};

const NAV: Item[] = [
  { href: "/dashboard", label: "Overview", Icon: Gauge, roles: ["reader", "journalist", "editor", "admin"] },
  { href: "/dashboard/articles", label: "My articles", Icon: FileText, roles: ["journalist", "editor", "admin"] },
  { href: "/dashboard/media", label: "Media library", Icon: ImageIcon, roles: ["journalist", "editor", "admin"] },
  { href: "/dashboard/editor/queue", label: "Review queue", Icon: ListChecks, roles: ["editor", "admin"] },
  { href: "/dashboard/admin/users", label: "Users", Icon: Users, roles: ["admin"] },
  { href: "/dashboard/admin/categories", label: "Categories", Icon: Tag, roles: ["admin"] },
  { href: "/dashboard/admin/comments", label: "Comments", Icon: MessageSquare, roles: ["editor", "admin"] },
  { href: "/dashboard/admin/ads", label: "Ads", Icon: Megaphone, roles: ["admin"] },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings, roles: ["reader", "journalist", "editor", "admin"] },
];

interface SidebarProps {
  /**
   * Phase 1 ships a stub role so the full nav is visible during shell work.
   * Phase 2 swaps this for `useAuth().role`, hiding items per role.
   */
  role?: UserRole;
}

export function Sidebar({ role = "admin" }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV.filter((i) => i.roles.includes(role));

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r-[1.5px] border-ink bg-paper-2">
      <div className="px-4 py-4 border-b-[1.5px] border-ink">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="serif text-[22px] font-extrabold leading-none tracking-tight">
            Deligo
          </span>
          <span className="font-hand text-[11px] text-accent">· daily</span>
        </Link>
        <div className="font-hand text-[11px] text-muted mt-1">
          Newsroom dashboard
        </div>
      </div>

      <nav aria-label="Dashboard" className="flex-1 px-2 py-3 space-y-0.5">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-sm font-hand text-[13px]",
                "transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "text-ink hover:bg-paper hover:text-accent",
              )}
            >
              <Icon size={14} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t-[1.5px] border-ink font-hand text-[11px] text-muted">
        Signed in as <span className="text-ink">{role}</span>
      </div>
    </aside>
  );
}
