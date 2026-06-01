"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRequireRole } from "@/lib/auth/useRequireRole";
import { useToast } from "@/lib/ui/toast";
import {
  deleteArticle,
  listMine,
  type ListMineQuery,
} from "@/lib/api/articles.api";
import { listCategories } from "@/lib/api/categories.api";
import type { ArticleStatus } from "@/lib/types/article";
import { shortDate } from "@/lib/utils/format";
import { StatusPill } from "@/components/dashboard/articles/StatusPill";
import { Pagination } from "@/components/public/Pagination";

const STATUS_TABS: Array<{ key: "all" | ArticleStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "In review" },
  { key: "approved", label: "Approved" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
  { key: "archived", label: "Archived" },
];

const PAGE_SIZE = 20;

export default function MyArticlesPage() {
  const guard = useRequireRole(["journalist", "editor", "admin"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getIdToken } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const status = (searchParams.get("status") ?? "all") as
    | "all"
    | ArticleStatus;
  const page = Number(searchParams.get("page") ?? "1");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  // Which rows are expanded in the mobile accordion (independent toggles so
  // a journalist can open several at once). Desktop ignores this entirely.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const apiQuery: ListMineQuery = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      page,
      limit: PAGE_SIZE,
    }),
    [status, page],
  );

  const articlesQuery = useQuery({
    enabled: guard.isAllowed,
    queryKey: ["articles", "mine", apiQuery],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      return listMine(apiQuery, token);
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories", "all"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });

  const categoryById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categoriesQuery.data ?? []) map.set(c.id, c.name);
    return map;
  }, [categoriesQuery.data]);

  const items = useMemo(
    () => articlesQuery.data?.items ?? [],
    [articlesQuery.data],
  );
  const meta = articlesQuery.data?.meta;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (a) =>
        a.headline.toLowerCase().includes(term) ||
        a.summary.toLowerCase().includes(term),
    );
  }, [items, search]);

  function setQueryParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value == null || value === "") params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    router.replace(`/dashboard/articles?${params.toString()}`);
  }

  async function handleDelete(id: string, headline: string) {
    if (!window.confirm(`Delete draft "${headline}"? This can't be undone.`))
      return;
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      await deleteArticle(id, token);
      toast.success("Draft deleted.");
      qc.invalidateQueries({ queryKey: ["articles", "mine"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete.");
    }
  }

  if (guard.loading || !guard.isAllowed) {
    return (
      <p className="font-hand text-[12px] text-muted">Checking access…</p>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SectionTitle>My articles</SectionTitle>
        <Btn variant="primary">
          <Link
            href="/dashboard/articles/new"
            className="inline-flex items-center gap-1"
          >
            <Plus size={14} aria-hidden />
            New article
          </Link>
        </Btn>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center flex-wrap gap-1.5">
          {STATUS_TABS.map((t) => {
            const active = status === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setQueryParam("status", t.key === "all" ? null : t.key)}
                className={
                  active
                    ? "px-2.5 py-1 border-[1.5px] border-ink rounded-full font-hand text-[11px] bg-ink text-paper"
                    : "px-2.5 py-1 border-[1.5px] border-ink rounded-full font-hand text-[11px] hover:bg-paper-2"
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <label className="ml-auto flex items-center gap-1 border-[1.5px] border-ink rounded-sm bg-paper px-2 h-9 min-w-[200px]">
          <Search size={14} aria-hidden className="text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search loaded results"
            className="flex-1 bg-transparent outline-none font-sans text-[13px] placeholder:text-muted"
          />
        </label>
      </div>

      {/* Table — md+ only. On mobile the 5 columns don't fit, so an
          accordion below takes over (see the md:hidden block). */}
      <div className="hidden md:block border-[1.5px] border-ink rounded-sm bg-paper overflow-hidden">
        <table className="w-full font-sans text-[13px]">
          <thead className="bg-paper-2 border-b-[1.5px] border-ink">
            <tr className="text-left">
              <th className="px-3 py-2 font-semibold">Headline</th>
              <th className="px-3 py-2 font-semibold w-[110px]">Status</th>
              <th className="px-3 py-2 font-semibold w-[140px]">Category</th>
              <th className="px-3 py-2 font-semibold w-[120px]">Updated</th>
              <th className="px-3 py-2 font-semibold w-[120px] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {articlesQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  Loading articles…
                </td>
              </tr>
            ) : articlesQuery.isError ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-accent">
                  Couldn&apos;t load your articles.{" "}
                  <button
                    type="button"
                    onClick={() => articlesQuery.refetch()}
                    className="underline"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  {items.length === 0
                    ? "No articles yet — start your first draft."
                    : "No matches for that search."}
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-black/10 hover:bg-paper-2"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/dashboard/articles/${a.id}/edit`}
                      className="font-semibold text-ink hover:text-accent"
                    >
                      {a.headline}
                    </Link>
                    <div className="font-hand text-[11px] text-muted truncate max-w-[480px]">
                      {a.summary}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {categoryById.get(a.categoryId) ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {shortDate(a.updatedAt)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/dashboard/articles/${a.id}/edit`}
                        aria-label="Edit"
                        className="inline-flex items-center justify-center w-8 h-8 border-[1.5px] border-ink rounded-sm hover:bg-paper-2"
                      >
                        <Pencil size={12} aria-hidden />
                      </Link>
                      {a.status === "draft" || a.status === "rejected" ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id, a.headline)}
                          aria-label="Delete"
                          className="inline-flex items-center justify-center w-8 h-8 border-[1.5px] border-ink rounded-sm hover:bg-accent hover:text-paper"
                        >
                          <Trash2 size={12} aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile accordion — replaces the table below md. Each row collapses
          to headline + status; tapping reveals summary, category, updated
          date, and the same Edit / Delete actions. */}
      <div className="md:hidden">
        {articlesQuery.isLoading ? (
          <div className="border-[1.5px] border-ink rounded-sm bg-paper px-3 py-6 text-center text-muted font-sans text-[13px]">
            Loading articles…
          </div>
        ) : articlesQuery.isError ? (
          <div className="border-[1.5px] border-ink rounded-sm bg-paper px-3 py-6 text-center text-accent font-sans text-[13px]">
            Couldn&apos;t load your articles.{" "}
            <button
              type="button"
              onClick={() => articlesQuery.refetch()}
              className="underline"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-[1.5px] border-ink rounded-sm bg-paper px-3 py-6 text-center text-muted font-sans text-[13px]">
            {items.length === 0
              ? "No articles yet — start your first draft."
              : "No matches for that search."}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((a) => {
              const open = expandedIds.has(a.id);
              const canDelete =
                a.status === "draft" || a.status === "rejected";
              return (
                <li
                  key={a.id}
                  className="border-[1.5px] border-ink rounded-sm bg-paper overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(a.id)}
                    aria-expanded={open}
                    aria-controls={`article-acc-${a.id}`}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1.5 mb-1">
                        <StatusPill status={a.status} />
                      </span>
                      <span className="block font-sans font-semibold text-ink text-[14px] leading-snug line-clamp-2">
                        {a.headline}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      aria-hidden
                      className={cn(
                        "shrink-0 mt-1 text-muted transition-transform duration-200",
                        open ? "rotate-180" : "rotate-0",
                      )}
                    />
                  </button>

                  <div
                    id={`article-acc-${a.id}`}
                    inert={!open}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-3 pb-3 border-t border-black/10 pt-2.5 flex flex-col gap-2.5">
                        {a.summary ? (
                          <p className="font-hand text-[12px] text-muted leading-relaxed">
                            {a.summary}
                          </p>
                        ) : null}
                        <dl className="grid grid-cols-2 gap-2.5">
                          <div>
                            <dt className="font-hand text-[10px] uppercase tracking-wider text-muted">
                              Category
                            </dt>
                            <dd className="font-sans text-[13px] text-ink mt-0.5">
                              {categoryById.get(a.categoryId) ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-hand text-[10px] uppercase tracking-wider text-muted">
                              Updated
                            </dt>
                            <dd className="font-sans text-[13px] text-ink mt-0.5">
                              {shortDate(a.updatedAt)}
                            </dd>
                          </div>
                        </dl>
                        <div className="flex items-center gap-2 pt-0.5">
                          <Link
                            href={`/dashboard/articles/${a.id}/edit`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 border-[1.5px] border-ink rounded-sm font-hand text-[13px] hover:bg-paper-2"
                          >
                            <Pencil size={13} aria-hidden /> Edit
                          </Link>
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(a.id, a.headline)}
                              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 border-[1.5px] border-ink rounded-sm font-hand text-[13px] hover:bg-accent hover:text-paper"
                            >
                              <Trash2 size={13} aria-hidden /> Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {meta && meta.totalPages > 1 ? (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hrefFor={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(p));
            return `/dashboard/articles?${params.toString()}`;
          }}
        />
      ) : null}
    </>
  );
}
