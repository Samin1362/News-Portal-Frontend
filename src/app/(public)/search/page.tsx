import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon, SearchX } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArticleCard } from "@/components/public/ArticleCard";
import { Pagination } from "@/components/public/Pagination";
import { searchArticles } from "@/lib/api/search.api";
import { listCategories, type CategoryDTO } from "@/lib/api/categories.api";
import type { ApiError } from "@/lib/api/client";

interface RouteParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readString(v: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(v) ? v[0] : v;
  return raw && raw.trim().length ? raw : undefined;
}
function readPage(v: string | string[] | undefined): number {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export const metadata: Metadata = {
  title: "Search",
  description: "Search across all Deligo stories.",
};

function buildHref(
  base: Record<string, string | undefined>,
  override: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...base, ...override })) {
    if (v !== undefined && v !== "") params.set(k, v);
  }
  return `/search?${params.toString()}`;
}

export default async function SearchPage({ searchParams }: RouteParams) {
  const sp = await searchParams;
  const q = readString(sp.q) ?? "";
  const categoryId = readString(sp.categoryId);
  const from = readString(sp.from);
  const to = readString(sp.to);
  const page = readPage(sp.page);

  const categories = await listCategories().catch(() => [] as CategoryDTO[]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  // Filters that persist as the user pages / changes one facet.
  const baseParams = { q, categoryId, from, to };

  if (q.length < 2) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-10">
        <SectionTitle>Search</SectionTitle>
        <EmptyState
          icon={<SearchIcon size={28} aria-hidden />}
          title="Type two or more characters"
          description="Press ⌘K (or / ) anywhere to open search, or jump back to the homepage."
          action={
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-ink rounded-md font-hand text-[12px] text-ink hover:bg-paper-2"
            >
              Go to homepage →
            </Link>
          }
        />
      </div>
    );
  }

  let data: Awaited<ReturnType<typeof searchArticles>> | null = null;
  let errorMessage: string | null = null;
  try {
    data = await searchArticles({ q, page, limit: 12, categoryId, from, to });
  } catch (err) {
    errorMessage = (err as ApiError).message ?? "Search failed.";
  }

  if (errorMessage || !data) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-10">
        <SectionTitle>Search</SectionTitle>
        <EmptyState
          className="border-accent/40"
          icon={<SearchX size={28} aria-hidden className="text-accent" />}
          title="Search unavailable"
          description={errorMessage ?? "Please try again in a moment."}
          action={
            <Link
              href={buildHref(baseParams, { page: undefined })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-ink rounded-md font-hand text-[12px] text-ink hover:bg-paper-2"
            >
              Try again
            </Link>
          }
        />
      </div>
    );
  }

  const totalPages = data.meta?.totalPages ?? 1;
  const total = data.meta?.total ?? data.data.items.length;
  const activeCategory = categoryId ? categoryById.get(categoryId) : undefined;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div>
        <SectionTitle>Search results</SectionTitle>

        {/* Query echo + active filter chips */}
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className="font-hand text-[11px] text-muted uppercase tracking-wider">
            For
          </span>
          <Pill variant="solid">{q}</Pill>
          {activeCategory ? (
            <FilterChip
              label={activeCategory.name}
              clearHref={buildHref(baseParams, {
                categoryId: undefined,
                page: undefined,
              })}
            />
          ) : null}
          {from ? (
            <FilterChip
              label={`from ${formatDate(from)}`}
              clearHref={buildHref(baseParams, {
                from: undefined,
                page: undefined,
              })}
            />
          ) : null}
          {to ? (
            <FilterChip
              label={`to ${formatDate(to)}`}
              clearHref={buildHref(baseParams, {
                to: undefined,
                page: undefined,
              })}
            />
          ) : null}
        </div>
        <p className="font-hand text-[11px] text-muted mb-4">
          {total} {total === 1 ? "story" : "stories"} found
        </p>

        {data.data.items.length === 0 ? (
          <EmptyState
            icon={<SearchX size={28} aria-hidden />}
            title="No stories match this search"
            description="Try a different keyword, widen the date range, or clear your filters."
            action={
              categoryId || from || to ? (
                <Link
                  href={buildHref({ q }, {})}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-ink rounded-md font-hand text-[12px] text-ink hover:bg-paper-2"
                >
                  Clear filters
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-ink rounded-md font-hand text-[12px] text-ink hover:bg-paper-2"
                >
                  Browse the homepage →
                </Link>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.data.items.map((a) => (
              <ArticleCard
                key={a.id}
                article={a}
                variant="medium"
                categoryById={categoryById}
              />
            ))}
          </div>
        )}

        <Pagination
          page={data.meta?.page ?? page}
          totalPages={totalPages}
          hrefFor={(p) => buildHref(baseParams, { page: String(p) })}
        />
      </div>

      <aside className="space-y-5">
        {/* Category facet */}
        <div className="border-[1.5px] border-ink rounded-sm bg-paper p-4">
          <div className="font-hand text-[11px] text-muted uppercase tracking-wider mb-2">
            Categories
          </div>
          <ul className="space-y-1">
            {data.data.facets.byCategory.length === 0 ? (
              <li className="font-hand text-[12px] text-muted">No filters.</li>
            ) : (
              data.data.facets.byCategory.map((f) => {
                const cat = categoryById.get(f.categoryId);
                const isActive = categoryId === f.categoryId;
                return (
                  <li
                    key={f.categoryId}
                    className="flex items-center justify-between gap-2"
                  >
                    <Link
                      href={buildHref(baseParams, {
                        categoryId: isActive ? undefined : f.categoryId,
                        page: undefined,
                      })}
                      className={
                        isActive
                          ? "font-hand text-[12px] text-accent font-bold"
                          : "font-hand text-[12px] text-ink hover:text-accent"
                      }
                    >
                      {cat?.name ?? "Category"}
                    </Link>
                    <span className="font-hand text-[11px] text-muted">
                      {f.count}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Date range — native GET form, fully shareable via the URL */}
        <form
          action="/search"
          method="get"
          className="border-[1.5px] border-ink rounded-sm bg-paper p-4 space-y-3"
        >
          <input type="hidden" name="q" value={q} />
          {categoryId ? (
            <input type="hidden" name="categoryId" value={categoryId} />
          ) : null}
          <div className="font-hand text-[11px] text-muted uppercase tracking-wider">
            Date range
          </div>
          <label className="block font-hand text-[11px] text-muted">
            From
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="mt-1 block w-full h-9 px-2 border-[1.5px] border-ink rounded-sm bg-paper font-sans text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </label>
          <label className="block font-hand text-[11px] text-muted">
            To
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="mt-1 block w-full h-9 px-2 border-[1.5px] border-ink rounded-sm bg-paper font-sans text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </label>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center h-9 px-3 border-[1.5px] border-ink rounded-md bg-ink text-paper font-hand text-[12px] hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Apply
            </button>
            {from || to ? (
              <Link
                href={buildHref(baseParams, {
                  from: undefined,
                  to: undefined,
                  page: undefined,
                })}
                className="inline-flex items-center justify-center h-9 px-3 border-[1.5px] border-ink rounded-md font-hand text-[12px] text-ink hover:bg-paper-2"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </aside>
    </div>
  );
}

function FilterChip({
  label,
  clearHref,
}: {
  label: string;
  clearHref: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 h-[22px] pl-2 pr-1 border-[1.5px] border-ink rounded-full font-hand text-[11px] text-ink bg-paper">
      {label}
      <Link
        href={clearHref}
        aria-label={`Remove ${label} filter`}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted hover:text-accent"
      >
        ×
      </Link>
    </span>
  );
}
