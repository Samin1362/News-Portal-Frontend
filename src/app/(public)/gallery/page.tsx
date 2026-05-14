import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { Pagination } from "@/components/public/Pagination";
import { getGallery } from "@/lib/api/public.api";
import { listCategories } from "@/lib/api/categories.api";
import { timeAgo } from "@/lib/utils/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photo gallery",
  description: "Stories told in pictures from across the Deligo newsroom.",
};

interface RouteParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readPage(v: string | string[] | undefined): number {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default async function GalleryPage({ searchParams }: RouteParams) {
  const sp = await searchParams;
  const page = readPage(sp.page);
  const [result, categories] = await Promise.all([
    getGallery(page, 24),
    listCategories().catch(() => []),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const totalPages = result.meta?.totalPages ?? 1;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <SectionTitle>In pictures</SectionTitle>
      {result.items.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-4 py-10 text-center">
          <p className="font-hand text-[12px] text-muted">
            No photo stories yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {result.items.map((a) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="group block border-[1.5px] border-ink rounded-sm overflow-hidden bg-paper-2"
            >
              <div className="relative w-full aspect-[4/3]">
                {a.featuredImage ? (
                  <Image
                    src={a.featuredImage.url}
                    alt={a.featuredImage.alt ?? a.headline}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, transparent 0 8px, rgba(0,0,0,0.05) 8px 9px)",
                    }}
                  />
                )}
              </div>
              <div className="p-2.5">
                <div className="flex items-center gap-1">
                  <Pill variant="default">
                    {categoryById.get(a.categoryId)?.name ?? "News"}
                  </Pill>
                </div>
                <h3 className="mt-1.5 serif text-[14px] font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-accent">
                  {a.headline}
                </h3>
                <div className="mt-1 font-hand text-[11px] text-muted">
                  {timeAgo(a.publishedAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={result.meta?.page ?? page}
        totalPages={totalPages}
        hrefFor={(p) => `/gallery?page=${p}`}
      />
    </div>
  );
}
