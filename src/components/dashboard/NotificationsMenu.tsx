"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Clock,
  FileWarning,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  useNotifications,
  type JournalistNotificationKind,
} from "@/hooks/useNotifications";
import {
  NotificationEmpty,
  NotificationFeed,
  unreadBadgeLabel,
  type NotificationFeedItem,
  type NotificationGroup,
} from "@/components/public/notifications/NotificationPanel";
import { cn } from "@/lib/utils/cn";

const KIND_ICON: Record<
  JournalistNotificationKind,
  NotificationFeedItem["icon"]
> = {
  "article-rejected": FileWarning,
  "article-in-review": Clock,
  "article-published": Sparkles,
  "role-request-update": UserRound,
};

const GROUPS: NotificationGroup[] = [
  { key: "article-rejected", label: "Needs your rewrite" },
  { key: "role-request-update", label: "Application updates" },
  { key: "article-in-review", label: "Awaiting the desk" },
  { key: "article-published", label: "Now live" },
];

/**
 * Bell button + dropdown for the journalist topbar. Shares the reader
 * notification visual language (`NotificationFeed`/`NotificationRow`,
 * Updated-plan Phase 2) while keeping its anchored-dropdown container and the
 * synthesised journalist data source. The badge surfaces unread events;
 * clicking a row routes to the relevant page. Click outside / Esc closes.
 */
export function NotificationsMenu() {
  const router = useRouter();
  const { items, unreadCount, isLoading, lastReadAt, markAllRead, dismiss } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const feedItems = useMemo<NotificationFeedItem[]>(
    () =>
      items.map((i) => ({
        id: i.id,
        title: i.title,
        detail: i.detail,
        href: i.href,
        at: i.at,
        tone: i.tone,
        icon: KIND_ICON[i.kind],
        groupKey: i.kind,
      })),
    [items],
  );

  const choose = useCallback(
    (item: NotificationFeedItem) => {
      setOpen(false);
      router.push(item.href);
    },
    [router],
  );

  const badgeLabel = unreadBadgeLabel(unreadCount);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "relative inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-[4px]",
          "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          open ? "bg-paper-2" : "bg-paper hover:bg-paper-2",
        )}
      >
        <Bell className="w-4 h-4" strokeWidth={1.6} aria-hidden />
        {items.length > 0 ? (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 inline-flex items-center justify-center pointer-events-none"
          >
            {badgeLabel ? (
              <span
                className={cn(
                  "min-w-[18px] h-[18px] px-1 rounded-full border-[1.5px] border-paper",
                  "bg-accent text-paper font-mono text-[10px] font-bold leading-none",
                  "flex items-center justify-center shadow-[1px_1px_0_var(--color-ink)]",
                )}
              >
                {badgeLabel}
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-accent-2 border-[1.5px] border-paper" />
            )}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Notifications"
          className={cn(
            "absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)]",
            "bg-paper border-[1.5px] border-ink rounded-sm",
            "shadow-[6px_6px_0_var(--color-ink)] overflow-hidden",
            "flex flex-col max-h-[70vh]",
          )}
        >
          <header className="flex items-center justify-between gap-2 px-3 h-11 border-b-[1.5px] border-ink bg-paper-2">
            <div className="min-w-0">
              <p className="font-sans text-[13px] font-extrabold leading-tight">
                Notifications
              </p>
              <p className="font-hand text-[10px] uppercase tracking-wider text-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : items.length > 0
                    ? "All caught up"
                    : "Nothing pending"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={unreadCount === 0}
              className={cn(
                "inline-flex items-center gap-1 px-2 h-7 border-[1.5px] rounded-sm",
                "font-hand text-[11px] uppercase tracking-wider",
                "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                unreadCount > 0
                  ? "border-ink hover:bg-paper text-ink"
                  : "border-ink/20 text-muted cursor-not-allowed",
              )}
            >
              <CheckCheck size={12} aria-hidden />
              Mark read
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <NotificationFeed
              items={feedItems}
              groups={GROUPS}
              isLoading={isLoading}
              lastReadAt={lastReadAt}
              onChoose={choose}
              onDismiss={dismiss}
              empty={
                <NotificationEmpty
                  title="Nothing waiting for you"
                  description="Editor decisions, role-request updates, and your published wins will show up here."
                />
              }
            />
          </div>

          <footer className="px-3 h-10 border-t-[1.5px] border-ink bg-paper-2 flex items-center justify-between">
            <span className="font-hand text-[10px] uppercase tracking-wider text-muted">
              Synthesised feed
            </span>
            <Link
              href="/dashboard/articles"
              onClick={() => setOpen(false)}
              className="font-hand text-[11px] uppercase tracking-wider text-accent hover:underline"
            >
              All my articles →
            </Link>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
