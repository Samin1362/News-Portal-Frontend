"use client";

import { useEffect } from "react";

export interface Hotkey {
  /** The key to match, case-insensitive (e.g. "k", "/"). */
  key: string;
  /** Require ⌘ (Cmd) to be held. */
  meta?: boolean;
  /** Require Ctrl to be held. */
  ctrl?: boolean;
  /** Fire even when focus is inside a text field. Default false. */
  allowInField?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function matches(e: KeyboardEvent, h: Hotkey): boolean {
  if (e.key.toLowerCase() !== h.key.toLowerCase()) return false;
  if (h.meta) return e.metaKey;
  if (h.ctrl) return e.ctrlKey;
  // A plain key — must not be part of a modifier chord.
  return !e.metaKey && !e.ctrlKey && !e.altKey;
}

/**
 * Register global keyboard shortcuts. Pass a **stable** `hotkeys` array
 * (module constant) and a **stable** `onMatch` (useCallback) so the listener
 * isn't re-bound every render. By default a hotkey is ignored while the user
 * is typing in a field; set `allowInField` per hotkey to override (e.g. ⌘K).
 */
export function useHotkey(
  hotkeys: Hotkey[],
  onMatch: (e: KeyboardEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      for (const h of hotkeys) {
        if (!matches(e, h)) continue;
        if (!h.allowInField && isEditableTarget(e.target)) return;
        onMatch(e);
        return;
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkeys, onMatch, enabled]);
}
