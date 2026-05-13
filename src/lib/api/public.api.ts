import { apiFetch } from "./client";

/**
 * Phase 1 stub. Each public-API endpoint gets a typed wrapper here. The
 * actual UI consumers land in Phase 3; for now, only the breaking-ticker
 * shell is wired so the Header can render with real data when present.
 */

export interface BreakingArticleDTO {
  id: string;
  headline: string;
  slug: string;
  publishedAt: string | null;
}

export async function listBreaking(): Promise<BreakingArticleDTO[]> {
  try {
    const result = await apiFetch<BreakingArticleDTO[]>("/api/v1/public/breaking", {
      next: { revalidate: 60 },
    });
    return result.data;
  } catch {
    // BreakingTicker tolerates an empty payload — never blocks the header.
    return [];
  }
}
