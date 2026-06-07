"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

// Error boundary for the public reader site (Phase 7). Catches render/data
// failures within the (public) group and offers a retry, keeping the Header /
// Footer (from the group layout) in place.
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public section error:", error);
  }, [error]);

  return (
    <ErrorState
      error={error}
      reset={reset}
      title="This page hit a snag."
      homeHref="/"
    />
  );
}
