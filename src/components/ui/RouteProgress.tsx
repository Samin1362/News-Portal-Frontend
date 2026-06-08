"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top route-progress bar (Updated-plan Phase 5). App Router has no global
 * navigation events and `useLinkStatus` is per-Link, so we drive this the way
 * the common App-Router top-loaders do:
 *   - **start** when an in-app `<a>` is clicked (same-origin, left-click, no
 *     modifier/target/download/hash-only), and
 *   - **finish** when the pathname or query actually changes.
 *
 * Reduced-motion users get no trickle animation (the bar simply appears, then
 * completes). Programmatic `router.push` (search palette etc.) is intentionally
 * not intercepted — those routes are prefetched and effectively instant.
 *
 * Must be rendered inside a <Suspense> boundary because it reads
 * `useSearchParams()`.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;

  const [value, setValue] = useState(0);
  const [visible, setVisible] = useState(false);

  const startedRef = useRef(false);
  const prevKeyRef = useRef(key);
  const trickleRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);
  const safetyRef = useRef<number | null>(null);

  // --- timer helpers --------------------------------------------------------
  function clearTrickle() {
    if (trickleRef.current) {
      window.clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
  }
  function clearSafety() {
    if (safetyRef.current) {
      window.clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  }

  function finish() {
    if (!startedRef.current) return;
    startedRef.current = false;
    clearTrickle();
    clearSafety();
    setValue(100);
    hideRef.current = window.setTimeout(() => {
      setVisible(false);
      setValue(0);
    }, 260);
  }

  function start() {
    if (startedRef.current) return;
    startedRef.current = true;
    if (hideRef.current) window.clearTimeout(hideRef.current);
    setVisible(true);

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setValue(80);
    } else {
      setValue(8);
      trickleRef.current = window.setInterval(() => {
        // Ease toward 90% and stall there until navigation completes.
        setValue((v) => (v < 90 ? v + (90 - v) * 0.12 : v));
      }, 220);
    }
    // Safety net: if the click didn't actually navigate, don't hang.
    safetyRef.current = window.setTimeout(() => finish(), 8000);
  }

  // Intercept in-app link clicks to begin the bar.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;

      let dest: URL;
      try {
        dest = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (dest.origin !== window.location.origin) return;
      // Same destination (incl. query) → no navigation.
      const here = window.location.pathname + window.location.search;
      if (dest.pathname + dest.search === here) return;

      start();
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Finish when the route key actually changes (deferred so we don't setState
  // synchronously inside the effect body).
  useEffect(() => {
    if (prevKeyRef.current === key) return;
    prevKeyRef.current = key;
    if (!startedRef.current) return;
    const id = window.setTimeout(() => finish(), 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Tidy up every timer on unmount.
  useEffect(() => {
    return () => {
      clearTrickle();
      clearSafety();
      if (hideRef.current) window.clearTimeout(hideRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[95] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="route-progress-bar h-full bg-accent shadow-[0_0_8px_rgba(200,50,27,0.6)]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
