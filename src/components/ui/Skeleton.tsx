import { cn } from "@/lib/utils/cn";

/**
 * Skeleton bone (Phase 7). A single muted, pulsing block — compose these to
 * mirror the shape of whatever's loading. Uses the editorial paper-2 tone so
 * placeholders read as "loading", not "broken".
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-paper-2 rounded-sm animate-pulse", className)}
    />
  );
}

/** A skeleton standing in for an ArticleCard (used in list/grid loaders). */
export function ArticleCardSkeleton() {
  return (
    <div className="border-[1.5px] border-ink rounded-sm overflow-hidden">
      <Skeleton className="w-full aspect-[16/9] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** A grid of card skeletons — drop into a route-group `loading.tsx`. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** A stack of row skeletons — for tables / lists. */
export function RowListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
