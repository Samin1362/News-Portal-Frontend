/**
 * Mirrors the backend's user role enum (backend/src/config/constants.ts).
 * Default for a freshly synced user is `reader`.
 */
export type UserRole = "reader" | "journalist" | "editor" | "admin";

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  bio: string;
  isBlocked: boolean;
  isCommentBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}
