import { revalidatePath } from "next/cache";

// On-demand ISR revalidation webhook (Phase 6 — SEO).
//
// KNOWN GAP: the backend does not currently call out on publish/update, so
// nothing hits this route yet — the public pages rely on time-based ISR
// (homepage 30s, articles/lists 60s) until a backend webhook lands. This
// handler is ready for that day: when the backend POSTs here on publish, the
// affected paths refresh immediately instead of waiting for the ISR window.
//
// Auth: a shared secret in `REVALIDATE_SECRET` (sent as `x-revalidate-secret`
// header or `?secret=`). If the env var is unset the route refuses every call
// so a misconfigured deploy can't be abused as an open revalidation endpoint.
//
// Body (JSON, all optional):
//   { "slug": "<article-slug>", "category": "<category-slug>",
//     "paths": ["/literal/path", ...] }
// With no body it revalidates the homepage only.

const SECRET = process.env.REVALIDATE_SECRET;

function isAuthorized(req: Request): boolean {
  if (!SECRET) return false;
  const header = req.headers.get("x-revalidate-secret");
  const query = new URL(req.url).searchParams.get("secret");
  return header === SECRET || query === SECRET;
}

interface RevalidateBody {
  slug?: string;
  category?: string;
  paths?: string[];
}

export async function POST(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return Response.json(
      { revalidated: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: RevalidateBody = {};
  try {
    const parsed: unknown = await req.json();
    if (parsed && typeof parsed === "object") body = parsed as RevalidateBody;
  } catch {
    // Empty / non-JSON body is fine — we default to revalidating the homepage.
  }

  const revalidated: string[] = [];
  const touch = (path: string) => {
    revalidatePath(path);
    revalidated.push(path);
  };

  // Homepage is always affected by a publish.
  touch("/");

  if (typeof body.slug === "string" && body.slug.length > 0) {
    touch(`/article/${body.slug}`);
  }
  if (typeof body.category === "string" && body.category.length > 0) {
    touch(`/category/${body.category}`);
  }
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p === "string" && p.startsWith("/")) touch(p);
    }
  }

  return Response.json({ revalidated: true, paths: revalidated, now: Date.now() });
}
