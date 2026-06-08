"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "@/lib/ui/toast";
import { toggleBookmark, useBookmarks } from "@/lib/reading/bookmarksStore";
import type { ArticleCardDTO } from "@/lib/types/article";
import { cn } from "@/lib/utils/cn";

/**
 * Save / unsave an article to the reader's local reading list (Phase 4).
 * Optimistic by nature — the localStorage store updates synchronously and every
 * mounted button re-renders via `useSyncExternalStore`. Two looks:
 *   - `overlay` (on a card image corner): a compact paper chip.
 *   - `inline` (article page / reading list): a bordered button with a label.
 */
export function BookmarkButton({
  article,
  variant = "overlay",
  className,
}: {
  article: ArticleCardDTO;
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const { ids } = useBookmarks();
  const toast = useToast();
  const saved = ids.has(article.id);
  const Icon = saved ? BookmarkCheck : Bookmark;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleBookmark(article);
    if (nowSaved) toast.success("Saved to your reading list");
    else toast.info("Removed from your reading list");
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from reading list" : "Save to reading list"}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 h-[32px] border-[1.5px] rounded-sm font-hand text-[12px] uppercase tracking-wider transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          saved
            ? "border-accent-2 bg-accent-2 text-paper"
            : "border-ink bg-paper text-ink hover:bg-paper-2",
          className,
        )}
      >
        <Icon size={14} aria-hidden />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from reading list" : "Save to reading list"}
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full border-[1.5px] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        saved
          ? "border-accent-2 bg-accent-2 text-paper"
          : "border-ink bg-paper/90 text-ink hover:bg-paper",
        className,
      )}
    >
      <Icon size={15} aria-hidden />
    </button>
  );
}
