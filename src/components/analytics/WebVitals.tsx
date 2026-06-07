"use client";

import { useReportWebVitals } from "next/web-vitals";

// Web Vitals reporter (Phase 6 — SEO/Performance). Confined to its own client
// component so the root layout stays a Server Component (per the Next.js docs
// recommendation). Sink-agnostic: if `NEXT_PUBLIC_WEB_VITALS_URL` is set, each
// metric is beaconed there as JSON; otherwise metrics are logged in
// development and dropped in production. Swap in Vercel Analytics / Speed
// Insights at deploy time (Phase 8) by pointing the env var at the collector
// or replacing the body of `report`.

const ENDPOINT = process.env.NEXT_PUBLIC_WEB_VITALS_URL;

// Defined at module scope so the callback reference is stable across renders
// (prevents duplicate reporting — see the useReportWebVitals docs).
function report(metric: {
  id: string;
  name: string;
  value: number;
  rating: string;
  delta: number;
  navigationType: string;
}) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    ts: Date.now(),
  });

  if (ENDPOINT && typeof navigator !== "undefined") {
    // sendBeacon survives page unload; fall back to fetch keepalive.
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(ENDPOINT, body);
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.debug(`[web-vitals] ${metric.name}`, Math.round(metric.value), metric.rating);
  }
}

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
