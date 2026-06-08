import { Skeleton, ArticleCardSkeleton } from "@/components/ui/Skeleton";

/**
 * Route-level skeleton for a category page (Phase 5). Mirrors the banner +
 * two-column grid/sidebar so it doesn't shift into the loaded layout.
 */
export default function CategoryLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-6" aria-busy="true">
      {/* Banner */}
      <div className="border-[1.5px] border-ink rounded-sm overflow-hidden">
        <Skeleton className="w-full h-[120px] rounded-none" />
        <div className="px-5 py-4 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <Skeleton className="h-5 w-28 mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="w-full aspect-[6/5]" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading category…</span>
    </div>
  );
}
