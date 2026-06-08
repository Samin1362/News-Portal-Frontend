"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import type { ArticleCardDTO } from "@/lib/types/article";

/**
 * Reader bookmarks / "reading list" (Updated-plan Phase 4). Same
 * `useSyncExternalStore` + `localStorage` pattern as the notification stores,
 * so saves sync across tabs and every BookmarkButton stays in lockstep without
 * a backend. We persist the whole `ArticleCardDTO` snapshot so the reading-list
 * page can render saved cards offline (no per-id refetch); a future
 * `/me/bookmarks` endpoint would only change this store, not the UI.
 */

const STORAGE_KEY = "deligo.reading.bookmarks";
const CAP = 100;

export interface BookmarkEntry {
  savedAt: string;
  article: ArticleCardDTO;
}

const EMPTY: BookmarkEntry[] = [];
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

function parse(raw: string | null): BookmarkEntry[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (v): v is BookmarkEntry =>
        !!v &&
        typeof v === "object" &&
        typeof (v as BookmarkEntry).savedAt === "string" &&
        !!(v as BookmarkEntry).article &&
        typeof (v as BookmarkEntry).article.id === "string",
    );
  } catch {
    return EMPTY;
  }
}

let cachedRaw: string | null = null;
let cachedValue: BookmarkEntry[] = EMPTY;

function getSnapshot(): BookmarkEntry[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

function getServerSnapshot(): BookmarkEntry[] {
  return EMPTY;
}

interface UseBookmarksResult {
  entries: BookmarkEntry[];
  ids: Set<string>;
  count: number;
}

export function useBookmarks(): UseBookmarksResult {
  const entries = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const ids = useMemo(
    () => new Set(entries.map((e) => e.article.id)),
    [entries],
  );
  return { entries, ids, count: entries.length };
}

function write(next: BookmarkEntry[]): void {
  if (typeof window === "undefined") return;
  const serialised = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, serialised);
  cachedRaw = serialised;
  cachedValue = next;
  notify();
}

export function isBookmarked(id: string): boolean {
  return getSnapshot().some((e) => e.article.id === id);
}

export function addBookmark(article: ArticleCardDTO): void {
  const current = getSnapshot();
  if (current.some((e) => e.article.id === article.id)) return;
  const next = [
    { savedAt: new Date().toISOString(), article },
    ...current,
  ].slice(0, CAP);
  write(next);
}

export function removeBookmark(id: string): void {
  const current = getSnapshot();
  const next = current.filter((e) => e.article.id !== id);
  if (next.length !== current.length) write(next);
}

/** Toggles and returns the resulting saved-state (`true` = now saved). */
export function toggleBookmark(article: ArticleCardDTO): boolean {
  if (isBookmarked(article.id)) {
    removeBookmark(article.id);
    return false;
  }
  addBookmark(article);
  return true;
}

export function clearBookmarks(): void {
  write(EMPTY);
}
