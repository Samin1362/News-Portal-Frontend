/**
 * Mirrors backend role-request DTOs (see backend/src/views/roleRequest.view.ts).
 * The reader/journalist frontend only ever sees the requester role transition
 * to `journalist` or `editor` (admin grants come from §3, not §3b).
 */

import type { UserRole } from "@/lib/auth/types";

export type RoleRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type RoleRequestTargetRole = Extract<
  UserRole,
  "journalist" | "editor"
>;

export interface RoleRequestSubmittedInfoDTO {
  fullName: string;
  displayName: string;
  bio: string;
  expertiseTags: string[];
  sampleLinks: string[];
  motivation: string;
  phone: string | null;
  photoPublicId: string | null;
  agreedToGuidelinesAt: string;
  guidelinesVersion: string;
}

export interface RoleRequestDTO {
  id: string;
  userId: string;
  fromRole: UserRole;
  toRole: RoleRequestTargetRole;
  status: RoleRequestStatus;
  submittedInfo: RoleRequestSubmittedInfoDTO;
  emailVerifiedAt: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OtpPurpose =
  | "role-request"
  | "email-change"
  | "sensitive-action";

export interface OtpSendResponse {
  /** ISO timestamp the OTP doc expires (informational — UI shows a countdown). */
  expiresAt: string;
}

export interface OtpVerifyResponse {
  /** Short-lived (15 min) token to pass to POST /role-requests. */
  verificationToken: string;
  expiresAt: string;
}
