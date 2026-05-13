import { cn } from "@/lib/utils/cn";

interface AdSlotProps {
  placement: string;
  className?: string;
  /** Optional explicit height. Defaults sized per placement. */
  height?: number;
}

const DEFAULT_HEIGHT: Record<string, number> = {
  home_top: 90,
  home_sidebar: 250,
  home_bottom: 90,
  article_inline: 90,
  article_sidebar: 250,
  sponsored_post: 250,
};

/**
 * Placeholder ad slot. Phase 9 wires this to `GET /api/v1/public/ads`.
 * For now: dashed border, hatched background, "ADVERTISEMENT" label.
 */
export function AdSlot({ placement, className, height }: AdSlotProps) {
  const h = height ?? DEFAULT_HEIGHT[placement] ?? 90;
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
