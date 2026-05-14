import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { AdSlot } from "@/components/ui/AdSlot";
import { Pill } from "@/components/ui/Pill";
import { ArticleCard } from "@/components/public/ArticleCard";
import { Pagination } from "@/components/public/Pagination";
import { getByTag } from "@/lib/api/public.api";
import { listCategories } from "@/lib/api/categories.api";

export const revalidate = 60;

interface RouteParams {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const { payload } = await getByTag(slug, 1, 1);
  if (!payload) return { title: "Tag" };
  return {
    title: `#${payload.tag.name}`,
    description: `Stories tagged #${payload.tag.name} on Deligo.`,
  };
}

export default async function TagPage({ params, searchParams }: RouteParams) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = readPage(sp.page);

  const [{ payload, meta }, categories] = await Promise.all([
    getByTag(slug, page, 12),
    listCategories().catch(() => []),
  ]);
  if (!payload) notFound();

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-6">
      <div className="border-[1.5px] border-ink rounded-sm bg-paper p-5">
        <div className="flex items-center gap-2">
          <Pill variant="solid">Tag</Pill>
          <span className="font-hand text-[12px] text-muted">{slug}</span>
        </div>
        <h1 className="mt-2 serif text-[28px] font-extrabold tracking-tight">
          #{payload.tag.name}
        </h1>
        <p className="mt-1 font-sans text-[14px] text-muted">
          {meta?.total ?? payload.articles.length} stories tagged{" "}
          <span className="text-ink">#{payload.tag.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <SectionTitle>Stories</SectionTitle>
          {payload.articles.length === 0 ? (
            <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-10 text-center">
              <p className="font-hand text-[12px] text-muted">
                Nothing tagged here yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {payload.articles.map((a) => (
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
            page={meta?.page ?? page}
            totalPages={totalPages}
            hrefFor={(p) => `/tag/${slug}?page=${p}`}
          />
        </div>

        <aside className="space-y-6">
          <AdSlot placement="home_sidebar" />
        </aside>
      </div>
    </div>
  );
}
