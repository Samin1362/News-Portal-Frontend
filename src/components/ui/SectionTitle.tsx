import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionTitleProps {
  children: ReactNode;
  more?: { href: string; label?: string };
  className?: string;
}

/**
 * Section heading with the skewed editorial-red underline accent.
 */
export function SectionTitle({
  children,
  more,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 mt-2 mb-3",
        className,
      )}
    >
      <h2 className="serif uline text-[20px] font-extrabold tracking-tight leading-none">
        {children}
      </h2>
      {more ? (
        <Link
          href={more.href}
          className="font-hand text-[12px] text-accent hover:underline"
        >
          {more.label ?? "See all"} →
        </Link>
      ) : null}
    </div>
  );
}
