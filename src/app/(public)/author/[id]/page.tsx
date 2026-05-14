import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { ArticleCard } from "@/components/public/ArticleCard";
import { Pagination } from "@/components/public/Pagination";
import { getByAuthor } from "@/lib/api/public.api";
import { getArticleOg } from "@/lib/api/seo.api";
import { listCategories } from "@/lib/api/categories.api";

export const revalidate = 60;

interface RouteParams {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Author profile",
    description: "Published stories from this Deligo journalist.",
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: RouteParams) {
  const { id } = await params;
  const sp = await searchParams;
  const page = readPage(sp.page);

  const [result, categories] = await Promise.all([
    getByAuthor(id, page, 12),
    listCategories().catch(() => []),
  ]);
  if (!result) notFound();

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const totalPages = result.meta?.totalPages ?? 1;

  // Backend has no public user-by-id endpoint (Phase 3 known gap). We pull
  // the author's display name from the first article's OG payload — that's
  // the only public surface that resolves author IDs to names.
  let authorName: string | null = null;
  if (result.items[0]?.slug) {
    const og = await getArticleOg(result.items[0].slug);
    authorName = og?.author ?? null;
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-6">
      <div className="border-[1.5px] border-ink rounded-sm bg-paper p-5">
        <div className="flex items-center gap-2">
          <Pill variant="solid">Journalist</Pill>
          <span className="font-hand text-[12px] text-muted truncate max-w-[260px]">
            {id}
          </span>
        </div>
        <h1 className="mt-2 serif text-[28px] font-extrabold tracking-tight">
          {authorName ?? "Author profile"}
        </h1>
        <p className="mt-1 font-sans text-[14px] text-muted">
          {result.meta?.total ?? result.items.length} published stories.
        </p>
      </div>

      <div>
        <SectionTitle>Stories by this author</SectionTitle>
        {result.items.length === 0 ? (
          <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-10 text-center">
            <p className="font-hand text-[12px] text-muted">
              No published stories yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.items.map((a) => (
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
          page={result.meta?.page ?? page}
          totalPages={totalPages}
          hrefFor={(p) => `/author/${id}?page=${p}`}
        />
      </div>
    </div>
  );
}
