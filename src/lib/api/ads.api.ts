import { apiFetch, ApiError } from "./client";
import type { AdPlacement, PublicAd } from "@/lib/types/ad";

/**
 * GET /api/v1/public/ads?placement=… — active ads for a single placement.
 * The backend requires the `placement` query param (Zod enum); an invalid
 * or empty result resolves to `[]` so callers can render a fallback slot
 * instead of surfacing an error to the reader.
 */
export async function getPublicAds(
  placement: AdPlacement,
): Promise<PublicAd[]> {
  try {
    const result = await apiFetch<PublicAd[]>(
      `/api/v1/public/ads?placement=${encodeURIComponent(placement)}`,
    );
    return result.data;
  } catch (err) {
    if (err instanceof ApiError) return [];
    throw err;
  }
}

export interface AdClickResult {
  id: string;
  linkUrl: string;
}

/**
 * POST /api/v1/public/ads/:id/click — records a click. Fire-and-forget:
 * `keepalive` lets the beacon survive the navigation the click triggers,
 * and any failure is swallowed so a missed stat never blocks the reader
 * from reaching the advertiser.
 */
export function trackAdClick(id: string): void {
  void apiFetch<AdClickResult>(
    `/api/v1/public/ads/${encodeURIComponent(id)}/click`,
    { method: "POST", keepalive: true },
  ).catch(() => {});
}
