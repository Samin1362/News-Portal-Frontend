"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Gauge,
  Image as ImageIcon,
  ListChecks,
  LogOut,
  MessageSquare,
  Megaphone,
  Settings,
  Tag,
  User,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
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
  { href: "/profile", label: "Profile", Icon: User, roles: ["reader", "journalist", "editor", "admin"] },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings, roles: ["reader", "journalist", "editor", "admin"] },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const toast = useToast();
  const items = NAV.filter((i) => i.roles.includes(role));

  async function handleSignOut() {
    try {
      await signOut();
      toast.info("Signed out.");
      router.replace("/");
    } catch {
      toast.error("Could not sign out. Try again.");
    }
  }

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

      <div className="px-3 py-3 border-t-[1.5px] border-ink space-y-2">
        <div className="font-hand text-[11px] text-muted leading-tight">
          {profile?.displayName ? (
            <span className="block text-ink truncate">{profile.displayName}</span>
          ) : null}
          Signed in as <span className="text-ink">{role}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-ink hover:bg-paper transition-colors"
        >
          <LogOut size={12} aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}
