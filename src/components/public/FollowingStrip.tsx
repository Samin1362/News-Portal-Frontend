"use client";

import { useQuery } from "@tanstack/react-query";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArticleCard } from "@/components/public/ArticleCard";
import { getCategoryArticles } from "@/lib/api/public.api";
import { listCategories } from "@/lib/api/categories.api";
import { useFollows } from "@/lib/reading/followsStore";
import type { ArticleCardDTO } from "@/lib/types/article";

const MAX_CATS = 4;
const PER_CAT = 4;
const MAX_ITEMS = 8;

function articleTime(a: ArticleCardDTO): string {
  return a.publishedAt ?? a.createdAt;
}

/**
 * "Following" strip on the homepage (Phase 4) — fresh stories from the sections
 * a returning reader follows. Personalised + client-only: renders nothing when
 * the reader follows no sections (or those sections have no stories), so it
 * never adds a phantom gap for first-time visitors.
 */
export function FollowingStrip() {
  const { entries } = useFollows();
  const slice = entries.slice(0, MAX_CATS);
  const slugs = slice.map((e) => e.slug);
  const enabled = slugs.length > 0;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories().catch(() => []),
    staleTime: 5 * 60_000,
    enabled,
  });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const { data: articles = [] } = useQuery({
    queryKey: ["following-articles", slugs],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const lists = await Promise.all(
        slice.map((e) =>
          getCategoryArticles(e.slug, 1, PER_CAT)
            .then((r) => r.payload?.articles ?? [])
            .catch(() => []),
        ),
      );
      const seen = new Set<string>();
      const out: ArticleCardDTO[] = [];
      for (const a of lists.flat()) {
        if (seen.has(a.id)) continue;
        seen.add(a.id);
        out.push(a);
      }
      out.sort((a, b) => (articleTime(a) < articleTime(b) ? 1 : -1));
      return out.slice(0, MAX_ITEMS);
    },
  });

  if (!enabled || articles.length === 0) return null;

  return (
    <section>
      <SectionTitle>Following</SectionTitle>
      <p className="-mt-1 mb-3 font-hand text-[11px] text-muted">
        From sections you follow: {slice.map((e) => e.name).join(" · ")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {articles.map((a) => (
          <ArticleCard
            key={a.id}
            article={a}
            variant="small"
            categoryById={categoryById}
            showSummary={false}
          />
        ))}
      </div>
    </section>
  );
}
