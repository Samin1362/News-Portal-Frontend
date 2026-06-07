// Sitemap (Phase 6 — SEO). The backend is the only source that knows every
// published article (it exposes them solely through its own sitemap — there's
// no "list all articles" public endpoint), so we reuse its sitemap as the
// data source. But we can't serve it verbatim:
//
//   1. The backend builds <loc> from its own PUBLIC_BASE_URL (the API host),
//      not the public reader domain.
//   2. It emits article URLs as `/articles/<slug>` (plural); the frontend
//      route is `/article/<slug>` (singular) — verbatim links would 404.
//
// So we proxy the backend XML and normalize every <loc> to this site's host +
// the correct frontend path. Static/category paths already match the frontend
// routes and only need the host swapped. Same-origin (served from SITE_URL),
// backend stays authoritative for *what* to include.

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://news-portal-backend-kxsj.onrender.com"
).replace(/\/$/, "");

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const BACKEND_SITEMAP = `${API_BASE}/api/v1/public/sitemap.xml`;

// Revalidate at most hourly — matches the backend's own sitemap cache.
export const revalidate = 3600;

/** Strip whatever host the backend used and re-root each loc at SITE_URL,
 *  mapping the backend's `/articles/` path onto the frontend's `/article/`. */
function normalizeLoc(raw: string): string {
  let path: string;
  try {
    const u = new URL(raw);
    path = u.pathname + u.search;
  } catch {
    path = raw.startsWith("/") ? raw : `/${raw}`;
  }

  if (path.startsWith("/articles/")) {
    path = `/article/${path.slice("/articles/".length)}`;
  }

  if (path !== "/") path = path.replace(/\/$/, "");
  return `${SITE_URL}${path}`;
}

function rewriteSitemap(xml: string): string {
  return xml.replace(
    /<loc>([^<]+)<\/loc>/g,
    (_m, loc: string) => `<loc>${normalizeLoc(loc)}</loc>`,
  );
}

export async function GET(): Promise<Response> {
  try {
    const upstream = await fetch(BACKEND_SITEMAP, { next: { revalidate: 3600 } });
    if (!upstream.ok) {
      return new Response("Sitemap temporarily unavailable", { status: 502 });
    }

    const xml = rewriteSitemap(await upstream.text());
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 502 });
  }
}
