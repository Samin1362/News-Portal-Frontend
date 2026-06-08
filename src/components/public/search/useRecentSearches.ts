"use client";

import { useSyncExternalStore } from "react";

/**
 * Persisted "recent searches" for the search palette (last 6, most-recent
 * first). Same `useSyncExternalStore` + localStorage pattern as the dashboard
 * notification store, so it stays in sync across tabs and palette instances
 * without a backend.
 */

const STORAGE_KEY = "deligo.recent-searches";
const CAP = 6;
const MIN = 2;

const EMPTY: string[] = [];
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

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed
      .filter((v): v is string => typeof v === "string")
      .slice(0, CAP);
  } catch {
    return EMPTY;
  }
}

let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

function getSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

export function useRecentSearches(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function write(next: string[]): void {
  if (typeof window === "undefined") return;
  const serialised = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, serialised);
  cachedRaw = serialised;
  cachedValue = next;
  notify();
}

export function addRecentSearch(term: string): void {
  const t = term.trim();
  if (t.length < MIN) return;
  const current = getSnapshot();
  const deduped = [
    t,
    ...current.filter((x) => x.toLowerCase() !== t.toLowerCase()),
  ];
  write(deduped.slice(0, CAP));
}

export function removeRecentSearch(term: string): void {
  const current = getSnapshot();
  const next = current.filter((x) => x !== term);
  if (next.length !== current.length) write(next);
}

export function clearRecentSearches(): void {
  write(EMPTY);
}
