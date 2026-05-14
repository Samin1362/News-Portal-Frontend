import { apiFetch } from "./client";
import type { UserProfile } from "@/lib/auth/types";

export interface UpdateMeBody {
  displayName?: string;
  bio?: string;
  photoURL?: string | null;
}

export async function updateMe(
  body: UpdateMeBody,
  token: string,
): Promise<UserProfile> {
  const result = await apiFetch<UserProfile>("/api/v1/users/me", {
    method: "PATCH",
    body,
    token,
    cache: "no-store",
  });
  return result.data;
}
