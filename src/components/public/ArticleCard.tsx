import Image from "next/image";
import Link from "next/link";
import { Eye, MessageSquare } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { BookmarkButton } from "@/components/public/BookmarkButton";
import type { ArticleCardDTO } from "@/lib/types/article";
import type { CategoryDTO } from "@/lib/api/categories.api";
import { compactCount, timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export type ArticleCardVariant = "large" | "medium" | "small" | "mini";

interface Props {
  article: ArticleCardDTO;
  variant?: ArticleCardVariant;
  categoryById?: Map<string, CategoryDTO>;
  showSummary?: boolean;
  /** Show the bookmark overlay (only on the image-led stack variants). */
  showBookmark?: boolean;
  className?: string;
}

const IMAGE_H: Record<ArticleCardVariant, string> = {
  large: "h-[320px]",
  medium: "h-[160px]",
  small: "h-[90px]",
  mini: "h-[60px]",
};
const HEADLINE: Record<ArticleCardVariant, string> = {
  large: "text-[28px] leading-[1.05] font-extrabold",
  medium: "text-[17px] leading-[1.15] font-bold",
  small: "text-[14px] leading-[1.2] font-bold",
  mini: "text-[13px] leading-[1.2] font-bold",
};
const SUMMARY: Record<ArticleCardVariant, string> = {
  large: "text-[14px] leading-relaxed mt-2 line-clamp-3",
  medium: "text-[13px] leading-snug mt-1.5 line-clamp-2",
  small: "text-[12px] leading-snug mt-1 line-clamp-2",
  mini: "hidden",
};

export function ArticleCard({
  article,
  variant = "medium",
  categoryById,
  showSummary = true,
  showBookmark = true,
  className,
}: Props) {
  const category = categoryById?.get(article.categoryId);
  const href = `/article/${article.slug}`;
  const img = article.featuredImage;
  const layout: "stack" | "side" =
    variant === "small" || variant === "mini" ? "side" : "stack";

  return (
    <article className={cn("group relative", className)}>
      <Link href={href} className="block">
        <div
          className={cn(
            layout === "side" ? "flex gap-3" : "flex flex-col",
          )}
        >
          {img ? (
            <div
              className={cn(
                "relative overflow-hidden border-[1.5px] border-ink rounded-sm bg-paper-2",
                IMAGE_H[variant],
                layout === "side"
                  ? variant === "mini"
                    ? "w-[80px] shrink-0"
                    : "w-[120px] shrink-0"
                  : "w-full",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? article.headline}
                fill
                sizes={
                  variant === "large"
                    ? "(max-width: 768px) 100vw, 70vw"
                    : variant === "medium"
                      ? "(max-width: 768px) 100vw, 33vw"
                      : "120px"
                }
                className="object-cover card-img-zoom"
              />
            </div>
          ) : layout === "stack" ? (
            <div
              className={cn(
                "border-[1.5px] border-ink rounded-sm bg-paper-2",
                IMAGE_H[variant],
                "w-full flex items-center justify-center font-hand text-[11px] text-muted",
              )}
            >
              No image
            </div>
          ) : null}

          <div
            className={cn(
              "min-w-0 flex-1",
              layout === "stack" ? "mt-3" : "",
            )}
          >
            <div className="flex items-center flex-wrap gap-1.5">
              {article.isBreaking ? (
                <Pill variant="red">Breaking</Pill>
              ) : article.isTrending ? (
                <Pill variant="green" dot>
                  Trending
                </Pill>
              ) : null}
              {category ? (
                <Pill variant="default">{category.name}</Pill>
              ) : null}
            </div>

            <h3
              className={cn(
                "serif tracking-tight text-ink mt-1.5",
                "group-hover:text-accent transition-colors",
                HEADLINE[variant],
              )}
            >
              {article.headline}
            </h3>

            {showSummary && article.summary ? (
              <p className={cn("font-sans text-muted", SUMMARY[variant])}>
                {article.summary}
              </p>
            ) : null}

            <div className="mt-2 flex items-center gap-2 font-hand text-[11px] text-muted">
              <span>{timeAgo(article.publishedAt)}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Eye size={11} aria-hidden />
                {compactCount(article.viewCount)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={11} aria-hidden />
                {compactCount(article.commentCount)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Bookmark overlay — only on the image-led stack variants, kept out of
          the wrapping <Link> so we don't nest interactive elements. */}
      {showBookmark && layout === "stack" ? (
        <BookmarkButton
          article={article}
          variant="overlay"
          className="absolute top-2 right-2 z-10 shadow-soft"
        />
      ) : null}
    </article>
  );
}
