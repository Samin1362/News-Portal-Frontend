import Link from "next/link";
import type { ArticleCardDTO } from "@/lib/types/article";

interface Props {
  items?: ArticleCardDTO[];
}

const FALLBACK = [
  "No breaking stories in the last 24 hours.",
];

/**
 * Renders the BREAKING red tag + an ink-bg marquee of headlines. The CSS
 * `.ticker-track` animation pans the row from 0 → -50%, so we render the
 * items twice back-to-back to make the loop seamless.
 */
export function BreakingTicker({ items = [] }: Props) {
  const headlines = items.length
    ? items.map((a) => ({ href: `/article/${a.slug}`, text: a.headline }))
    : FALLBACK.map((text) => ({ href: null, text }));

  const looped = [...headlines, ...headlines];

  return (
    <div className="flex items-center gap-3 bg-ink text-paper overflow-hidden">
      <span className="bg-accent text-paper font-hand font-bold text-[12px] tracking-widest px-3 py-1.5 shrink-0">
        BREAKING
      </span>
      <div className="flex-1 overflow-hidden">
        <div className="ticker-track font-hand text-[12px]">
          {looped.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span aria-hidden>●</span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:underline focus:outline-none focus:underline"
                >
                  {item.text}
                </Link>
              ) : (
                <span>{item.text}</span>
              )}
            </span>
          ))}
        </div>
      </div>
      <span className="font-hand text-[11px] text-paper/60 pr-3 shrink-0 hidden md:inline">
        {items?.length ?? 0} items · 24h
      </span>
    </div>
  );
}
