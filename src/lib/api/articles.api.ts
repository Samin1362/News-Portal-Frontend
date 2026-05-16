import { apiFetch, ApiError } from "./client";
import type { PaginationMeta } from "@/lib/types/api";
import type {
  ArticleCardDTO,
  ArticleFullDTO,
  ArticleMediaItem,
  ArticleSeo,
  ArticleStatus,
  ArticleVideoItem,
} from "@/lib/types/article";

/** Body shape for POST /api/v1/articles. Mirrors backend createArticleBodySchema. */
export interface CreateArticleBody {
  headline: string;
  summary: string;
  content: string;
  categoryId: string;
  tags?: string[];
  featuredImage?: ArticleMediaItem | null;
  gallery?: ArticleMediaItem[];
  videos?: ArticleVideoItem[];
  seo?: Partial<ArticleSeo>;
  isCommentsEnabled?: boolean;
}

/** Body shape for PATCH /api/v1/articles/:id. Same fields, all optional. */
export type UpdateArticleBody = Partial<CreateArticleBody>;

export interface PaginatedArticleCards {
  items: ArticleCardDTO[];
  meta?: PaginationMeta;
}

export interface ListMineQuery {
  status?: ArticleStatus;
  page?: number;
  limit?: number;
}

function qs(query: ListMineQuery): string {
  const parts: string[] = [];
  if (query.status) parts.push(`status=${encodeURIComponent(query.status)}`);
  if (query.page) parts.push(`page=${query.page}`);
  if (query.limit) parts.push(`limit=${query.limit}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export async function listMine(
  query: ListMineQuery,
  token: string,
): Promise<PaginatedArticleCards> {
  const result = await apiFetch<ArticleCardDTO[]>(
    `/api/v1/articles/me${qs(query)}`,
    { token, cache: "no-store" },
  );
  return { items: result.data, meta: result.meta };
}

export async function getById(
  id: string,
  token: string,
): Promise<ArticleFullDTO | null> {
  try {
    const result = await apiFetch<ArticleFullDTO>(
      `/api/v1/articles/${encodeURIComponent(id)}`,
      { token, cache: "no-store" },
    );
    return result.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createArticle(
  body: CreateArticleBody,
  token: string,
): Promise<ArticleFullDTO> {
  const result = await apiFetch<ArticleFullDTO>("/api/v1/articles", {
    method: "POST",
    body,
    token,
    cache: "no-store",
  });
  return result.data;
}

export async function updateArticle(
  id: string,
  body: UpdateArticleBody,
  token: string,
): Promise<ArticleFullDTO> {
  const result = await apiFetch<ArticleFullDTO>(
    `/api/v1/articles/${encodeURIComponent(id)}`,
    { method: "PATCH", body, token, cache: "no-store" },
  );
  return result.data;
}

export async function deleteArticle(id: string, token: string): Promise<void> {
  await apiFetch<unknown>(`/api/v1/articles/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
    cache: "no-store",
  });
}

/** POST /api/v1/articles/:id/submit — flips draft|rejected → submitted. */
export async function submitArticle(
  id: string,
  token: string,
): Promise<ArticleFullDTO> {
  const result = await apiFetch<ArticleFullDTO>(
    `/api/v1/articles/${encodeURIComponent(id)}/submit`,
    { method: "POST", token, cache: "no-store" },
  );
  return result.data;
}
