import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pill } from "@/components/ui/Pill";
import { AdSlot } from "@/components/ui/AdSlot";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArticleCard } from "@/components/public/ArticleCard";
import { ShareButtons } from "@/components/public/ShareButtons";
import { CommentsSection } from "@/components/public/comments/CommentsSection";
import { getArticleBySlug } from "@/lib/api/public.api";
import { getArticleOg } from "@/lib/api/seo.api";
import { listCategories } from "@/lib/api/categories.api";
import { compactCount, shortDate, timeAgo } from "@/lib/utils/format";

export const revalidate = 60;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const og = await getArticleOg(slug);
  if (!og) return { title: "Article not found" };
  return {
    title: og.title,
    description: og.description,
    alternates: { canonical: og.url },
    openGraph: {
      type: "article",
      title: og.title,
      description: og.description,
      url: og.url,
      siteName: og.siteName,
      images: og.image ? [{ url: og.image }] : undefined,
      publishedTime: og.publishedTime ?? undefined,
      modifiedTime: og.modifiedTime,
      tags: og.tags,
      authors: og.author ? [og.author] : undefined,
      section: og.section ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: og.title,
      description: og.description,
      images: og.image ? [og.image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: RouteParams) {
  const { slug } = await params;
  const [response, og, categories] = await Promise.all([
    getArticleBySlug(slug),
    getArticleOg(slug),
    listCategories().catch(() => []),
  ]);
  if (!response) notFound();

  const { article, related } = response;
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const category = categoryById.get(article.categoryId);
  const shareUrl = og?.url ?? `${SITE_URL}/article/${article.slug}`;
  const authorName = og?.author ?? "Editorial";
  const sectionName = og?.section ?? category?.name ?? null;

  return (
    <article className="bg-paper">
      <div className="max-w-[1080px] mx-auto px-6 py-6">
        {/* Crumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 font-hand text-[11px] text-muted"
        >
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span aria-hidden>/</span>
          {category ? (
            <Link
              href={`/category/${category.slug}`}
              className="hover:text-accent"
            >
              {category.name}
            </Link>
          ) : sectionName ? (
            <span>{sectionName}</span>
          ) : null}
          <span aria-hidden>/</span>
          <span className="text-ink truncate max-w-[280px]">
            {article.headline}
          </span>
        </nav>

        {/* Header */}
        <header className="mt-4">
          <div className="flex items-center flex-wrap gap-2">
            {article.isBreaking ? <Pill variant="red">Breaking</Pill> : null}
            {article.isTrending ? (
              <Pill variant="green" dot>
                Trending
              </Pill>
            ) : null}
            {category ? (
              <Link href={`/category/${category.slug}`}>
                <Pill variant="solid">{category.name}</Pill>
              </Link>
            ) : null}
          </div>

          <h1 className="serif text-[36px] md:text-[44px] font-extrabold tracking-tight leading-[1.05] mt-3">
            {article.headline}
          </h1>
          {article.summary ? (
            <p className="mt-3 font-sans text-[17px] leading-relaxed text-ink/85">
              {article.summary}
            </p>
          ) : null}

          <div className="mt-4 flex items-center gap-3 flex-wrap font-hand text-[12px] text-muted">
            <Link
              href={`/author/${article.authorId}`}
              className="text-ink hover:text-accent"
            >
              By {authorName}
            </Link>
            <span aria-hidden>·</span>
            <span>{shortDate(article.publishedAt)}</span>
            <span aria-hidden>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
            <span aria-hidden>·</span>
            <span>{compactCount(article.viewCount)} views</span>
            <span aria-hidden>·</span>
            <span>{compactCount(article.commentCount)} comments</span>
          </div>
        </header>

        {/* Featured image */}
        {article.featuredImage ? (
          <figure className="mt-6 border-[1.5px] border-ink rounded-sm overflow-hidden bg-paper-2">
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt ?? article.headline}
                fill
                priority
                sizes="(max-width: 1080px) 100vw, 1080px"
                className="object-cover"
              />
            </div>
            {article.featuredImage.caption ? (
              <figcaption className="px-4 py-2 font-hand text-[12px] text-muted bg-paper-2 border-t-[1.5px] border-ink">
                {article.featuredImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        {/* Body */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0">
            <div
              className="prose-deligo serif text-[18px] leading-[1.7] text-ink space-y-4"
              // Backend's sanitize-html runs at write-time (see backend Phase 4
              // article.service.ts createArticle / patchArticle) — the stored
              // `content` field is the source of truth. We trust it here so the
              // article body stays a server-rendered string for SEO.
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Inline ad */}
            <div className="my-8">
              <AdSlot placement="article_inline" />
            </div>

            {/* Gallery */}
            {article.gallery.length > 0 ? (
              <section className="mt-8">
                <SectionTitle>Gallery</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {article.gallery.map((m) => (
                    <figure
                      key={m.publicId}
                      className="border-[1.5px] border-ink rounded-sm overflow-hidden bg-paper-2"
                    >
                      <div className="relative w-full aspect-square">
                        <Image
                          src={m.url}
                          alt={m.alt ?? "Gallery image"}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      {m.caption ? (
                        <figcaption className="px-3 py-1.5 font-hand text-[11px] text-muted border-t border-black/10">
                          {m.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Videos */}
            {article.videos.length > 0 ? (
              <section className="mt-8">
                <SectionTitle>Watch</SectionTitle>
                <div className="space-y-4">
                  {article.videos.map((v) => (
                    <figure
                      key={v.publicId}
                      className="border-[1.5px] border-ink rounded-sm overflow-hidden bg-ink"
                    >
                      <video
                        controls
                        preload="metadata"
                        poster={v.thumbnail}
                        className="w-full bg-ink"
                      >
                        <source src={v.url} />
                        Sorry, your browser does not support embedded video.
                      </video>
                      {v.caption ? (
                        <figcaption className="px-3 py-2 font-hand text-[11px] text-paper/80 bg-ink">
                          {v.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Tags */}
            {article.tags.length > 0 ? (
              <div className="mt-8 flex items-center flex-wrap gap-2">
                <span className="font-hand text-[11px] text-muted uppercase tracking-wider">
                  Tagged
                </span>
                {article.tags.map((t) => (
                  <Link key={t} href={`/tag/${t}`}>
                    <Pill variant="default">{t}</Pill>
                  </Link>
                ))}
              </div>
            ) : null}

            {/* Share */}
            <div className="mt-6 pt-4 border-t border-black/10">
              <ShareButtons url={shareUrl} title={article.headline} />
            </div>

            {/* JSON-LD */}
            {og?.structuredData ? (
              <script
                type="application/ld+json"
                // Server-rendered JSON-LD payload from the backend OG endpoint.
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(og.structuredData),
                }}
              />
            ) : null}

            {/* Comments — Phase 4 */}
            <CommentsSection
              articleId={article.id}
              isCommentsEnabled={article.isCommentsEnabled}
              initialCount={article.commentCount}
            />
          </div>

          <aside className="space-y-6">
            <AdSlot placement="article_sidebar" />
            {related.length > 0 ? (
              <div>
                <SectionTitle>Related</SectionTitle>
                <div className="space-y-3">
                  {related.slice(0, 6).map((a) => (
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
            ) : null}
            <AdSlot placement="article_sidebar" />
          </aside>
        </div>
      </div>
    </article>
  );
}
