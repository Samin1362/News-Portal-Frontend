"use client";

import { type ComponentType, type ReactNode } from "react";
import { CheckCheck, Inbox, X } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils/cn";

/**
 * Shared notification visual language (Updated-plan Phase 2). One look across
 * the reader bell (overlay `Panel`) and the journalist dashboard bell (anchored
 * dropdown): the same tone dots, icon chips, grouped rows, relative timestamps,
 * skeletons, and empty state. Containers differ; the body is shared.
 *
 * - `NotificationFeed` renders the scrollable, grouped body (skeleton / empty /
 *   rows). Each caller supplies its own header + footer chrome.
 * - `NotificationPanel` is the reader-facing overlay built on `Panel`.
 */

export type NotificationTone = "warn" | "info" | "accent" | "accent-2";

type IconType = ComponentType<{ size?: number; className?: string }>;

export interface NotificationFeedItem {
  id: string;
  title: string;
  detail: string | null;
  href: string;
  at: string;
  tone: NotificationTone;
  icon: IconType;
  /** Key into the `groups` list — controls ordering + section label. */
  groupKey: string;
}

export interface NotificationGroup {
  key: string;
  label: string;
}

const TONE_DOT: Record<NotificationTone, string> = {
  warn: "bg-[color:var(--color-warn)]",
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
  info: "bg-[color:var(--color-info)]",
};

const TONE_INK: Record<NotificationTone, string> = {
  warn: "text-[color:var(--color-warn)]",
  accent: "text-accent",
  "accent-2": "text-accent-2",
  info: "text-[color:var(--color-info)]",
};

/** Human-friendly relative time; falls back to a short date past a week. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Badge text for an unread count, or null when there's nothing unread. */
export function unreadBadgeLabel(count: number): string | null {
  if (count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}

interface RowProps {
  item: NotificationFeedItem;
  isUnread: boolean;
  onChoose: (item: NotificationFeedItem) => void;
  onDismiss: (id: string) => void;
}

export function NotificationRow({
  item,
  isUnread,
  onChoose,
  onDismiss,
}: RowProps) {
  const Icon = item.icon;
  return (
    <li>
      <div
        className={cn(
          "group relative flex items-start gap-3 px-3 py-2.5 cursor-pointer",
          "transition-colors hover:bg-paper-2",
          isUnread && "bg-paper-2/40",
        )}
        role="menuitem"
        tabIndex={0}
        onClick={() => onChoose(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChoose(item);
          }
        }}
      >
        <span
          aria-hidden
          className={cn(
            "shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-sm",
            "border-[1.5px] border-ink bg-paper",
            TONE_INK[item.tone],
          )}
        >
          <Icon size={13} />
        </span>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            {isUnread ? (
              <span
                aria-hidden
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  TONE_DOT[item.tone],
                )}
              />
            ) : null}
            <p
              className={cn(
                "font-sans text-[13px] truncate",
                isUnread
                  ? "font-extrabold text-ink"
                  : "font-semibold text-ink/85",
              )}
            >
              {item.title}
            </p>
          </div>
          {item.detail ? (
            <p className="font-sans text-[12px] text-muted truncate mt-0.5">
              {item.detail}
            </p>
          ) : null}
          <p className="font-hand text-[10px] uppercase tracking-wider text-muted mt-1">
            {formatRelativeTime(item.at)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(item.id);
          }}
          className={cn(
            "absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-sm",
            "text-muted hover:text-accent hover:bg-paper",
            "opacity-0 group-hover:opacity-100 focus:opacity-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            "transition-opacity",
          )}
        >
          <X size={12} aria-hidden />
        </button>
      </div>
    </li>
  );
}

interface FeedProps {
  items: NotificationFeedItem[];
  groups: NotificationGroup[];
  isLoading: boolean;
  lastReadAt: string | null;
  onChoose: (item: NotificationFeedItem) => void;
  onDismiss: (id: string) => void;
  /** Rendered when there are no items at all. */
  empty: ReactNode;
}

/**
 * The shared, scrollable grouped body. Rows are bucketed by `groupKey` in the
 * order `groups` is given; empty groups are skipped.
 */
export function NotificationFeed({
  items,
  groups,
  isLoading,
  lastReadAt,
  onChoose,
  onDismiss,
  empty,
}: FeedProps) {
  if (isLoading && items.length === 0) return <FeedSkeleton />;
  if (items.length === 0) return <>{empty}</>;

  const grouped = groups
    .map((g) => ({ ...g, rows: items.filter((i) => i.groupKey === g.key) }))
    .filter((g) => g.rows.length > 0);

  return (
    <ul>
      {grouped.map((g, gi) => (
        <li key={g.key}>
          <p
            className={cn(
              "px-3 pt-3 pb-1 font-hand text-[10px] uppercase tracking-wider text-muted",
              gi > 0 && "border-t border-ink/10 mt-1",
            )}
          >
            {g.label}
            <span className="ml-1 text-ink/50">· {g.rows.length}</span>
          </p>
          <ul>
            {g.rows.map((row) => (
              <NotificationRow
                key={row.id}
                item={row}
                isUnread={!lastReadAt || row.at > lastReadAt}
                onChoose={onChoose}
                onDismiss={onDismiss}
              />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Shared loading placeholder for both bells. */
export function FeedSkeleton() {
  return (
    <ul aria-hidden className="p-3 space-y-2">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-start gap-3 p-2 border-[1.5px] border-ink/15 rounded-sm"
        >
          <span className="w-7 h-7 rounded-sm bg-paper-2 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <span className="block h-3 w-3/4 bg-paper-2 rounded-sm animate-pulse" />
            <span className="block h-2.5 w-1/2 bg-paper-2 rounded-sm animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Generic empty state; callers pass tailored copy. */
export function NotificationEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-10 h-10 border-[1.5px] border-dashed border-ink/40 rounded-sm text-muted"
      >
        <Inbox size={18} />
      </span>
      <p className="font-sans text-[13px] font-semibold text-ink">{title}</p>
      <p className="font-sans text-[12px] text-muted max-w-[260px]">
        {description}
      </p>
    </div>
  );
}

interface PanelProps {
  open: boolean;
  onClose: () => void;
  items: NotificationFeedItem[];
  groups: NotificationGroup[];
  isLoading: boolean;
  unreadCount: number;
  lastReadAt: string | null;
  onChoose: (item: NotificationFeedItem) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
}

/**
 * Reader-facing notification overlay. Built on the shared `Panel` primitive so
 * it floats consistently with the search palette (scroll-lock, Escape, focus
 * trap, soft shadow). Top-aligned and sized narrower than the search palette.
 */
export function NotificationPanel({
  open,
  onClose,
  items,
  groups,
  isLoading,
  unreadCount,
  lastReadAt,
  onChoose,
  onDismiss,
  onMarkAllRead,
}: PanelProps) {
  return (
    <Panel
      open={open}
      onClose={onClose}
      align="top"
      label="Notifications"
      className="max-w-[420px]"
    >
      <header className="flex items-center justify-between gap-2 px-4 h-12 border-b-[1.5px] border-ink bg-paper-2">
        <div className="min-w-0">
          <p className="font-sans text-[14px] font-extrabold leading-tight text-ink">
            Notifications
          </p>
          <p className="font-hand text-[10px] uppercase tracking-wider text-muted">
            {unreadCount > 0
              ? `${unreadCount} new`
              : items.length > 0
                ? "All caught up"
                : "Nothing new"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMarkAllRead}
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-muted hover:text-accent hover:bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X size={15} aria-hidden />
          </button>
        </div>
      </header>

      <div className="max-h-[min(60vh,440px)] overflow-y-auto">
        <NotificationFeed
          items={items}
          groups={groups}
          isLoading={isLoading}
          lastReadAt={lastReadAt}
          onChoose={onChoose}
          onDismiss={onDismiss}
          empty={
            <NotificationEmpty
              title="You're all caught up"
              description="Breaking news and fresh top stories will show up here as they're published."
            />
          }
        />
      </div>

      <footer className="px-4 h-10 border-t-[1.5px] border-ink bg-paper-2 flex items-center justify-between">
        <span className="font-hand text-[10px] uppercase tracking-wider text-muted">
          Live from the newsroom
        </span>
        <span className="hidden sm:inline font-hand text-[10px] uppercase tracking-wider text-muted">
          Esc to close
        </span>
      </footer>
    </Panel>
  );
}
