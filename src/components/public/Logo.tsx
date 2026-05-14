import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  /** sm = sidebar/footer, md = mobile header, lg = desktop masthead */
  size?: LogoSize;
  /** Hides the small uppercase tagline. */
  withTagline?: boolean;
  /** Forces centered alignment (used by the centered mobile masthead). */
  align?: "left" | "center";
  className?: string;
}

const WORDMARK_SIZE: Record<LogoSize, string> = {
  sm: "text-[22px]",
  md: "text-[28px]",
  lg: "text-[36px] md:text-[42px]",
};
const TAGLINE_SIZE: Record<LogoSize, string> = {
  sm: "text-[9px] tracking-[0.25em]",
  md: "text-[10px] tracking-[0.28em]",
  lg: "text-[10px] md:text-[11px] tracking-[0.32em]",
};

/**
 * Editorial Deligo wordmark. Source Serif 4 extrabold with a signature
 * accent-red period as the visual hook, and a uppercase Kalam tagline
 * underneath. Sized variants:
 *  - `sm` for the dashboard sidebar / footer
 *  - `md` for the mobile masthead
 *  - `lg` for the desktop public header
 */
export function Logo({
  size = "lg",
  withTagline = true,
  align = "left",
  className,
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Deligo — independent daily news"
      className={cn(
        "group inline-flex flex-col leading-none select-none",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <span
        className={cn(
          "serif font-extrabold tracking-tight text-ink leading-none",
          "group-hover:text-accent transition-colors",
          WORDMARK_SIZE[size],
        )}
      >
        Deligo<span className="text-accent">.</span>
      </span>
      {withTagline ? (
        <span
          className={cn(
            "font-hand uppercase text-muted mt-1",
            "group-hover:text-accent transition-colors",
            TAGLINE_SIZE[size],
          )}
        >
          Independent · daily
        </span>
      ) : null}
    </Link>
  );
}
