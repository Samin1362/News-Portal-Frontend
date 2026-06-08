"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useReaderNotifications } from "@/hooks/useReaderNotifications";
import {
  NotificationPanel,
  type NotificationFeedItem,
} from "./NotificationPanel";

/**
 * Mounts a single reader notification panel for the whole header subtree and
 * exposes `useReaderNotificationsUI()` to every bell trigger. One provider ⇒
 * one overlay ⇒ one synthesised feed (react-query dedupes the fetch), so the
 * desktop and mobile bells stay in lockstep — same badge, same panel. Mirrors
 * the `SearchProvider` architecture from Phase 1.
 */

interface NotificationsContextValue {
  open: () => void;
  unreadCount: number;
  hasItems: boolean;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    items,
    groups,
    unreadCount,
    isLoading,
    lastReadAt,
    markAllRead,
    dismiss,
  } = useReaderNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const choose = useCallback(
    (item: NotificationFeedItem) => {
      setIsOpen(false);
      router.push(item.href);
    },
    [router],
  );

  return (
    <NotificationsContext.Provider
      value={{ open, unreadCount, hasItems: items.length > 0 }}
    >
      {children}
      <NotificationPanel
        open={isOpen}
        onClose={close}
        items={items}
        groups={groups}
        isLoading={isLoading}
        unreadCount={unreadCount}
        lastReadAt={lastReadAt}
        onChoose={choose}
        onDismiss={dismiss}
        onMarkAllRead={markAllRead}
      />
    </NotificationsContext.Provider>
  );
}

export function useReaderNotificationsUI(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useReaderNotificationsUI must be used inside <NotificationsProvider>",
    );
  }
  return ctx;
}
