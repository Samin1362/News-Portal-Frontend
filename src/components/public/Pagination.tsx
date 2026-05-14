import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  page: number;
  totalPages: number;
  /** Builds the href for a given page number. */
  hrefFor: (page: number) => string;
}

/**
 * Builds a compact pagination range — always shows first / last, current,
 * and the immediate neighbors, collapsing the rest with an ellipsis. e.g.
 *   1 … 4 5 [6] 7 8 … 24
 */
function buildPages(page: number, total: number): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: Array<number | "…"> = [1];
  const left = Math.max(2, page - 1);
  const right = Math.min(total - 1, page + 1);
  if (left > 2) out.push("…");
  for (let p = left; p <= right; p++) out.push(p);
  if (right < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);
  const prev = page > 1 ? hrefFor(page - 1) : null;
  const next = page < totalPages ? hrefFor(page + 1) : null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-center gap-1 flex-wrap"
    >
      {prev ? (
        <Link
          href={prev}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 h-[30px] px-2 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-ink hover:bg-paper-2"
        >
          <ChevronLeft size={12} aria-hidden /> Prev
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 h-[30px] px-2 border-[1.5px] border-ink/30 rounded-sm font-hand text-[12px] text-muted">
          <ChevronLeft size={12} aria-hidden /> Prev
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="px-2 font-hand text-[12px] text-muted"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-[30px] h-[30px] inline-flex items-center justify-center px-2 border-[1.5px] rounded-sm font-hand text-[12px]",
              p === page
                ? "bg-ink text-paper border-ink"
                : "border-ink text-ink hover:bg-paper-2",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {next ? (
        <Link
          href={next}
          aria-label="Next page"
          className="inline-flex items-center gap-1 h-[30px] px-2 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-ink hover:bg-paper-2"
        >
          Next <ChevronRight size={12} aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 h-[30px] px-2 border-[1.5px] border-ink/30 rounded-sm font-hand text-[12px] text-muted">
          Next <ChevronRight size={12} aria-hidden />
        </span>
      )}
    </nav>
  );
}
