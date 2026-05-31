"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listMine } from "@/lib/api/articles.api";
import {
  addDismissed,
  markAllRead,
  useNotificationPrefs,
} from "@/lib/notifications/store";
import { useMyRoleRequest } from "@/hooks/useMyRoleRequest";

export type JournalistNotificationKind =
  | "article-rejected"
  | "article-in-review"
  | "article-published"
  | "role-request-update";

export type NotificationTone = "warn" | "info" | "accent" | "accent-2";

export interface JournalistNotification {
  id: string;
  kind: JournalistNotificationKind;
  title: string;
  detail: string | null;
  href: string;
  at: string;
  tone: NotificationTone;
}

interface UseNotificationsResult {
  items: JournalistNotification[];
  unreadCount: number;
  isLoading: boolean;
  lastReadAt: string | null;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

const TONE_BY_KIND: Record<JournalistNotificationKind, NotificationTone> = {
  "article-rejected": "accent",
  "article-in-review": "warn",
  "article-published": "accent-2",
  "role-request-update": "info",
};

const JOURNALIST_ROLES = ["journalist", "editor", "admin"] as const;

/**
 * Synthesises a journalist-facing notification feed from existing endpoints
 * (no `/me/notifications` collection on the backend, same gap the admin
 * shell sidesteps the same way). Sources:
 *   1. Rejected articles — need a rewrite
 *   2. Submitted / under-review articles — awaiting a decision
 *   3. Recently published articles — informational win-state
 *   4. Role-request decisions — when the admin approves/rejects
 *
 * `unreadCount` compares each item's `at` against the persisted
 * `lastReadAt`. Dismissed ids are excluded entirely until the journalist
 * clears localStorage.
 */
export function useNotifications(): UseNotificationsResult {
  const { getIdToken, role, profile } = useAuth();
  const prefs = useNotificationPrefs();
  const enabled =
    role !== null && (JOURNALIST_ROLES as readonly string[]).includes(role);

  const rejectedQ = useQuery({
    enabled,
    queryKey: ["notifications", "rejected", profile?.id],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) return [];
      const res = await listMine({ status: "rejected", limit: 8 }, token);
      return res.items ?? [];
    },
    staleTime: 30_000,
    refetchInterval: 90_000,
  });

  const submittedQ = useQuery({
    enabled,
    queryKey: ["notifications", "submitted", profile?.id],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) return [];
      const [a, b] = await Promise.all([
        listMine({ status: "submitted", limit: 5 }, token),
        listMine({ status: "under_review", limit: 5 }, token),
      ]);
      return [...(a.items ?? []), ...(b.items ?? [])];
    },
    staleTime: 30_000,
    refetchInterval: 90_000,
  });

  const publishedQ = useQuery({
    enabled,
    queryKey: ["notifications", "published", profile?.id],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) return [];
      const res = await listMine({ status: "published", limit: 4 }, token);
      return res.items ?? [];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const roleRequest = useMyRoleRequest();

  const items = useMemo<JournalistNotification[]>(() => {
    const dismissed = new Set(prefs.dismissed);
    const out: JournalistNotification[] = [];

    for (const a of rejectedQ.data ?? []) {
      const id = `article-rejected:${a.id}:${a.updatedAt}`;
      if (dismissed.has(id)) continue;
      out.push({
        id,
        kind: "article-rejected",
        title: a.headline,
        detail: "Returned by the desk — open to see editor notes",
        href: `/dashboard/articles/${a.id}/edit`,
        at: a.updatedAt,
        tone: TONE_BY_KIND["article-rejected"],
      });
    }

    for (const a of submittedQ.data ?? []) {
      const id = `article-in-review:${a.id}:${a.updatedAt}`;
      if (dismissed.has(id)) continue;
      out.push({
        id,
        kind: "article-in-review",
        title: a.headline,
        detail:
          a.status === "under_review"
            ? "Editor is reviewing now"
            : "Waiting in the desk queue",
        href: `/dashboard/articles/${a.id}/edit`,
        at: a.updatedAt,
        tone: TONE_BY_KIND["article-in-review"],
      });
    }

    for (const a of publishedQ.data ?? []) {
      if (!a.publishedAt) continue;
      const id = `article-published:${a.id}:${a.publishedAt}`;
      if (dismissed.has(id)) continue;
      out.push({
        id,
        kind: "article-published",
        title: a.headline,
        detail: a.slug ? `/${a.slug} is live` : "Now live on Deligo News",
        href: `/dashboard/articles/${a.id}/edit`,
        at: a.publishedAt,
        tone: TONE_BY_KIND["article-published"],
      });
    }

    if (roleRequest.data) {
      const r = roleRequest.data;
      if (r.status === "pending") {
        const id = `role-request:${r.id}:pending:${r.updatedAt ?? r.createdAt}`;
        if (!dismissed.has(id)) {
          out.push({
            id,
            kind: "role-request-update",
            title: "Application under review",
            detail: "We aim to respond within 48 hours",
            href: "/dashboard/become-journalist/status",
            at: r.updatedAt ?? r.createdAt,
            tone: TONE_BY_KIND["role-request-update"],
          });
        }
      } else if (r.status === "approved") {
        const id = `role-request:${r.id}:approved:${r.decidedAt ?? r.updatedAt}`;
        if (!dismissed.has(id)) {
          out.push({
            id,
            kind: "role-request-update",
            title: "Application approved 🎉",
            detail: "You can start writing — sign out and back in to refresh",
            href: "/dashboard/become-journalist/status",
            at: r.decidedAt ?? r.updatedAt,
            tone: "accent-2",
          });
        }
      } else if (r.status === "rejected") {
        const id = `role-request:${r.id}:rejected:${r.decidedAt ?? r.updatedAt}`;
        if (!dismissed.has(id)) {
          out.push({
            id,
            kind: "role-request-update",
            title: "Application needs a refresh",
            detail: r.decisionReason ?? "Open the status page to see feedback",
            href: "/dashboard/become-journalist/status",
            at: r.decidedAt ?? r.updatedAt,
            tone: "accent",
          });
        }
      }
    }

    out.sort((a, b) => (a.at < b.at ? 1 : -1));
    return out;
  }, [
    rejectedQ.data,
    submittedQ.data,
    publishedQ.data,
    roleRequest.data,
    prefs.dismissed,
  ]);

  const unreadCount = useMemo(() => {
    if (!prefs.lastReadAt) return items.length;
    return items.filter((i) => i.at > prefs.lastReadAt!).length;
  }, [items, prefs.lastReadAt]);

  const dismiss = useCallback((id: string) => {
    addDismissed(id);
  }, []);

  const markAllReadCb = useCallback(() => {
    markAllRead();
  }, []);

  return {
    items,
    unreadCount,
    isLoading:
      rejectedQ.isLoading ||
      submittedQ.isLoading ||
      publishedQ.isLoading ||
      roleRequest.isPending,
    lastReadAt: prefs.lastReadAt,
    markAllRead: markAllReadCb,
    dismiss,
  };
}
