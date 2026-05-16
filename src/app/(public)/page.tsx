import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArticleCard } from "@/components/public/ArticleCard";
import { SidebarAd } from "@/components/public/SidebarAd";
import { listCategories, type CategoryDTO } from "@/lib/api/categories.api";
import { getHomepage } from "@/lib/api/public.api";
import type { ArticleCardDTO } from "@/lib/types/article";

export const revalidate = 30;
export const metadata = {
  title: "Deligo — Independent daily news",
  description:
    "Top headlines, in-depth reporting, and breaking news across politics, business, sport, tech, and culture.",
};

function buildCategoryMap(items: CategoryDTO[]): Map<string, CategoryDTO> {
  return new Map(items.map((c) => [c.id, c]));
}

function TrendingList({
  items,
  categoryById,
}: {
  items: ArticleCardDTO[];
  categoryById: Map<string, CategoryDTO>;
}) {
  if (items.length === 0) return null;
  return (
    <ol className="space-y-3">
      {items.map((a, idx) => (
        <li key={a.id} className="flex gap-3">
          <span className="serif text-[24px] font-extrabold text-accent leading-none w-6 shrink-0">
            {idx + 1}
          </span>
          <div className="min-w-0">
            <Link
              href={`/article/${a.slug}`}
              className="serif text-[14px] font-semibold leading-snug text-ink hover:text-accent block"
            >
              {a.headline}
            </Link>
            <div className="font-hand text-[11px] text-muted mt-0.5">
              {categoryById.get(a.categoryId)?.name ?? "News"}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-8 text-center">
      <p className="font-hand text-[12px] text-muted">{label}</p>
      <p className="mt-1 font-sans text-[13px] text-ink">
        Once journalists publish content this section fills in automatically.
      </p>
    </div>
  );
}

export default async function HomePage() {
  const [homepage, categories] = await Promise.all([
    getHomepage(),
    listCategories().catch(() => []),
  ]);
  const categoryById = buildCategoryMap(categories);

  if (!homepage) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <SectionTitle>Top headline</SectionTitle>
        <EmptyState label="The backend is warming up." />
      </div>
    );
  }

  const hero = homepage.topHeadlines[0] ?? homepage.latest[0] ?? null;
  const subHeadlines = homepage.topHeadlines.slice(1, 5);
  const featured = homepage.featured;
  const latest = homepage.latest.slice(0, 12);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
      <div className="min-w-0 space-y-10">
        {/* Hero row */}
        <section>
          <SectionTitle more={{ href: "/", label: "All stories" }}>
            Top headlines
          </SectionTitle>
          {hero ? (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              <ArticleCard
                article={hero}
                variant="large"
                categoryById={categoryById}
              />
              <div className="space-y-4">
                {subHeadlines.length === 0 ? (
                  <EmptyState label="No supporting headlines yet." />
                ) : (
                  subHeadlines.map((a) => (
                    <ArticleCard
                      key={a.id}
                      article={a}
                      variant="small"
                      categoryById={categoryById}
                      showSummary={false}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <EmptyState label="No published articles yet." />
          )}
        </section>

        {/* Featured */}
        {featured.length > 0 ? (
          <section>
            <SectionTitle>Featured</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  variant="medium"
                  categoryById={categoryById}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Latest */}
        <section>
          <SectionTitle more={{ href: "/?view=latest", label: "More" }}>
            Latest
          </SectionTitle>
          {latest.length === 0 ? (
            <EmptyState label="No fresh stories yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {latest.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  variant="small"
                  categoryById={categoryById}
                  showSummary={false}
                />
              ))}
            </div>
          )}
        </section>

        {/* Per-category blocks */}
        {homepage.categories.map((block) => (
          <section key={block.category.id}>
            <SectionTitle
              more={{ href: `/category/${block.category.slug}` }}
            >
              {block.category.name}
            </SectionTitle>
            {block.articles.length === 0 ? (
              <EmptyState label={`No stories in ${block.category.name} yet.`} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="md:col-span-2">
                  <ArticleCard
                    article={block.articles[0]}
                    variant="medium"
                    categoryById={categoryById}
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  {block.articles.slice(1, 4).map((a) => (
                    <ArticleCard
                      key={a.id}
                      article={a}
                      variant="small"
                      categoryById={categoryById}
                      showSummary={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Video block */}
        {homepage.videos.length > 0 ? (
          <section>
            <SectionTitle more={{ href: "/videos" }}>Watch</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {homepage.videos.slice(0, 6).map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  variant="medium"
                  categoryById={categoryById}
                  showSummary={false}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Gallery teaser */}
        {homepage.gallery.length > 0 ? (
          <section>
            <SectionTitle more={{ href: "/gallery" }}>In pictures</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {homepage.gallery.slice(0, 8).map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  variant="mini"
                  categoryById={categoryById}
                  showSummary={false}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Sticky sidebar */}
      <aside className="space-y-6">
        <SidebarAd />
        <div>
          <SectionTitle>Trending</SectionTitle>
          {homepage.trending.length === 0 ? (
            <EmptyState label="Nothing trending yet." />
          ) : (
            <TrendingList
              items={homepage.trending.slice(0, 8)}
              categoryById={categoryById}
            />
          )}
        </div>
        <SidebarAd />
        <div className="font-hand text-[11px] text-muted pt-2 border-t border-black/10">
          Updated{" "}
          {new Date(homepage.generatedAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </aside>
    </div>
  );
}
