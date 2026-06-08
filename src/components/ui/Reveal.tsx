"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Reveal-on-scroll wrapper (Updated-plan §2.2). Renders children with the
 * `.reveal` class and toggles `.is-visible` the first time they enter the
 * viewport, producing a calm fade + rise. Reduced-motion users settle the
 * content in place instantly (handled in `globals.css`).
 *
 * Use only for **below-the-fold** content — never wrap above-the-fold/critical
 * markup, which must paint immediately.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delayMs = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  /** Stagger consecutive reveals by passing increasing delays. */
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer support — reveal on the next tick (deferred so we don't
      // setState synchronously inside the effect body).
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
