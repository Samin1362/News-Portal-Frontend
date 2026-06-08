"use client";

import { Bell } from "lucide-react";
import { useReaderNotificationsUI } from "./NotificationsProvider";
import { unreadBadgeLabel } from "./NotificationPanel";
import { cn } from "@/lib/utils/cn";

/**
 * Header notification affordance. Two looks, one behaviour — both open the
 * shared reader panel and surface the live unread badge:
 *   - `button` (desktop): a plain inline bell matching the masthead actions.
 *   - `icon` (mobile): a bordered square matching the search icon + hamburger.
 */
export function NotificationBell({
  variant = "button",
  className,
}: {
  variant?: "button" | "icon";
  className?: string;
}) {
  const { open, unreadCount, hasItems } = useReaderNotificationsUI();
  const badge = unreadBadgeLabel(unreadCount);

  const label =
    unreadCount > 0 ? `Notifications (${unreadCount} new)` : "Notifications";

  const indicator = hasItems ? (
    <span
      aria-hidden
      className="absolute -top-1 -right-1 inline-flex items-center justify-center pointer-events-none"
    >
      {badge ? (
        <span
          className={cn(
            "min-w-[18px] h-[18px] px-1 rounded-full border-[1.5px] border-paper",
            "bg-accent text-paper font-mono text-[10px] font-bold leading-none",
            "flex items-center justify-center shadow-[1px_1px_0_var(--color-ink)]",
          )}
        >
          {badge}
        </span>
      ) : (
        <span className="w-2.5 h-2.5 rounded-full bg-accent-2 border-[1.5px] border-paper" />
      )}
    </span>
  ) : null;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={label}
        aria-haspopup="dialog"
        className={cn(
          "relative inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-sm bg-paper text-ink",
          "hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          className,
        )}
      >
        <Bell size={18} aria-hidden />
        {indicator}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      aria-haspopup="dialog"
      className={cn(
        "relative text-ink hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm",
        className,
      )}
    >
      <Bell size={18} aria-hidden />
      {indicator}
    </button>
  );
}
