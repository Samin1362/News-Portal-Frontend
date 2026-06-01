"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Btn } from "@/components/ui/Btn";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArticleForm } from "@/components/dashboard/articles/ArticleForm";
import { StatusPill } from "@/components/dashboard/articles/StatusPill";
import { useRequireRole } from "@/lib/auth/useRequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getById } from "@/lib/api/articles.api";
import { listCategories } from "@/lib/api/categories.api";
import type { ArticleFullDTO } from "@/lib/types/article";
import { shortDate } from "@/lib/utils/format";

const EDITABLE_FOR_JOURNALIST: ArticleFullDTO["status"][] = [
  "draft",
  "rejected",
];

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const guard = useRequireRole(["journalist", "editor", "admin"]);
  const { getIdToken, role } = useAuth();

  const articleQuery = useQuery({
    enabled: guard.isAllowed,
    queryKey: ["articles", "detail", id],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      return getById(id, token);
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories", "all"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });

  if (guard.loading || !guard.isAllowed) {
    return (
      <p className="font-hand text-[12px] text-muted">Checking access…</p>
    );
  }

  if (articleQuery.isLoading) {
    return (
      <p className="font-hand text-[12px] text-muted">Loading article…</p>
    );
  }

  if (articleQuery.isError || !articleQuery.data) {
    return (
      <div className="max-w-[680px] mx-auto border-[1.5px] border-accent rounded-sm bg-paper p-5">
        <h2 className="serif text-[18px] font-bold">Article not found</h2>
        <p className="mt-1 font-sans text-[13px] text-muted">
          It may have been deleted, or you don&apos;t have access.
        </p>
        <div className="mt-3">
          <Btn variant="default">
            <Link href="/dashboard/articles">Back to my articles</Link>
          </Btn>
        </div>
      </div>
    );
  }

  const article = articleQuery.data;
  const isEditable =
    role === "editor" || role === "admin"
      ? article.status !== "draft" || true // editors/admins can edit any non-draft via PATCH; drafts are owner-only
      : EDITABLE_FOR_JOURNALIST.includes(article.status);

  // Editors / admins also need draft access, but the backend only lets the
  // *owner* edit drafts. Mirror that here.
  const editorEditable =
    (role === "editor" || role === "admin") && article.status !== "draft";
  const journalistEditable =
    role === "journalist" && EDITABLE_FOR_JOURNALIST.includes(article.status);
  const canEdit = editorEditable || journalistEditable;

  if (!canEdit) {
    return (
      <ReadOnlyPreview
        article={article}
        categoryName={
          (categoriesQuery.data ?? []).find((c) => c.id === article.categoryId)
            ?.name ?? null
        }
      />
    );
  }

  // Suppress unused variable warning — we keep `isEditable` reasoning above
  // for documentation but the actual flow uses `canEdit`.
  void isEditable;

  return (
    <div className="max-w-[1180px] mx-auto">
      <ArticleForm article={article} />
    </div>
  );
}

function ReadOnlyPreview({
  article,
  categoryName,
}: {
  article: ArticleFullDTO;
  categoryName: string | null;
}) {
  return (
    <div className="max-w-[920px] mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <SectionTitle>Article preview</SectionTitle>
          <StatusPill status={article.status} />
        </div>
        <Btn variant="default">
          <Link href="/dashboard/articles">Back to list</Link>
        </Btn>
      </div>

      <div className="border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 p-3 font-hand text-[12px] text-muted">
        This article has moved past the journalist edit window.{" "}
        {article.status === "submitted" || article.status === "under_review"
          ? "An editor is reviewing it. You'll be able to edit again if it's rejected."
          : article.status === "approved"
            ? "Approved — waiting to be published."
            : article.status === "published"
              ? "Live on the public site."
              : article.status === "archived"
                ? "Archived from the public site."
                : ""}
      </div>

      <article className="border-[1.5px] border-ink rounded-sm bg-paper p-5 space-y-3">
        <div className="font-hand text-[11px] text-muted uppercase tracking-wider">
          {categoryName ?? "Uncategorised"}
        </div>
        <h1 className="serif text-[28px] font-extrabold tracking-tight leading-tight">
          {article.headline}
        </h1>
        <p className="font-sans text-[15px] text-ink/85">{article.summary}</p>
        <div className="font-hand text-[11px] text-muted">
          Updated {shortDate(article.updatedAt)} · last action{" "}
          {article.history.length > 0
            ? article.history[article.history.length - 1].action
            : "—"}
        </div>
        {article.featuredImage ? (
          <div className="relative w-full aspect-[16/9] border-[1.5px] border-ink rounded-sm overflow-hidden bg-paper-2">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt ?? ""}
              fill
              sizes="920px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div
          className="prose-deligo serif text-[16px] leading-[1.7] text-ink"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}
