"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Followed categories / "sections you follow" (Updated-plan Phase 4). Local,
 * cross-tab `useSyncExternalStore` store — no backend. Followed sections power
 * the homepage "Following" strip and are structured so a future
 * `/me/follows` endpoint would only change this store.
 */

const STORAGE_KEY = "deligo.reading.follows";
const CAP = 50;

export interface FollowEntry {
  id: string;
  slug: string;
  name: string;
  followedAt: string;
}

/** The minimal category shape needed to follow one. */
export type FollowTarget = Pick<FollowEntry, "id" | "slug" | "name">;

const EMPTY: FollowEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const cb of listeners) cb();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (typeof window !== "undefined") window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", cb);
  };
}

function parse(raw: string | null): FollowEntry[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (v): v is FollowEntry =>
        !!v &&
        typeof v === "object" &&
        typeof (v as FollowEntry).id === "string" &&
        typeof (v as FollowEntry).slug === "string" &&
        typeof (v as FollowEntry).name === "string",
    );
  } catch {
    return EMPTY;
  }
}

let cachedRaw: string | null = null;
let cachedValue: FollowEntry[] = EMPTY;

function getSnapshot(): FollowEntry[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

function getServerSnapshot(): FollowEntry[] {
  return EMPTY;
}

interface UseFollowsResult {
  entries: FollowEntry[];
  slugs: Set<string>;
  ids: Set<string>;
  count: number;
}

export function useFollows(): UseFollowsResult {
  const entries = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const slugs = useMemo(() => new Set(entries.map((e) => e.slug)), [entries]);
  const ids = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);
  return { entries, slugs, ids, count: entries.length };
}

function write(next: FollowEntry[]): void {
  if (typeof window === "undefined") return;
  const serialised = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, serialised);
  cachedRaw = serialised;
  cachedValue = next;
  notify();
}

export function isFollowing(id: string): boolean {
  return getSnapshot().some((e) => e.id === id);
}

/** Toggles and returns the resulting state (`true` = now following). */
export function toggleFollow(target: FollowTarget): boolean {
  const current = getSnapshot();
  if (current.some((e) => e.id === target.id)) {
    write(current.filter((e) => e.id !== target.id));
    return false;
  }
  const next = [
    { ...target, followedAt: new Date().toISOString() },
    ...current,
  ].slice(0, CAP);
  write(next);
  return true;
}

export function clearFollows(): void {
  write(EMPTY);
}
