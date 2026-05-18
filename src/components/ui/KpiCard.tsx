import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  accent?: boolean;
  spark?: ReactNode;
  className?: string;
}

/**
 * Newsroom KPI tile. Label (Kalam, upper, muted) → value (serif, 38px) →
 * meta row → optional sparkline anchored top-right. `accent` swaps the
 * border to red and the label to red.
 */
export function KpiCard({
  label,
  value,
  meta,
  accent,
  spark,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-sm border-[1.5px] bg-paper px-[18px] py-4 overflow-hidden",
        accent ? "border-accent" : "border-ink",
        "card-hov",
        className,
      )}
    >
      <div
        className={cn(
          "font-hand text-[11px] tracking-[0.1em] uppercase",
          accent ? "text-accent" : "text-muted",
        )}
      >
        {label}
      </div>
      <div className="serif font-extrabold tracking-[-0.03em] text-[34px] leading-none">
        {value}
      </div>
      {meta ? (
        <div className="font-hand text-[11.5px] text-muted">{meta}</div>
      ) : null}
      {spark}
    </div>
  );
}
