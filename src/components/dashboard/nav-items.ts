import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Gauge,
  Home,
  Image as ImageIcon,
  ListChecks,
  Megaphone,
  MessageSquare,
  Pencil,
  Settings,
  Tag,
  User,
  Users,
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
const DESK: UserRole[] = ["editor", "admin"];
const ADMIN_ONLY: UserRole[] = ["admin"];
const READER_ONLY: UserRole[] = ["reader"];

/**
 * Grouped sidebar nav. The Sidebar component filters each group by role and
 * skips groups whose items are all hidden.
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
    label: "DESK",
    items: [
      {
        key: "queue",
        label: "Review queue",
        href: "/dashboard/editor/queue",
        icon: ListChecks,
        roles: DESK,
      },
      {
        key: "comments",
        label: "Comments",
        href: "/dashboard/admin/comments",
        icon: MessageSquare,
        roles: DESK,
      },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { key: "users", label: "Users", href: "/dashboard/admin/users", icon: Users, roles: ADMIN_ONLY },
      { key: "categories", label: "Categories", href: "/dashboard/admin/categories", icon: Tag, roles: ADMIN_ONLY },
      { key: "ads", label: "Ads", href: "/dashboard/admin/ads", icon: Megaphone, roles: ADMIN_ONLY },
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
  editor: "Desk",
  queue: "Review queue",
  admin: "Admin",
  users: "Users",
  categories: "Categories",
  comments: "Comments",
  ads: "Ads",
  settings: "Settings",
  profile: "Profile",
  "become-journalist": "Become a journalist",
  status: "Status",
};
