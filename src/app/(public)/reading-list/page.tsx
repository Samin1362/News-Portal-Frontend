"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookmarkX, Trash2 } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { Btn } from "@/components/ui/Btn";
import { ArticleCard } from "@/components/public/ArticleCard";
import { listCategories } from "@/lib/api/categories.api";
import { clearBookmarks, useBookmarks } from "@/lib/reading/bookmarksStore";
import { useToast } from "@/lib/ui/toast";

/**
 * The reader's saved articles (Phase 4). Reads entirely from the local
 * bookmarks store — no backend — and enriches cards with category names from
 * the (cached) categories endpoint. Removing the last item drops straight to
 * the empty state via the store's `useSyncExternalStore` reactivity.
 */
export default function ReadingListPage() {
  const { entries, count } = useBookmarks();
  const toast = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories().catch(() => []),
    staleTime: 5 * 60_000,
  });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  function onClear() {
    clearBookmarks();
    toast.info("Reading list cleared");
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <SectionTitle className="mb-1">Reading list</SectionTitle>
          <p className="font-hand text-[12px] text-muted">
            {count > 0
              ? `${count} saved ${count === 1 ? "story" : "stories"} · stored on this device`
              : "Stories you save are kept on this device."}
          </p>
        </div>
        {count > 0 ? (
          <Btn variant="ghost" size="sm" onClick={onClear}>
            <Trash2 size={13} aria-hidden />
            Clear all
          </Btn>
        ) : null}
      </div>

      <div className="mt-6">
        {count === 0 ? (
          <EmptyState
            icon={<BookmarkX size={28} aria-hidden />}
            title="Nothing saved yet"
            description="Tap the bookmark on any story to keep it here for later. Your reading list lives on this device — no account needed."
            action={
              <Link href="/">
                <Btn variant="primary" size="md">
                  Browse the latest
                </Btn>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((e) => (
              <ArticleCard
                key={e.article.id}
                article={e.article}
                variant="medium"
                categoryById={categoryById}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
