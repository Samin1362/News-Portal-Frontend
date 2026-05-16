"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listMine } from "@/lib/api/articles.api";
import type { ArticleStatus } from "@/lib/types/article";

const JOURNALIST_ROLES = ["journalist", "editor", "admin"] as const;

interface Stat {
  label: string;
  href: string;
  status?: ArticleStatus | "review";
}

const STATS: Stat[] = [
  { label: "Drafts", href: "/dashboard/articles?status=draft", status: "draft" },
  {
    label: "Awaiting review",
    href: "/dashboard/articles?status=submitted",
    status: "review",
  },
  {
    label: "Published",
    href: "/dashboard/articles?status=published",
    status: "published",
  },
  {
    label: "Rejected",
    href: "/dashboard/articles?status=rejected",
    status: "rejected",
  },
];

/**
 * Dashboard overview. Real counts from `GET /articles/me?status=` per slot.
 * "Awaiting review" sums submitted + under_review (the backend doesn't have a
 * combined query for them, so we make two calls).
 */
export default function DashboardOverview() {
  const { profile, role, getIdToken } = useAuth();
  const isJournalist =
    role !== null && (JOURNALIST_ROLES as readonly string[]).includes(role);

  const counts = useQuery({
    enabled: isJournalist,
    queryKey: ["dashboard", "stats", profile?.id],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      const [drafts, submitted, underReview, published, rejected] =
        await Promise.all([
          listMine({ status: "draft", limit: 1 }, token),
          listMine({ status: "submitted", limit: 1 }, token),
          listMine({ status: "under_review", limit: 1 }, token),
          listMine({ status: "published", limit: 1 }, token),
          listMine({ status: "rejected", limit: 1 }, token),
        ]);
      return {
        draft: drafts.meta?.total ?? 0,
        review:
          (submitted.meta?.total ?? 0) + (underReview.meta?.total ?? 0),
        published: published.meta?.total ?? 0,
        rejected: rejected.meta?.total ?? 0,
      };
    },
    staleTime: 30_000,
  });

  return (
    <div className="max-w-[1080px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SectionTitle>
          {profile ? `Hello, ${profile.displayName}` : "Overview"}
        </SectionTitle>
        {isJournalist ? (
          <Btn variant="primary">
            <Link href="/dashboard/articles/new">Write new article</Link>
          </Btn>
        ) : null}
      </div>

      {isJournalist ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s) => {
            const value = counts.data
              ? s.status === "review"
                ? counts.data.review
                : counts.data[s.status as "draft" | "published" | "rejected"]
              : null;
            return (
              <Link
                key={s.label}
                href={s.href}
                className="block border-[1.5px] border-ink rounded-sm bg-paper p-4 hover:bg-paper-2 transition-colors"
              >
                <div className="font-hand text-[11px] text-muted uppercase tracking-wider">
                  {s.label}
                </div>
                <div className="serif text-[32px] font-extrabold leading-none mt-1">
                  {counts.isLoading ? "—" : (value ?? "—")}
                </div>
                <div className="font-hand text-[11px] text-muted mt-1">
                  Tap to filter the list
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="border-[1.5px] border-ink rounded-sm bg-paper p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="serif text-[16px] font-bold tracking-tight">
              Reader account
            </h3>
            <Pill variant="default">Role: {role ?? "reader"}</Pill>
          </div>
          <p className="font-sans text-[14px] text-ink">
            Manage your{" "}
            <Link href="/profile" className="text-accent hover:underline">
              profile
            </Link>
            . Need to write articles? Ask an admin to upgrade your role.
          </p>
        </div>
      )}

      {isJournalist ? (
        <div className="border-[1.5px] border-ink rounded-sm bg-paper p-5">
          <h3 className="serif text-[16px] font-bold tracking-tight">
            Quick actions
          </h3>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-[14px] text-ink">
            <li>
              <Link
                href="/dashboard/articles"
                className="text-accent hover:underline"
              >
                → All my articles
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/articles/new"
                className="text-accent hover:underline"
              >
                → Start a new draft
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/media"
                className="text-accent hover:underline"
              >
                → Media library
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className="text-accent hover:underline"
              >
                → Edit profile
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
