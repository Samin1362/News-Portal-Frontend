import { apiFetch, ApiError } from "./client";
import type { ArticleOgPayload } from "@/lib/types/article";

export async function getArticleOg(
  slug: string,
): Promise<ArticleOgPayload | null> {
  try {
    const result = await apiFetch<ArticleOgPayload>(
      `/api/v1/public/articles/${encodeURIComponent(slug)}/og`,
      { next: { revalidate: 60 } },
    );
    return result.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    return null;
  }
}
