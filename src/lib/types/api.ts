/**
 * Mirrors the backend's response envelope (see `backend/src/types/api.ts`).
 * Every successful call returns `{ success: true, data: T, message?, meta? }`;
 * every error returns `{ success: false, message, code, details? }`.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export type ApiErrorCode =
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "INTERNAL_ERROR"
  | "VALIDATION_ERROR";

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  code: ApiErrorCode;
  details?: unknown;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorEnvelope;

export interface ApiResult<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}
