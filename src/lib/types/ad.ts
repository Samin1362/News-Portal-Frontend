/**
 * Public ad types — mirror the backend `PublicAdDTO` (see
 * backend/src/views/ad.view.ts `toPublicAdDTO`) and the `AD_PLACEMENTS`
 * enum in backend/src/config/constants.ts. Only the public-safe fields are
 * exposed here (no impressions/clicks/publicId).
 */

export const AD_PLACEMENTS = [
  "home_top",
  "home_sidebar",
  "home_bottom",
  "article_inline",
  "article_sidebar",
  "sponsored_post",
] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export interface PublicAd {
  id: string;
  name: string;
  placement: AdPlacement;
  imageUrl: string;
  linkUrl: string;
  altText: string;
}
