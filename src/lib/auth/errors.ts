import { FirebaseError } from "firebase/app";
import { ApiError } from "@/lib/api/client";

const FIREBASE_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address looks invalid.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Wrong password. Try again or reset it.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/email-already-in-use":
    "An account already exists with that email — try signing in instead.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/popup-blocked":
    "Browser blocked the Google sign-in popup. Allow popups and retry.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/too-many-requests":
    "Too many attempts. Wait a minute, then try again.",
};

const API_MESSAGES: Record<string, string> = {
  CONFLICT:
    "An account with this email is already linked to a different identity.",
  UNAUTHORIZED: "Your session expired. Please sign in again.",
  FORBIDDEN: "You don't have access to this resource.",
  VALIDATION_ERROR: "Some details look invalid — please check the form.",
};

// Broader, page-level copy for error boundaries / data-fetch failures, keyed by
// the backend's `ApiError.code`. Kept separate from the auth-flow copy above so
// each context reads naturally.
const API_PAGE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Please sign in to view this.",
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  BAD_REQUEST: "That request wasn't quite right.",
  CONFLICT: "That action conflicts with the current state.",
  UNPROCESSABLE_ENTITY: "Some details look invalid.",
  VALIDATION_ERROR: "Some details look invalid.",
  INTERNAL_ERROR: "The newsroom hit a snag on its end.",
};

/**
 * Page/boundary-level message for any thrown error. Maps backend `ApiError`
 * codes to friendly copy and falls back to a generic line — never leaks a raw
 * stack to the reader.
 */
export function friendlyErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return API_PAGE_MESSAGES[err.code] ?? err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

export function authErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return FIREBASE_MESSAGES[err.code] ?? err.message;
  }
  if (err instanceof ApiError) {
    return API_MESSAGES[err.code] ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
