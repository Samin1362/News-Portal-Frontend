import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * robots.txt (Phase 6 — SEO). Crawlers get the full public surface; the
 * authenticated/app surfaces (dashboard, profile, auth flows, internal API
 * + revalidation routes) are disallowed. `Sitemap:` points back at this
 * frontend's own `/sitemap.xml`, which redirects to the backend's
 * authoritative sitemap (see `app/sitemap.xml/route.ts`).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/profile",
        "/profile/",
        "/login",
        "/register",
        "/forgot-password",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
