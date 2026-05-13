import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PillVariant = "default" | "solid" | "red" | "green";

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  dot?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<PillVariant, string> = {
  default: "bg-paper text-ink border-ink",
  solid: "bg-ink text-paper border-ink",
  red: "bg-accent text-paper border-accent",
  green: "bg-accent-2 text-paper border-accent-2",
};

/**
 * Deligo pill / badge. Kalam font, 1.5px border, fully rounded.
 * Used for category tags, breaking/trending/featured flags, status chips.
 */
export function Pill({
  variant = "default",
  dot,
  className,
  children,
  ...rest
}: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2 py-0.5 font-hand text-[11px] leading-tight tracking-tight",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  );
}
