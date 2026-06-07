import { Skeleton, RowListSkeleton } from "@/components/ui/Skeleton";

// Loading skeleton for the dashboard (Phase 7). The sidebar/topbar shell comes
// from the dashboard layout; this fills the content area while data loads.
export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <RowListSkeleton count={5} />
    </div>
  );
}
