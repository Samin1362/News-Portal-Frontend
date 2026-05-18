"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  ImageIcon,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Card, CardHead, CardMoreLink, CardTitle } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Spark } from "@/components/ui/Spark";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listMine } from "@/lib/api/articles.api";
import { useJournalistCounts } from "@/hooks/useJournalistCounts";
import { StatusPill } from "@/components/dashboard/articles/StatusPill";
import { Greeting } from "@/components/dashboard/Greeting";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const JOURNALIST_ROLES = ["journalist", "editor", "admin"] as const;

function fmt(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

export default function DashboardOverview() {
  const { profile, role, getIdToken } = useAuth();
  const isJournalist =
    role !== null && (JOURNALIST_ROLES as readonly string[]).includes(role);

  const { counts, isLoading: countsLoading } = useJournalistCounts();

  const recentDrafts = useQuery({
    enabled: isJournalist,
    queryKey: ["dashboard", "recent-drafts", profile?.id],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      return listMine({ limit: 5 }, token);
    },
    staleTime: 30_000,
  });

  const items = recentDrafts.data?.items ?? [];
  const greetingMeta = counts
    ? `${counts.draft} ${counts.draft === 1 ? "draft" : "drafts"} · ${counts.review} awaiting review`
    : undefined;

  return (
    <>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <Greeting meta={greetingMeta} />
        {isJournalist ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Pill variant="green" dot>
              on shift
            </Pill>
            <Btn variant="primary" size="sm">
              <Link
                href="/dashboard/articles/new"
                className="inline-flex items-center gap-1.5"
              >
                <Plus size={12} aria-hidden /> Write new article
              </Link>
            </Btn>
          </div>
        ) : null}
      </div>

      {isJournalist ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            accent
            label="Drafts"
            value={countsLoading ? "—" : fmt(counts?.draft)}
            meta="ready to keep writing"
            spark={
              <Spark
                points="0,20 10,18 20,14 30,18 40,10 50,12 60,6 70,8"
                stroke="var(--color-accent)"
                delayMs={120}
              />
            }
          />
          <KpiCard
            label="Awaiting review"
            value={countsLoading ? "—" : fmt(counts?.review)}
            meta="submitted, with the desk"
            spark={
              <Spark
                points="0,22 10,18 20,16 30,12 40,14 50,10 60,8 70,4"
                delayMs={220}
              />
            }
          />
          <KpiCard
            label="Published"
            value={countsLoading ? "—" : fmt(counts?.published)}
            meta="live on the site"
            spark={
              <Spark
                points="0,18 10,16 20,18 30,14 40,16 50,10 60,12 70,8"
                stroke="var(--color-accent-2)"
                delayMs={320}
              />
            }
          />
          <KpiCard
            label="Rejected"
            value={countsLoading ? "—" : fmt(counts?.rejected)}
            meta="needs your rewrite"
            spark={
              <Spark
                points="0,24 10,22 20,16 30,18 40,14 50,18 60,16 70,12"
                stroke="var(--color-accent)"
                delayMs={420}
              />
            }
          />
        </div>
      ) : (
        <Card>
          <CardHead>
            <CardTitle>Reader account</CardTitle>
            <Pill variant="default">Role: {role ?? "reader"}</Pill>
          </CardHead>
          <p className="font-sans text-[14px] text-ink">
            Manage your{" "}
            <Link href="/profile" className="text-accent hover:underline">
              profile
            </Link>
            . Need to write articles? Ask an admin to upgrade your role.
          </p>
        </Card>
      )}

      {isJournalist ? (
        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
          <Card>
            <CardHead>
              <CardTitle>Recent drafts</CardTitle>
              <CardMoreLink href="/dashboard/articles">All →</CardMoreLink>
            </CardHead>

            {recentDrafts.isLoading && items.length === 0 ? (
              <ol className="flex flex-col gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li
                    key={i}
                    className="border-[1.5px] border-ink/15 rounded-sm bg-paper-2 h-[58px] animate-pulse"
                  />
                ))}
              </ol>
            ) : recentDrafts.isError ? (
              <p className="font-hand text-[12px] text-accent">
                Couldn&apos;t load your recent drafts.{" "}
                <button
                  type="button"
                  onClick={() => recentDrafts.refetch()}
                  className="underline"
                >
                  Retry
                </button>
              </p>
            ) : items.length === 0 ? (
              <p className="font-hand text-[13px] text-muted">
                No drafts yet — start a new article from the button above.
              </p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {items.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/dashboard/articles/${a.id}/edit`}
                      className={cn(
                        "row-hov flex items-start gap-2.5 border-[1.5px] border-ink rounded-sm bg-paper p-2.5",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <StatusPill status={a.status} />
                          <span className="font-hand text-[11px] text-muted">
                            updated {timeAgo(a.updatedAt)}
                          </span>
                        </div>
                        <p className="serif text-[15px] font-extrabold tracking-[-0.01em] leading-snug line-clamp-2">
                          {a.headline}
                        </p>
                        {a.summary ? (
                          <p className="font-sans text-[12.5px] text-muted line-clamp-1 mt-0.5">
                            {a.summary}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <div className="flex flex-col gap-4 min-w-0">
            <Card>
              <CardHead>
                <CardTitle>Quick actions</CardTitle>
              </CardHead>
              <ul className="flex flex-col gap-1.5">
                <QuickLink
                  href="/dashboard/articles/new"
                  icon={<Plus size={14} aria-hidden />}
                  label="Start a new draft"
                />
                <QuickLink
                  href="/dashboard/articles"
                  icon={<FileText size={14} aria-hidden />}
                  label="All my articles"
                />
                <QuickLink
                  href="/dashboard/media"
                  icon={<ImageIcon size={14} aria-hidden />}
                  label="Media library"
                />
                <QuickLink
                  href="/profile"
                  icon={<UserRound size={14} aria-hidden />}
                  label="Edit profile"
                />
                <QuickLink
                  href="/dashboard/settings"
                  icon={<Settings size={14} aria-hidden />}
                  label="Settings"
                />
              </ul>
            </Card>

            <Card>
              <CardHead>
                <CardTitle>Newsroom tip</CardTitle>
              </CardHead>
              <p className="font-sans text-[13px] text-ink/85 leading-relaxed">
                Submit drafts before noon to land them in the morning desk
                review. Rejected pieces flow back here with editor notes so
                you can rework and resubmit.
              </p>
            </Card>
          </div>
        </section>
      ) : null}
    </>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="row-hov flex items-center gap-2.5 border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2 font-hand text-[13px] text-ink"
      >
        <span className="text-accent">{icon}</span>
        <span className="grow">{label}</span>
        <span className="font-hand text-[12px] text-muted">→</span>
      </Link>
    </li>
  );
}
