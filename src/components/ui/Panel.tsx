"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

interface PanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Accessible name for the dialog. */
  label?: string;
  /** Vertical placement of the floating card. */
  align?: "center" | "top";
  className?: string;
}

/**
 * Shared floating overlay primitive (Updated-plan §2.3) used by the search
 * palette and — later — the notification center. Handles the things every
 * overlay needs and easily gets wrong:
 *   - renders into <body> via a portal (escapes transformed ancestors)
 *   - locks body scroll while open
 *   - Escape to close, backdrop click to close
 *   - focus trap (Tab/Shift-Tab cycle inside) + restore focus to the trigger
 *
 * Editorial chrome: 1.5px ink border, paper card, soft drop shadow so it
 * reads as "floating" rather than the flat plate shadow used for hover.
 */
export function Panel({
  open,
  onClose,
  children,
  label,
  align = "center",
  className,
}: PanelProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Remember the trigger + lock scroll; restore focus on close.
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    const card = cardRef.current;
    if (!card) return;
    const first = card.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? card).focus();
  }, [open]);

  // Escape to close + focus trap on Tab.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const card = cardRef.current;
      if (!card) return;
      const nodes = Array.from(
        card.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (nodes.length === 0) {
        e.preventDefault();
        card.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[90] flex justify-center px-4",
        align === "center" ? "items-center" : "items-start pt-[12vh]",
      )}
    >
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 animate-[fadeIn_0.15s_ease-out]"
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-[560px] bg-paper border-[1.5px] border-ink rounded-md outline-none",
          "shadow-soft",
          "animate-[fadeIn_0.15s_ease-out]",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
