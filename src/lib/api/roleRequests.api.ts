/**
 * §0a / §3b reader-side role-request endpoints. The admin inbox endpoints
 * (GET /role-requests, /approve, /reject) live in the admin portal and are
 * intentionally absent here.
 */
import { apiFetch } from "./client";
import type {
  RoleRequestDTO,
  RoleRequestTargetRole,
  RoleRequestSubmittedInfoDTO,
} from "@/lib/types/roleRequest";

export interface CreateRoleRequestBody {
  toRole: RoleRequestTargetRole;
  submittedInfo: Omit<
    RoleRequestSubmittedInfoDTO,
    "agreedToGuidelinesAt" | "guidelinesVersion" | "phone" | "photoPublicId"
  > & {
    phone?: string;
    photoPublicId?: string;
  };
  verificationToken: string;
}

export async function createRoleRequest(
  body: CreateRoleRequestBody,
  token: string,
): Promise<RoleRequestDTO> {
  const result = await apiFetch<RoleRequestDTO>("/api/v1/role-requests", {
    method: "POST",
    body,
    token,
    cache: "no-store",
  });
  return result.data;
}

export async function getMyLatestRoleRequest(
  token: string,
): Promise<RoleRequestDTO | null> {
  const result = await apiFetch<RoleRequestDTO | null>(
    "/api/v1/role-requests/me",
    { token, cache: "no-store" },
  );
  return result.data;
}

export async function cancelMyRoleRequest(
  id: string,
  token: string,
): Promise<RoleRequestDTO> {
  const result = await apiFetch<RoleRequestDTO>(
    `/api/v1/role-requests/${encodeURIComponent(id)}/cancel`,
    { method: "PATCH", token, cache: "no-store" },
  );
  return result.data;
}
