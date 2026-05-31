"use client";

import { useSyncExternalStore } from "react";

/**
 * Persisted desktop sidebar preference: collapsed rail vs. full drawer.
 * Mirrors the admin portal's `useStoredDrawerExpanded` so the two shells
 * feel like one product. SSR-safe: server snapshot returns DEFAULT.
 */

const STORAGE_KEY = "journalist.drawer.expanded";
const DEFAULT: boolean = false;

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

let cachedRaw: string | null = null;
let cachedValue: boolean = DEFAULT;

function getSnapshot(): boolean {
  if (typeof window === "undefined") return DEFAULT;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (raw === "true") cachedValue = true;
  else if (raw === "false") cachedValue = false;
  else cachedValue = DEFAULT;
  return cachedValue;
}

function getServerSnapshot(): boolean {
  return DEFAULT;
}

export function useStoredNavExpanded(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function writeStoredNavExpanded(value: boolean): void {
  if (typeof window === "undefined") return;
  const serialised = String(value);
  window.localStorage.setItem(STORAGE_KEY, serialised);
  cachedRaw = serialised;
  cachedValue = value;
  notify();
}
