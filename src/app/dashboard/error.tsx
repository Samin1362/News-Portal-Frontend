"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

// Error boundary for the journalist dashboard (Phase 7). Keeps the sidebar /
// topbar shell intact and lets the user retry the failed view.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <ErrorState
      error={error}
      reset={reset}
      title="This view couldn't load."
      homeHref="/dashboard"
    />
  );
}
