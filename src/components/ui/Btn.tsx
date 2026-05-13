import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

type BtnVariant = "default" | "primary" | "ghost" | "solid";

export interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: "sm" | "md";
  children: ReactNode;
}

const VARIANTS: Record<BtnVariant, string> = {
  default: "bg-paper text-ink border-ink hover:bg-paper-2",
  primary:
    "bg-accent text-paper border-accent hover:brightness-95 active:brightness-90",
  ghost:
    "bg-transparent text-ink border-transparent hover:bg-paper-2",
  solid: "bg-ink text-paper border-ink hover:brightness-95",
};

const SIZES: Record<"sm" | "md", string> = {
  sm: "px-2.5 py-1 text-[12px]",
  md: "px-3 py-1.5 text-[13px]",
};

/**
 * Deligo button. Inter, 1.5px border, 4px radius (--radius-md).
 *
 * NOTE: we keep the same hand-font feel of the wireframe label by using
 * Kalam (`font-hand`) on the visible text — the wireframe uses Kalam for
 * button labels.
 */
export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  { variant = "default", size = "md", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border-[1.5px] font-hand transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
