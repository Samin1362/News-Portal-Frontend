"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listMine } from "@/lib/api/articles.api";

const JOURNALIST_ROLES = ["journalist", "editor", "admin"] as const;

export interface JournalistCounts {
  draft: number;
  review: number;
  published: number;
  rejected: number;
}

/**
 * Aggregates per-status counts for the signed-in journalist by hitting
 * `GET /articles/me?status=` with `limit=1` per slot and reading
 * `meta.total`. Cached for 30s and shared across the sidebar badge,
 * overview KPIs, and bottom-tab dot.
 */
export function useJournalistCounts() {
  const { role, profile, getIdToken } = useAuth();
  const enabled =
    role !== null && (JOURNALIST_ROLES as readonly string[]).includes(role);

  const query = useQuery({
    enabled,
    queryKey: ["journalist", "counts", profile?.id],
    queryFn: async (): Promise<JournalistCounts> => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      const [drafts, submitted, underReview, published, rejected] =
        await Promise.all([
          listMine({ status: "draft", limit: 1 }, token),
          listMine({ status: "submitted", limit: 1 }, token),
          listMine({ status: "under_review", limit: 1 }, token),
          listMine({ status: "published", limit: 1 }, token),
          listMine({ status: "rejected", limit: 1 }, token),
        ]);
      return {
        draft: drafts.meta?.total ?? 0,
        review:
          (submitted.meta?.total ?? 0) + (underReview.meta?.total ?? 0),
        published: published.meta?.total ?? 0,
        rejected: rejected.meta?.total ?? 0,
      };
    },
    staleTime: 30_000,
  });

  return {
    counts: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
