import { apiFetch } from "./client";
import type { PaginationMeta } from "@/lib/types/api";
import type {
  ArticleSuggestionDTO,
  SearchResultDTO,
} from "@/lib/types/article";

export interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  authorId?: string;
  from?: string;
  to?: string;
}

function buildSearchUrl(input: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("q", input.q);
  if (input.page) params.set("page", String(input.page));
  if (input.limit) params.set("limit", String(input.limit));
  if (input.categoryId) params.set("categoryId", input.categoryId);
  if (input.authorId) params.set("authorId", input.authorId);
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  return `/api/v1/public/search?${params.toString()}`;
}

export async function searchArticles(
  input: SearchQuery,
): Promise<{ data: SearchResultDTO; meta?: PaginationMeta }> {
  const result = await apiFetch<SearchResultDTO>(buildSearchUrl(input), {
    cache: "no-store",
  });
  return { data: result.data, meta: result.meta };
}

export async function suggestArticles(
  q: string,
  signal?: AbortSignal,
): Promise<ArticleSuggestionDTO[]> {
  if (q.trim().length < 2) return [];
  try {
    const result = await apiFetch<ArticleSuggestionDTO[]>(
      `/api/v1/public/search/suggest?q=${encodeURIComponent(q)}`,
      { cache: "no-store", signal },
    );
    return result.data;
  } catch {
    return [];
  }
}
