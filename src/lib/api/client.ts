import type {
  ApiEnvelope,
  ApiErrorCode,
  ApiResult,
} from "../types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

if (!BASE_URL && typeof window !== "undefined") {
  // Warn in the browser when the env var is missing — server crashes hard
  // via Zod-validated env on the backend side; here we surface the misconfig
  // without bringing the whole app down.
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set");
}

/**
 * Typed error thrown by `apiFetch` whenever the backend returns a
 * `{ success: false }` envelope or the response isn't valid JSON.
 *
 * The `code` matches the backend's `AppError.code` so callers can branch
 * (e.g. `if (err.code === "UNAUTHORIZED") redirect to login`).
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode = "INTERNAL_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON body. Will be stringified and Content-Type set automatically. */
  body?: unknown;
  /** Optional Firebase ID token. Phase 2 wires this in via AuthProvider. */
  token?: string | null;
  /** Override the base URL (useful for tests). */
  baseUrl?: string;
}

function buildUrl(path: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const trimmedBase = baseUrl.replace(/\/$/, "");
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

/**
 * Calls the backend, unwraps the envelope, and throws a typed `ApiError`
 * on any non-success. Returns `{ data, meta?, message? }`.
 *
 * Phase 1: token injection accepts an explicit `token` argument (default
 * `undefined`). Phase 2 wraps this with the `AuthProvider`-aware client
 * that pulls the Firebase ID token automatically.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<ApiResult<T>> {
  const { body, token, baseUrl, headers, ...rest } = options;
  const url = buildUrl(path, baseUrl ?? BASE_URL);

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0,
      "INTERNAL_ERROR",
    );
  }

  let parsed: ApiEnvelope<T> | null = null;
  try {
    parsed = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // No JSON body — surface a synthetic error envelope.
    if (response.ok) {
      return { data: undefined as unknown as T };
    }
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    );
  }

  if (!parsed.success) {
    throw new ApiError(
      parsed.message,
      response.status,
      parsed.code,
      parsed.details,
    );
  }

  return {
    data: parsed.data,
    meta: parsed.meta,
    message: parsed.message,
  };
}
