"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { SearchPalette } from "./SearchPalette";
import { useHotkey, type Hotkey } from "@/lib/hooks/useHotkey";

/**
 * Mounts a single search palette for the whole public site and exposes
 * `useSearch().open()` to any header trigger. Centralising it here means there
 * is exactly one overlay (not one per trigger) and the ⌘K / `/` hotkeys are
 * registered once.
 */

const HOTKEYS: Hotkey[] = [
  { key: "k", meta: true, allowInField: true },
  { key: "k", ctrl: true, allowInField: true },
  { key: "/" },
];

interface SearchContextValue {
  open: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const onHotkey = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setIsOpen(true);
  }, []);
  useHotkey(HOTKEYS, onHotkey);

  return (
    <SearchContext.Provider value={{ open }}>
      {children}
      <SearchPalette open={isOpen} onClose={close} />
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used inside <SearchProvider>");
  }
  return ctx;
}
