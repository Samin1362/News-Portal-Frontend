import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Gauge,
  Home,
  Image as ImageIcon,
  Pencil,
  Settings,
  User,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/types";

export interface SidebarItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  /** Optional count badge key, fed from the live counts hook. */
  countKey?: "drafts" | "submitted" | "rejected" | "role-request";
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const ALL: UserRole[] = ["reader", "journalist", "editor", "admin"];
const WRITERS: UserRole[] = ["journalist", "editor", "admin"];
const READER_ONLY: UserRole[] = ["reader"];

/**
 * Grouped sidebar nav for the journalist/reader dashboard. The Sidebar
 * component filters each group by role and skips groups whose items are all
 * hidden.
 *
 * NOTE: Editorial-desk and admin tools (review queue, comment moderation,
 * users, categories, ads) live in the dedicated admin portal
 * (`admin_frontend`), not here — so they are intentionally absent from this
 * nav. This dashboard stays journalist/reader self-service only.
 */
export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "NEWSROOM",
    items: [
      { key: "overview", label: "Overview", href: "/dashboard", icon: Gauge, roles: ALL },
    ],
  },
  {
    label: "WRITE",
    items: [
      {
        key: "articles",
        label: "My articles",
        href: "/dashboard/articles",
        icon: FileText,
        roles: WRITERS,
        countKey: "drafts",
      },
      {
        key: "media",
        label: "Media library",
        href: "/dashboard/media",
        icon: ImageIcon,
        roles: WRITERS,
      },
      {
        key: "become-journalist",
        label: "Become a journalist",
        href: "/dashboard/become-journalist",
        icon: Pencil,
        roles: READER_ONLY,
        countKey: "role-request",
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { key: "profile", label: "Profile", href: "/dashboard/profile", icon: User, roles: ALL },
      { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ALL },
    ],
  },
];

/** 5 most-used routes for the mobile bottom tab bar. */
export const BOTTOM_TABS: SidebarItem[] = [
  { key: "overview", label: "Today", href: "/dashboard", icon: Home, roles: ALL },
  {
    key: "articles",
    label: "Articles",
    href: "/dashboard/articles",
    icon: FileText,
    roles: WRITERS,
    countKey: "drafts",
  },
  {
    key: "media",
    label: "Media",
    href: "/dashboard/media",
    icon: ImageIcon,
    roles: WRITERS,
  },
  { key: "profile", label: "Profile", href: "/dashboard/profile", icon: User, roles: ALL },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ALL },
];

/** Friendly breadcrumb label per pathname segment. */
export const CRUMB_FOR_PATH: Record<string, string> = {
  dashboard: "Newsroom",
  articles: "My articles",
  new: "New article",
  edit: "Edit",
  media: "Media library",
  settings: "Settings",
  profile: "Profile",
  "become-journalist": "Become a journalist",
  status: "Status",
};
