"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getPublicAds, trackAdClick } from "@/lib/api/ads.api";
import type { AdPlacement } from "@/lib/types/ad";

interface SidebarAdProps {
  /** Which placement to serve. Defaults to the generic home sidebar slot. */
  placement?: AdPlacement;
}

/**
 * Sidebar ad — fixed IAB-medium-rectangle ratio (6:5, matches the standard
 * 300×250 sidebar slot). Fetches the active ads for `placement` from
 * `GET /api/v1/public/ads`, renders one as a sponsored link, and records a
 * click via `POST /api/v1/public/ads/:id/click`. When no campaign is live
 * it falls back to the house creative so the sidebar stays visually filled.
 * Reused on every public page with a sidebar (homepage, category, tag,
 * article).
 */
export function SidebarAd({ placement = "home_sidebar" }: SidebarAdProps) {
  const { data: ads } = useQuery({
    queryKey: ["public-ads", placement],
    queryFn: () => getPublicAds(placement),
    staleTime: 5 * 60 * 1000,
  });

  const ad = ads && ads.length > 0 ? ads[0] : null;

  if (ad) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackAdClick(ad.id)}
        aria-label={ad.altText || ad.name || "Advertisement"}
        data-ad-placement={placement}
        className="relative block w-full aspect-[6/5] overflow-hidden rounded-sm border-[1.5px] border-ink bg-paper-2"
      >
        <Image
          src={ad.imageUrl}
          alt={ad.altText || ad.name || "Advertisement"}
          fill
          sizes="300px"
          className="object-cover"
        />
        <span className="absolute top-1 right-1 font-hand text-[9px] uppercase tracking-widest text-muted bg-paper/80 px-1 rounded-sm">
          Ad
        </span>
      </a>
    );
  }

  return (
    <div className="relative w-full aspect-[6/5] overflow-hidden rounded-sm">
      <Image
        src="/adds/ads-3.png"
        alt="Advertisement"
        fill
        sizes="300px"
        className="object-cover"
      />
    </div>
  );
}
