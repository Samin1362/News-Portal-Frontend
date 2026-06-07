import { Skeleton, CardGridSkeleton } from "@/components/ui/Skeleton";

// Loading skeleton for public pages (Phase 7). The Header/Footer come from the
// group layout and stay put; this fills the main area with a hero + grid
// placeholder while the server component streams in.
export default function PublicLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-[280px] w-full mb-6" />
      <CardGridSkeleton count={6} />
    </div>
  );
}
