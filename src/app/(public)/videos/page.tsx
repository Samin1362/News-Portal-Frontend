import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Play } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { Pagination } from "@/components/public/Pagination";
import { getVideos } from "@/lib/api/public.api";
import { listCategories } from "@/lib/api/categories.api";
import { compactCount, timeAgo } from "@/lib/utils/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Watch",
  description: "Video reporting from Deligo: explainers, interviews, on-the-ground coverage.",
};

interface RouteParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readPage(v: string | string[] | undefined): number {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default async function VideosPage({ searchParams }: RouteParams) {
  const sp = await searchParams;
  const page = readPage(sp.page);
  const [result, categories] = await Promise.all([
    getVideos(page, 12),
    listCategories().catch(() => []),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const totalPages = result.meta?.totalPages ?? 1;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <SectionTitle>Watch</SectionTitle>
      {result.items.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-10 text-center">
          <p className="font-hand text-[12px] text-muted">
            No video stories yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {result.items.map((a) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="group border-[1.5px] border-ink rounded-sm overflow-hidden bg-paper block"
            >
              <div className="relative w-full aspect-video bg-ink overflow-hidden">
                {a.featuredImage ? (
                  <Image
                    src={a.featuredImage.url}
                    alt={a.featuredImage.alt ?? a.headline}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-90 transition-transform group-hover:scale-[1.03]"
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center justify-center w-[44px] h-[44px] rounded-full bg-paper/90 border-[1.5px] border-ink">
                    <Play
                      size={16}
                      aria-hidden
                      className="text-accent translate-x-[1px]"
                    />
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <Pill variant="red">Video</Pill>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Pill variant="default">
                    {categoryById.get(a.categoryId)?.name ?? "News"}
                  </Pill>
                </div>
                <h3 className="mt-2 serif text-[17px] font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-accent">
                  {a.headline}
                </h3>
                <div className="mt-2 font-hand text-[11px] text-muted flex items-center gap-2">
                  <span>{timeAgo(a.publishedAt)}</span>
                  <span aria-hidden>·</span>
                  <span>{compactCount(a.viewCount)} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={result.meta?.page ?? page}
        totalPages={totalPages}
        hrefFor={(p) => `/videos?page=${p}`}
      />
    </div>
  );
}
