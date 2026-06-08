"use client";

import { useEffect, useState } from "react";

/**
 * Thin top progress bar showing how far the reader has scrolled through the
 * page (Updated-plan §2.2 / Phase 3, task 5). Fixed to the viewport top, drawn
 * in the editorial accent. Updates are rAF-throttled; the fill width rides an
 * inline `--progress` custom prop consumed by `.reading-progress-bar`.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    function compute() {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct =
        scrollable > 0 ? Math.min(100, (doc.scrollTop / scrollable) * 100) : 0;
      setProgress(pct);
    }
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    }
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[80] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="reading-progress-bar h-full bg-accent"
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
      />
    </div>
  );
}
