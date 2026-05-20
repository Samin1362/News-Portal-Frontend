"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getMyLatestRoleRequest } from "@/lib/api/roleRequests.api";
import type { RoleRequestDTO } from "@/lib/types/roleRequest";

/**
 * Reader's latest role request. Returns `data: null` if the user has never
 * submitted one. Shared by the dashboard CTA card, the sidebar nav badge,
 * and the status page so all three render off the same cache entry.
 *
 * Only fires while the user is `reader` or `journalist` (those are the only
 * `fromRole`s the backend accepts). Editors and admins skip the call.
 */
export function useMyRoleRequest() {
  const { getIdToken, profile, role } = useAuth();
  const enabled =
    !!profile && (role === "reader" || role === "journalist");

  return useQuery<RoleRequestDTO | null>({
    enabled,
    queryKey: ["role-request", "me", profile?.id],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) return null;
      return getMyLatestRoleRequest(token);
    },
    staleTime: 60_000,
  });
}
