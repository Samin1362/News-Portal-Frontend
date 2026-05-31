"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Clock,
  FileWarning,
  Inbox,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  useNotifications,
  type JournalistNotification,
  type JournalistNotificationKind,
  type NotificationTone,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils/cn";

const KIND_ICON: Record<JournalistNotificationKind, typeof Bell> = {
  "article-rejected": FileWarning,
  "article-in-review": Clock,
  "article-published": Sparkles,
  "role-request-update": UserRound,
};

const GROUP_LABEL: Record<JournalistNotificationKind, string> = {
  "article-rejected": "Needs your rewrite",
  "article-in-review": "Awaiting the desk",
  "article-published": "Now live",
  "role-request-update": "Application updates",
};

const GROUP_ORDER: JournalistNotificationKind[] = [
  "article-rejected",
  "role-request-update",
  "article-in-review",
  "article-published",
];

const TONE_DOT: Record<NotificationTone, string> = {
  warn: "bg-[color:var(--color-warn)]",
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
  info: "bg-[color:var(--color-info)]",
};

const TONE_RING: Record<NotificationTone, string> = {
  warn: "text-[color:var(--color-warn)]",
  accent: "text-accent",
  "accent-2": "text-accent-2",
  info: "text-[color:var(--color-info)]",
};

/**
 * Bell button + dropdown for the journalist topbar. The badge surfaces
 * unread synthesised events; clicking a row routes to the relevant page.
 * Hover-X dismisses a row locally. Click outside / Esc closes.
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

  const choose = useCallback(
    (row: JournalistNotification) => {
      setOpen(false);
      router.push(row.href);
    },
    [router],
  );

  const grouped = GROUP_ORDER.map((kind) => ({
    kind,
    rows: items.filter((i) => i.kind === kind),
  })).filter((g) => g.rows.length > 0);

  const badgeLabel =
    unreadCount > 0
      ? unreadCount > 99
        ? "99+"
        : String(unreadCount)
      : null;

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
            {isLoading && items.length === 0 ? (
              <SkeletonRows />
            ) : items.length === 0 ? (
              <EmptyState />
            ) : (
              <ul>
                {grouped.map((g, gi) => (
                  <li key={g.kind}>
                    <p
                      className={cn(
                        "px-3 pt-3 pb-1 font-hand text-[10px] uppercase tracking-wider text-muted",
                        gi > 0 && "border-t border-ink/10 mt-1",
                      )}
                    >
                      {GROUP_LABEL[g.kind]}
                      <span className="ml-1 text-ink/50">· {g.rows.length}</span>
                    </p>
                    <ul>
                      {g.rows.map((row) => (
                        <NotificationRow
                          key={row.id}
                          row={row}
                          isUnread={!lastReadAt || row.at > lastReadAt}
                          onChoose={choose}
                          onDismiss={dismiss}
                        />
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
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

interface RowProps {
  row: JournalistNotification;
  isUnread: boolean;
  onChoose: (row: JournalistNotification) => void;
  onDismiss: (id: string) => void;
}

function NotificationRow({ row, isUnread, onChoose, onDismiss }: RowProps) {
  const Icon = KIND_ICON[row.kind];
  return (
    <li>
      <div
        className={cn(
          "group relative flex items-start gap-3 px-3 py-2.5 cursor-pointer",
          "transition-colors hover:bg-paper-2",
          isUnread && "bg-paper-2/40",
        )}
        onClick={() => onChoose(row)}
        role="menuitem"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChoose(row);
          }
        }}
      >
        <span
          aria-hidden
          className={cn(
            "shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-sm",
            "border-[1.5px] border-ink bg-paper",
            TONE_RING[row.tone],
          )}
        >
          <Icon size={13} aria-hidden />
        </span>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            {isUnread ? (
              <span
                aria-hidden
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  TONE_DOT[row.tone],
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
              {row.title}
            </p>
          </div>
          {row.detail ? (
            <p className="font-sans text-[12px] text-muted truncate mt-0.5">
              {row.detail}
            </p>
          ) : null}
          <p className="font-hand text-[10px] uppercase tracking-wider text-muted mt-1">
            {formatRelative(row.at)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(row.id);
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

function EmptyState(): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-10 h-10 border-[1.5px] border-dashed border-ink/40 rounded-sm text-muted"
      >
        <Inbox size={18} aria-hidden />
      </span>
      <p className="font-sans text-[13px] font-semibold text-ink">
        Nothing waiting for you
      </p>
      <p className="font-sans text-[12px] text-muted max-w-[260px]">
        Editor decisions, role-request updates, and your published wins will
        show up here.
      </p>
    </div>
  );
}

function SkeletonRows(): ReactNode {
  return (
    <ul aria-hidden className="p-3 space-y-2">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-start gap-3 p-2 border-[1.5px] border-ink/15 rounded-sm"
        >
          <span className="w-7 h-7 rounded-sm bg-paper-2" />
          <div className="flex-1 space-y-1.5">
            <span className="block h-3 w-3/4 bg-paper-2 rounded-sm" />
            <span className="block h-2.5 w-1/2 bg-paper-2 rounded-sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const now = Date.now();
  const diff = Math.max(0, now - then);
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
