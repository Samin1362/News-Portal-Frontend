"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Floating "back to top" control (Phase 3, task 5). Appears once the reader has
 * scrolled past the fold and smoothly returns them to the top — honouring
 * `prefers-reduced-motion` by jumping instantly instead.
 */
export function BackToTop({ showAfter = 600 }: { showAfter?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    function check() {
      frame = 0;
      setVisible(window.scrollY > showAfter);
    }
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(check);
    }
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [showAfter]);

  function toTop() {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-5 right-5 z-[70] inline-flex items-center justify-center w-11 h-11",
        "border-[1.5px] border-ink rounded-full bg-paper text-ink shadow-soft",
        "hover:bg-accent hover:text-paper hover:border-accent transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
      )}
    >
      <ArrowUp size={18} aria-hidden />
    </button>
  );
}
