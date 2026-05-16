import { apiFetch, ApiError, type ApiFetchOptions } from "./client";
import type { PaginationMeta } from "@/lib/types/api";
import type {
  CommentDTO,
  CommentWithRepliesDTO,
} from "@/lib/types/comment";

/**
 * Phase 4 — Engagement
 *
 * Thin typed wrappers over the backend comment routes. All read calls accept
 * an optional token so the backend can populate `hasLiked` for signed-in
 * readers. Write calls require a token.
 */

export interface PaginatedComments {
  items: CommentWithRepliesDTO[];
  meta?: PaginationMeta;
}

export interface PaginatedReplies {
  items: CommentDTO[];
  meta?: PaginationMeta;
}

type AuthedOpts = Pick<ApiFetchOptions, "token" | "signal">;

export async function listComments(
  articleId: string,
  page = 1,
  limit = 20,
  opts: AuthedOpts = {},
): Promise<PaginatedComments> {
  const result = await apiFetch<CommentWithRepliesDTO[]>(
    `/api/v1/articles/${encodeURIComponent(articleId)}/comments?page=${page}&limit=${limit}`,
    { cache: "no-store", ...opts },
  );
  return { items: result.data, meta: result.meta };
}

export async function listReplies(
  commentId: string,
  page = 1,
  limit = 10,
  opts: AuthedOpts = {},
): Promise<PaginatedReplies> {
  const result = await apiFetch<CommentDTO[]>(
    `/api/v1/comments/${encodeURIComponent(commentId)}/replies?page=${page}&limit=${limit}`,
    { cache: "no-store", ...opts },
  );
  return { items: result.data, meta: result.meta };
}

export async function postComment(
  articleId: string,
  content: string,
  token: string,
): Promise<CommentDTO> {
  const result = await apiFetch<CommentDTO>(
    `/api/v1/articles/${encodeURIComponent(articleId)}/comments`,
    { method: "POST", body: { content }, token, cache: "no-store" },
  );
  return result.data;
}

export async function postReply(
  parentId: string,
  content: string,
  token: string,
): Promise<CommentDTO> {
  const result = await apiFetch<CommentDTO>(
    `/api/v1/comments/${encodeURIComponent(parentId)}/replies`,
    { method: "POST", body: { content }, token, cache: "no-store" },
  );
  return result.data;
}

export async function toggleLike(
  commentId: string,
  token: string,
): Promise<CommentDTO> {
  const result = await apiFetch<CommentDTO>(
    `/api/v1/comments/${encodeURIComponent(commentId)}/like`,
    { method: "POST", token, cache: "no-store" },
  );
  return result.data;
}

export async function reportComment(
  commentId: string,
  reason: string,
  token: string,
): Promise<void> {
  await apiFetch<{ reported: true }>(
    `/api/v1/comments/${encodeURIComponent(commentId)}/report`,
    { method: "POST", body: { reason }, token, cache: "no-store" },
  );
}

export async function deleteComment(
  commentId: string,
  token: string,
): Promise<void> {
  await apiFetch<unknown>(
    `/api/v1/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE", token, cache: "no-store" },
  );
}

/** Re-exported so consumers can `catch (err) { if (err instanceof ApiError) }` without a second import. */
export { ApiError };
