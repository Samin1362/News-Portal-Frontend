import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
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
  const page = readPage(sp.page);

  const categories = await listCategories().catch(() => [] as CategoryDTO[]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const baseParams = { q, categoryId };

  if (q.length < 2) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-10">
        <SectionTitle>Search</SectionTitle>
        <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-10 text-center">
          <p className="font-hand text-[12px] text-muted uppercase tracking-wider">
            Type two or more characters
          </p>
          <p className="mt-2 font-sans text-[14px]">
            Use the search box up top, or jump to{" "}
            <Link href="/" className="text-accent hover:underline">
              the homepage
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  let data: Awaited<ReturnType<typeof searchArticles>> | null = null;
  let errorMessage: string | null = null;
  try {
    data = await searchArticles({ q, page, limit: 12, categoryId });
  } catch (err) {
    errorMessage = (err as ApiError).message ?? "Search failed.";
  }

  if (errorMessage || !data) {
    return (
      <div className="max-w-[1080px] mx-auto px-6 py-10">
        <SectionTitle>Search</SectionTitle>
        <div className="border-[1.5px] border-dashed border-accent/60 rounded-sm bg-paper-2 px-4 py-8 text-center">
          <p className="font-hand text-[12px] text-accent uppercase tracking-wider">
            Search unavailable
          </p>
          <p className="mt-2 font-sans text-[14px]">
            {errorMessage ?? "Please try again in a moment."}
          </p>
        </div>
      </div>
    );
  }

  const totalPages = data.meta?.totalPages ?? 1;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div>
        <SectionTitle>Search results</SectionTitle>
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className="font-hand text-[11px] text-muted uppercase tracking-wider">
            For
          </span>
          <Pill variant="solid">{q}</Pill>
          {categoryId ? (
            <>
              <span className="font-hand text-[11px] text-muted">in</span>
              <Pill variant="default">
                {categoryById.get(categoryId)?.name ?? "category"}
              </Pill>
              <Link
                href={buildHref(baseParams, { categoryId: undefined, page: undefined })}
                className="font-hand text-[11px] text-accent hover:underline"
              >
                clear
              </Link>
            </>
          ) : null}
          <span className="font-hand text-[11px] text-muted ml-2">
            · {data.meta?.total ?? data.data.items.length} hits
          </span>
        </div>

        {data.data.items.length === 0 ? (
          <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-10 text-center">
            <p className="font-hand text-[12px] text-muted">
              No stories match this search.
            </p>
          </div>
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
      </aside>
    </div>
  );
}
