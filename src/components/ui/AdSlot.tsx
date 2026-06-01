"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getPublicAds, trackAdClick } from "@/lib/api/ads.api";
import type { AdPlacement } from "@/lib/types/ad";
import { cn } from "@/lib/utils/cn";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
  /** Optional explicit height. Defaults sized per placement. */
  height?: number;
}

const DEFAULT_HEIGHT: Record<AdPlacement, number> = {
  home_top: 90,
  home_sidebar: 250,
  home_bottom: 90,
  article_inline: 90,
  article_sidebar: 250,
  sponsored_post: 250,
};

/**
 * Banner ad slot. Fetches the active ads for `placement` from
 * `GET /api/v1/public/ads`, renders one creative as a sponsored link, and
 * records a click via `POST /api/v1/public/ads/:id/click`. While loading,
 * empty, or on error it falls back to the dashed "ADVERTISEMENT" placeholder
 * so the layout never shifts.
 */
export function AdSlot({ placement, className, height }: AdSlotProps) {
  const h = height ?? DEFAULT_HEIGHT[placement] ?? 90;

  const { data: ads } = useQuery({
    queryKey: ["public-ads", placement],
    queryFn: () => getPublicAds(placement),
    staleTime: 5 * 60 * 1000,
  });

  // First active campaign for the slot (kept deterministic so render stays
  // pure; rotation, if wanted, is the backend's job to order).
  const ad = ads && ads.length > 0 ? ads[0] : null;

  if (ad) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackAdClick(ad.id)}
        aria-label={ad.altText || ad.name || `Advertisement (${placement})`}
        data-ad-placement={placement}
        style={{ height: h }}
        className={cn(
          "relative block w-full overflow-hidden",
          "border-[1.5px] border-ink rounded-sm bg-paper-2",
          className,
        )}
      >
        <Image
          src={ad.imageUrl}
          alt={ad.altText || ad.name || "Advertisement"}
          fill
          sizes="(max-width: 768px) 100vw, 728px"
          className="object-contain"
        />
        <span className="absolute top-1 right-1 font-hand text-[9px] uppercase tracking-widest text-muted bg-paper/80 px-1 rounded-sm">
          Ad
        </span>
      </a>
    );
  }

  return (
    <div
      role="complementary"
      aria-label={`Ad slot ${placement}`}
      style={{
        height: h,
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.04) 8px 9px)",
      }}
      className={cn(
        "flex flex-col items-center justify-center w-full",
        "border-[1.5px] border-dashed border-ink rounded-sm",
        "font-hand text-muted text-[11px] tracking-widest",
        className,
      )}
    >
      <span>ADVERTISEMENT</span>
      <span className="text-[10px] mt-0.5">{placement}</span>
    </div>
  );
}
