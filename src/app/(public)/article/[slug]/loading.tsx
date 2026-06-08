import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Route-level skeleton for the article detail page (Phase 5). Mirrors the real
 * two-column layout — breadcrumb, title, hero, body lines + sidebar — so the
 * transition into the published article doesn't shift.
 */
export default function ArticleLoading() {
  return (
    <div className="max-w-[1080px] mx-auto px-6 py-6" aria-busy="true">
      {/* Breadcrumb */}
      <Skeleton className="h-3 w-56" />

      {/* Header */}
      <div className="mt-5 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-2/3 mt-2" />
        <Skeleton className="h-3 w-72 mt-2" />
      </div>

      {/* Hero image */}
      <Skeleton className="mt-6 w-full aspect-[16/9]" />

      {/* Body + sidebar */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-3">
          {/* Varied widths so it reads as prose, not a table. */}
          {["w-full", "w-full", "w-11/12", "w-full", "w-5/6", "w-full", "w-full", "w-10/12", "w-full", "w-2/3"].map(
            (w, i) => (
              <Skeleton key={i} className={`h-4 ${w}`} />
            ),
          )}
        </div>
        <div className="space-y-6">
          <Skeleton className="w-full aspect-[6/5]" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-[80px] h-[60px] shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading article…</span>
    </div>
  );
}
