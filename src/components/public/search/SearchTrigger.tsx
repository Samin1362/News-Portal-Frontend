"use client";

import { Search } from "lucide-react";
import { useSearch } from "./SearchProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Header search affordance. Two looks, one behaviour — both open the shared
 * palette:
 *   - `button` (desktop): an input-shaped trigger with a ⌘K hint.
 *   - `icon` (mobile): a compact square button matching the hamburger.
 */
export function SearchTrigger({
  variant = "button",
  className,
}: {
  variant?: "button" | "icon";
  className?: string;
}) {
  const { open } = useSearch();

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Search"
        className={cn(
          "inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-sm bg-paper text-ink",
          "hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          className,
        )}
      >
        <Search size={18} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search news"
      className={cn(
        "group flex items-center gap-1.5 h-[30px] w-[220px] px-2 border-[1.5px] border-ink rounded-sm bg-paper text-muted",
        "hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
    >
      <Search size={14} aria-hidden />
      <span className="flex-1 text-left font-hand text-[12px]">Search news…</span>
      <kbd className="font-mono text-[10px] text-muted/80 border border-ink/25 rounded-[3px] px-1 leading-[14px]">
        ⌘K
      </kbd>
    </button>
  );
}
