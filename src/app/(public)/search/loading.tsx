import { ArticleCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

/**
 * Route-level loading skeleton for the search results page — mirrors the
 * two-column results + sidebar layout so the page doesn't jump on load.
 */
export default function SearchLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div>
        <Skeleton className="h-7 w-44 mb-3" />
        <Skeleton className="h-4 w-32 mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <aside className="space-y-5">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-52 w-full" />
      </aside>
    </div>
  );
}
