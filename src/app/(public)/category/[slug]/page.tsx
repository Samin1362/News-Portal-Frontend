import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArticleCard } from "@/components/public/ArticleCard";
import { FollowButton } from "@/components/public/FollowButton";
import { SidebarAd } from "@/components/public/SidebarAd";
import { Pagination } from "@/components/public/Pagination";
import {
  getCategoryArticles,
  getTrending,
} from "@/lib/api/public.api";
import { listCategories, type CategoryDTO } from "@/lib/api/categories.api";

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
  const { payload } = await getCategoryArticles(slug, 1, 1);
  if (!payload) return { title: "Category" };
  return {
    title: payload.category.name,
    description:
      payload.category.description ||
      `${payload.category.name} stories on Deligo.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: RouteParams) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = readPage(sp.page);

  const [{ payload, meta }, trending, categories] = await Promise.all([
    getCategoryArticles(slug, page, 12),
    getTrending(1, 8).catch(() => ({ items: [] })),
    listCategories().catch(() => [] as CategoryDTO[]),
  ]);

  if (!payload) notFound();

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const total = meta?.totalPages ?? 1;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-6">
      {/* Banner */}
      <div className="border-[1.5px] border-ink rounded-sm bg-paper-2 overflow-hidden">
        {payload.category.bannerUrl ? (
          // External banner image; intentional <img> to avoid forcing Cloudinary loader for arbitrary host.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={payload.category.bannerUrl}
            alt={payload.category.name}
            className="w-full h-[160px] object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="w-full h-[120px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 8px, rgba(0,0,0,0.05) 8px 9px)",
            }}
          />
        )}
        <div className="px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="serif text-[28px] font-extrabold tracking-tight leading-none">
              {payload.category.name}
            </h1>
            {payload.category.description ? (
              <p className="mt-2 font-sans text-[14px] text-muted leading-relaxed">
                {payload.category.description}
              </p>
            ) : (
              <p className="mt-2 font-hand text-[12px] text-muted">
                Latest stories in {payload.category.name}.
              </p>
            )}
          </div>
          <FollowButton
            category={{
              id: payload.category.id,
              slug: payload.category.slug,
              name: payload.category.name,
            }}
            className="shrink-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <SectionTitle>Stories</SectionTitle>
          {payload.articles.length === 0 ? (
            <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-10 text-center">
              <p className="font-hand text-[12px] text-muted">
                No published stories in this category yet.
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
            totalPages={total}
            hrefFor={(p) => `/category/${slug}?page=${p}`}
          />
        </div>

        <aside className="space-y-6">
          <SidebarAd />
          <div>
            <SectionTitle>Trending</SectionTitle>
            <ol className="space-y-3">
              {trending.items.slice(0, 6).map((a, idx) => (
                <li key={a.id} className="flex gap-3">
                  <span className="serif text-[22px] font-extrabold text-accent leading-none w-5 shrink-0">
                    {idx + 1}
                  </span>
                  <a
                    href={`/article/${a.slug}`}
                    className="serif text-[14px] font-semibold leading-snug text-ink hover:text-accent block"
                  >
                    {a.headline}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
