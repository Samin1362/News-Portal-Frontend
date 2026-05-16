"use client";

import { ArticleForm } from "@/components/dashboard/articles/ArticleForm";
import { useRequireRole } from "@/lib/auth/useRequireRole";

export default function NewArticlePage() {
  const guard = useRequireRole(["journalist", "editor", "admin"]);

  if (guard.loading || !guard.isAllowed) {
    return (
      <p className="font-hand text-[12px] text-muted">Checking access…</p>
    );
  }

  return (
    <div className="max-w-[1180px] mx-auto">
      <ArticleForm />
    </div>
  );
}
