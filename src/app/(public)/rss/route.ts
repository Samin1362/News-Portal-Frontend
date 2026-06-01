import { getHomepage } from "@/lib/api/public.api";
import type { ArticleCardDTO } from "@/lib/types/article";

// Rebuild the feed at most every 5 minutes (route handlers honour `revalidate`).
export const revalidate = 300;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const SITE_TITLE = "Deligo News";
const SITE_DESCRIPTION =
  "Breaking news, in-depth reporting, and multimedia stories from Deligo News.";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Dedupe by id, newest first, capped — built from the homepage payload. */
function collectItems(
  ...lists: ArticleCardDTO[][]
): ArticleCardDTO[] {
  const seen = new Set<string>();
  const out: ArticleCardDTO[] = [];
  for (const list of lists) {
    for (const a of list) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      out.push(a);
    }
  }
  return out
    .sort((x, y) => {
      const xt = x.publishedAt ? Date.parse(x.publishedAt) : 0;
      const yt = y.publishedAt ? Date.parse(y.publishedAt) : 0;
      return yt - xt;
    })
    .slice(0, 30);
}

function renderItem(a: ArticleCardDTO): string {
  const link = `${SITE_URL}/article/${encodeURIComponent(a.slug)}`;
  const pubDate = a.publishedAt
    ? new Date(a.publishedAt).toUTCString()
    : new Date(a.createdAt).toUTCString();
  return [
    "    <item>",
    `      <title>${escapeXml(a.headline)}</title>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
    `      <description>${escapeXml(a.summary)}</description>`,
    `      <pubDate>${pubDate}</pubDate>`,
    "    </item>",
  ].join("\n");
}

export async function GET(): Promise<Response> {
  const homepage = await getHomepage();
  const items = homepage
    ? collectItems(
        homepage.breaking,
        homepage.topHeadlines,
        homepage.featured,
        homepage.latest,
      )
    : [];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(SITE_TITLE)}</title>`,
    `    <link>${escapeXml(SITE_URL)}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    ...items.map(renderItem),
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
