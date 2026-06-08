"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Zap } from "lucide-react";
import { getBreaking, getHomepage } from "@/lib/api/public.api";
import type { ArticleCardDTO } from "@/lib/types/article";
import {
  addReaderDismissed,
  markAllReaderRead,
  useReaderNotificationPrefs,
} from "@/lib/notifications/readerStore";
import type {
  NotificationFeedItem,
  NotificationGroup,
} from "@/components/public/notifications/NotificationPanel";

/**
 * Synthesises a reader-facing notification feed from the public endpoints the
 * homepage already uses — the backend has no `/me/notifications` collection
 * (same gap the dashboard + admin bells sidestep). Sources:
 *   1. Breaking news (`GET /public/breaking`)
 *   2. Fresh top stories (`GET /public/homepage` → topHeadlines + latest)
 *
 * "Unread" = items newer than the persisted `lastReadAt`. Dismissed ids are
 * excluded until the reader clears localStorage. The `(signed-in)` activity
 * source (replies etc.) is intentionally left as a third bucket to add once the
 * backend ships it — swapping in `/me/notifications` is then a one-file change.
 */

export const READER_NOTIFICATION_GROUPS: NotificationGroup[] = [
  { key: "breaking", label: "Breaking" },
  { key: "new-story", label: "New stories" },
];

const BREAKING_CAP = 6;
const STORY_CAP = 8;

interface UseReaderNotificationsResult {
  items: NotificationFeedItem[];
  groups: NotificationGroup[];
  unreadCount: number;
  isLoading: boolean;
  lastReadAt: string | null;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

function articleTime(a: ArticleCardDTO): string {
  return a.publishedAt ?? a.createdAt;
}

export function useReaderNotifications(): UseReaderNotificationsResult {
  const prefs = useReaderNotificationPrefs();

  const breakingQ = useQuery({
    queryKey: ["reader-notifications", "breaking"],
    queryFn: () => getBreaking(BREAKING_CAP),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const homepageQ = useQuery({
    queryKey: ["reader-notifications", "homepage"],
    queryFn: () => getHomepage(),
    staleTime: 60_000,
    refetchInterval: 180_000,
  });

  const items = useMemo<NotificationFeedItem[]>(() => {
    const dismissed = new Set(prefs.dismissed);
    const out: NotificationFeedItem[] = [];
    const breakingIds = new Set<string>();

    for (const a of breakingQ.data ?? []) {
      breakingIds.add(a.id);
      const at = articleTime(a);
      const id = `breaking:${a.id}:${at}`;
      if (dismissed.has(id)) continue;
      out.push({
        id,
        groupKey: "breaking",
        title: a.headline,
        detail: a.summary || "Breaking news",
        href: `/article/${a.slug}`,
        at,
        tone: "accent",
        icon: Zap,
      });
    }

    // Fresh top stories — homepage top headlines first, then latest. Skip
    // anything already surfaced as breaking, and dedupe within this bucket.
    const home = homepageQ.data;
    const stories = home ? [...home.topHeadlines, ...home.latest] : [];
    const seen = new Set<string>();
    let storyCount = 0;
    for (const a of stories) {
      if (storyCount >= STORY_CAP) break;
      if (breakingIds.has(a.id) || seen.has(a.id)) continue;
      seen.add(a.id);
      const at = articleTime(a);
      const id = `new-story:${a.id}:${at}`;
      if (dismissed.has(id)) continue;
      out.push({
        id,
        groupKey: "new-story",
        title: a.headline,
        detail: a.summary || "Now live on Deligo News",
        href: `/article/${a.slug}`,
        at,
        tone: a.isTrending ? "accent-2" : "info",
        icon: Newspaper,
      });
      storyCount += 1;
    }

    out.sort((a, b) => (a.at < b.at ? 1 : -1));
    return out;
  }, [breakingQ.data, homepageQ.data, prefs.dismissed]);

  const unreadCount = useMemo(() => {
    if (!prefs.lastReadAt) return items.length;
    const lastRead = prefs.lastReadAt;
    return items.filter((i) => i.at > lastRead).length;
  }, [items, prefs.lastReadAt]);

  const dismiss = useCallback((id: string) => {
    addReaderDismissed(id);
  }, []);

  const markAllRead = useCallback(() => {
    markAllReaderRead();
  }, []);

  return {
    items,
    groups: READER_NOTIFICATION_GROUPS,
    unreadCount,
    isLoading: breakingQ.isLoading || homepageQ.isLoading,
    lastReadAt: prefs.lastReadAt,
    markAllRead,
    dismiss,
  };
}
