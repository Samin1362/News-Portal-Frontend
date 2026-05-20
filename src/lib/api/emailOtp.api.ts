/**
 * §0a OTP endpoints — public, behind backend authRateLimiter + per-email +
 * per-IP service-layer rate limits. Returns from `verify` carry a short-lived
 * `verificationToken` (15 min) that must be replayed to POST /role-requests.
 */
import { apiFetch } from "./client";
import type {
  OtpPurpose,
  OtpSendResponse,
  OtpVerifyResponse,
} from "@/lib/types/roleRequest";

export async function sendEmailOtp(args: {
  email: string;
  purpose: OtpPurpose;
}): Promise<OtpSendResponse> {
  const result = await apiFetch<OtpSendResponse>(
    "/api/v1/auth/email-otp/send",
    {
      method: "POST",
      body: { email: args.email, purpose: args.purpose },
      cache: "no-store",
    },
  );
  return result.data;
}

export async function verifyEmailOtp(args: {
  email: string;
  code: string;
  purpose: OtpPurpose;
}): Promise<OtpVerifyResponse> {
  const result = await apiFetch<OtpVerifyResponse>(
    "/api/v1/auth/email-otp/verify",
    {
      method: "POST",
      body: { email: args.email, code: args.code, purpose: args.purpose },
      cache: "no-store",
    },
  );
  return result.data;
}
