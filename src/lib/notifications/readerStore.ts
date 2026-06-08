"use client";

import { useSyncExternalStore } from "react";

/**
 * Persistent state for the reader's notification bell. A deliberate mirror of
 * the journalist store (`lib/notifications/store.ts`) so the two bells behave
 * identically and share the same mental model:
 *   - `lastReadAt`: ISO timestamp set by "Mark all read" (or first open);
 *     any synthesised item newer than this counts as unread.
 *   - `dismissed`: stable ids the reader has swept out of the panel.
 *     Auto-trimmed at 200 so localStorage doesn't bloat.
 *
 * No backend: the reader feed is synthesised client-side from the public
 * breaking/homepage endpoints (see `hooks/useReaderNotifications.ts`). When a
 * real `/me/notifications` collection lands, only the hook changes — this
 * read/dismiss state stays.
 */

const STORAGE_KEY = "deligo.reader.notifications.state";
const DISMISSED_CAP = 200;

interface PersistedState {
  lastReadAt: string | null;
  dismissed: string[];
}

const DEFAULT_STATE: PersistedState = {
  lastReadAt: null,
  dismissed: [],
};

const listeners = new Set<() => void>();

function notify() {
  for (const cb of listeners) cb();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", cb);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", cb);
    }
  };
}

function parse(raw: string | null): PersistedState {
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
    const obj = parsed as Record<string, unknown>;
    const lastReadAt =
      typeof obj.lastReadAt === "string" ? obj.lastReadAt : null;
    const dismissed = Array.isArray(obj.dismissed)
      ? obj.dismissed.filter((v): v is string => typeof v === "string")
      : [];
    return { lastReadAt, dismissed };
  } catch {
    return DEFAULT_STATE;
  }
}

let cachedRaw: string | null = null;
let cachedValue: PersistedState = DEFAULT_STATE;

function getSnapshot(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

function getServerSnapshot(): PersistedState {
  return DEFAULT_STATE;
}

export function useReaderNotificationPrefs(): PersistedState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function write(next: PersistedState): void {
  if (typeof window === "undefined") return;
  const serialised = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, serialised);
  cachedRaw = serialised;
  cachedValue = next;
  notify();
}

export function markAllReaderRead(): void {
  const current = getSnapshot();
  write({ ...current, lastReadAt: new Date().toISOString() });
}

export function addReaderDismissed(id: string): void {
  const current = getSnapshot();
  if (current.dismissed.includes(id)) return;
  const next = [id, ...current.dismissed];
  const trimmed =
    next.length > DISMISSED_CAP ? next.slice(0, DISMISSED_CAP) : next;
  write({ ...current, dismissed: trimmed });
}

/** Wipes read + dismissed history so every synthesised event resurfaces. */
export function clearReaderNotificationState(): void {
  write({ ...DEFAULT_STATE });
}
