"use client";

import dynamic from "next/dynamic";

// Lazy boundary for the comments thread (Phase 6 — Performance). The full
// CommentsSection pulls in forms, the report dialog, optimistic-mutation
// state, and per-comment interactivity — none of which is needed for the
// initial article paint or for SEO (comments aren't indexed here). Splitting
// it into its own client chunk keeps that JS out of the critical path; it
// loads when the article body mounts on the client, behind a skeleton.
const CommentsSection = dynamic(
  () => import("./CommentsSection").then((m) => m.CommentsSection),
  {
    ssr: false,
    loading: () => <CommentsSkeleton />,
  },
);

function CommentsSkeleton() {
  return (
    <section className="mt-10 pt-6 border-t border-black/10" aria-busy="true">
      <div className="h-6 w-40 bg-paper-2 rounded-sm animate-pulse" />
      <div className="mt-4 h-24 w-full bg-paper-2 rounded-sm animate-pulse" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full bg-paper-2 rounded-sm animate-pulse"
            aria-hidden
          />
        ))}
      </div>
      <span className="sr-only">Loading comments…</span>
    </section>
  );
}

interface CommentsLazyProps {
  articleId: string;
  isCommentsEnabled: boolean;
  initialCount: number;
}

export function CommentsLazy(props: CommentsLazyProps) {
  return <CommentsSection {...props} />;
}
