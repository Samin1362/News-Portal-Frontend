import { apiFetch, ApiError } from "./client";
import type { PaginationMeta } from "@/lib/types/api";
import type {
  ArticleCardDTO,
  CategoryArticlesDTO,
  HomepageDTO,
  PublicArticleResponseDTO,
  TagArticlesDTO,
} from "@/lib/types/article";

export interface PaginatedArticles {
  items: ArticleCardDTO[];
  meta?: PaginationMeta;
}

export async function getHomepage(): Promise<HomepageDTO | null> {
  try {
    const result = await apiFetch<HomepageDTO>("/api/v1/public/homepage", {
      next: { revalidate: 30 },
    });
    return result.data;
  } catch {
    return null;
  }
}

export async function getBreaking(limit = 10): Promise<ArticleCardDTO[]> {
  try {
    const result = await apiFetch<ArticleCardDTO[]>(
      `/api/v1/public/breaking?limit=${limit}`,
      { next: { revalidate: 60 } },
    );
    return result.data;
  } catch {
    return [];
  }
}

export async function getTrending(
  page = 1,
  limit = 12,
): Promise<PaginatedArticles> {
  const result = await apiFetch<ArticleCardDTO[]>(
    `/api/v1/public/trending?page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } },
  );
  return { items: result.data, meta: result.meta };
}

export async function getVideos(
  page = 1,
  limit = 12,
): Promise<PaginatedArticles> {
  const result = await apiFetch<ArticleCardDTO[]>(
    `/api/v1/public/videos?page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } },
  );
  return { items: result.data, meta: result.meta };
}

export async function getGallery(
  page = 1,
  limit = 24,
): Promise<PaginatedArticles> {
  const result = await apiFetch<ArticleCardDTO[]>(
    `/api/v1/public/gallery?page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } },
  );
  return { items: result.data, meta: result.meta };
}

export async function getCategoryArticles(
  slug: string,
  page = 1,
  limit = 12,
): Promise<{ payload: CategoryArticlesDTO | null; meta?: PaginationMeta }> {
  try {
    const result = await apiFetch<CategoryArticlesDTO>(
      `/api/v1/public/categories/${encodeURIComponent(slug)}/articles?page=${page}&limit=${limit}`,
      { next: { revalidate: 60 } },
    );
    return { payload: result.data, meta: result.meta };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { payload: null };
    }
    throw err;
  }
}

export async function getArticleBySlug(
  slug: string,
): Promise<PublicArticleResponseDTO | null> {
  try {
    const result = await apiFetch<PublicArticleResponseDTO>(
      `/api/v1/public/articles/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    return result.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getByTag(
  slug: string,
  page = 1,
  limit = 12,
): Promise<{ payload: TagArticlesDTO | null; meta?: PaginationMeta }> {
  try {
    const result = await apiFetch<TagArticlesDTO>(
      `/api/v1/public/tags/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`,
      { next: { revalidate: 60 } },
    );
    return { payload: result.data, meta: result.meta };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { payload: null };
    }
    throw err;
  }
}

export async function getByAuthor(
  id: string,
  page = 1,
  limit = 12,
): Promise<{ items: ArticleCardDTO[]; meta?: PaginationMeta } | null> {
  try {
    const result = await apiFetch<ArticleCardDTO[]>(
      `/api/v1/public/authors/${encodeURIComponent(id)}?page=${page}&limit=${limit}`,
      { next: { revalidate: 60 } },
    );
    return { items: result.data, meta: result.meta };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
