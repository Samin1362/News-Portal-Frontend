"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import {
  deleteComment,
  listComments,
  listReplies,
  postComment,
  postReply,
  reportComment,
  toggleLike,
} from "@/lib/api/comments.api";
import type {
  CommentDTO,
  CommentWithRepliesDTO,
} from "@/lib/types/comment";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { commentErrorMessage } from "./utils";

interface Props {
  articleId: string;
  /** Mirrors article.isCommentsEnabled — when false, the whole composer/replies UI goes read-only. */
  isCommentsEnabled: boolean;
  /** Server-rendered count used as the initial total + skeleton hint. */
  initialCount: number;
}

const PAGE_SIZE = 20;
const REPLIES_LIMIT = 100;

/**
 * Phase 4 — Engagement.
 *
 * Client-side comments tree for an article page. Handles fetch + pagination,
 * post / reply / like / report / delete with optimistic UI for likes and
 * deletes, and respects the article's `isCommentsEnabled` flag.
 *
 * The signed-in user's `isCommentBlocked` flag is reflected by the backend
 * via 403 on write paths; we surface the message via toast and otherwise
 * leave the UI accessible (the user can still read + like? — actually no,
 * the backend rejects likes from comment-blocked users too, so we just
 * surface the toast and trust the server).
 */
export function CommentsSection({
  articleId,
  isCommentsEnabled,
  initialCount,
}: Props) {
  const { firebaseUser, profile, getIdToken } = useAuth();
  const toast = useToast();

  const isAuthenticated = Boolean(firebaseUser);
  const currentUserId = profile?.id ?? null;
  const isCommentBlocked = profile?.isCommentBlocked ?? false;

  const [items, setItems] = useState<CommentWithRepliesDTO[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (target: number, append: boolean) => {
      try {
        const token = await getIdToken();
        const result = await listComments(articleId, target, PAGE_SIZE, {
          token,
        });
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
        setPage(target);
        if (result.meta) {
          setTotalPages(result.meta.totalPages);
          setTotal(result.meta.total);
        }
        setError(null);
      } catch (err) {
        setError(commentErrorMessage(err));
      }
    },
    [articleId, getIdToken],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await fetchPage(1, false);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchPage]);

  async function handleLoadMore() {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      await fetchPage(page + 1, true);
    } finally {
      setLoadingMore(false);
    }
  }

  // ----- Post a new top-level comment -----
  async function handlePostComment(content: string): Promise<boolean> {
    if (!isAuthenticated) {
      toast.error("Please sign in to comment.");
      return false;
    }
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      const created = await postComment(articleId, content, token);
      if (created.status === "approved") {
        setItems((prev) => [
          { ...created, replies: [], totalReplies: 0 },
          ...prev,
        ]);
        setTotal((t) => t + 1);
        toast.success("Comment posted.");
      } else {
        toast.info("Comment submitted — awaiting moderation.");
      }
      return true;
    } catch (err) {
      toast.error(commentErrorMessage(err));
      return false;
    }
  }

  // ----- Post a reply -----
  async function handleReply(
    parentId: string,
    content: string,
  ): Promise<CommentDTO | null> {
    if (!isAuthenticated) {
      toast.error("Please sign in to reply.");
      return null;
    }
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      const created = await postReply(parentId, content, token);
      if (created.status === "approved") {
        setItems((prev) =>
          prev.map((item) =>
            item.id === parentId
              ? {
                  ...item,
                  replies: [...item.replies, created],
                  totalReplies: item.totalReplies + 1,
                }
              : item,
          ),
        );
        toast.success("Reply posted.");
        return created;
      }
      toast.info("Reply submitted — awaiting moderation.");
      return null;
    } catch (err) {
      toast.error(commentErrorMessage(err));
      return null;
    }
  }

  // ----- Like toggle (optimistic on parent state) -----
  async function handleLikeToggle(id: string): Promise<void> {
    if (!isAuthenticated) {
      toast.info("Please sign in to like.");
      return;
    }
    let snapshot: CommentWithRepliesDTO[] = [];
    setItems((prev) => {
      snapshot = prev;
      return prev.map((item) => applyLikeToggle(item, id));
    });
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      const updated = await toggleLike(id, token);
      // Server is the source of truth; rewrite the affected node from the
      // server response so race conditions converge.
      setItems((prev) => prev.map((item) => applyServerSync(item, updated)));
    } catch (err) {
      setItems(snapshot);
      toast.error(commentErrorMessage(err));
    }
  }

  // ----- Delete (own comment) -----
  async function handleDelete(id: string): Promise<boolean> {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Delete this comment? This can't be undone.");
      if (!ok) return false;
    }
    let snapshot: CommentWithRepliesDTO[] = [];
    let wasTopLevel = false;
    setItems((prev) => {
      snapshot = prev;
      const next: CommentWithRepliesDTO[] = [];
      for (const item of prev) {
        if (item.id === id) {
          wasTopLevel = true;
          continue;
        }
        next.push({
          ...item,
          replies: item.replies.filter((r) => r.id !== id),
          totalReplies: item.replies.some((r) => r.id === id)
            ? item.totalReplies - 1
            : item.totalReplies,
        });
      }
      return next;
    });
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      await deleteComment(id, token);
      if (wasTopLevel) setTotal((t) => Math.max(0, t - 1));
      toast.success("Comment removed.");
      return true;
    } catch (err) {
      setItems(snapshot);
      toast.error(commentErrorMessage(err));
      return false;
    }
  }

  // ----- Report -----
  async function handleReport(id: string, reason: string): Promise<void> {
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      await reportComment(id, reason, token);
      toast.success("Thanks — our editors will review it.");
    } catch (err) {
      toast.error(commentErrorMessage(err));
    }
  }

  // ----- Expand replies (replace initial 3 with full list) -----
  async function handleExpandReplies(parentId: string): Promise<CommentDTO[]> {
    try {
      const token = await getIdToken();
      const result = await listReplies(parentId, 1, REPLIES_LIMIT, { token });
      setItems((prev) =>
        prev.map((item) =>
          item.id === parentId
            ? {
                ...item,
                replies: result.items,
                totalReplies: result.meta?.total ?? result.items.length,
              }
            : item,
        ),
      );
      return result.items;
    } catch (err) {
      toast.error(commentErrorMessage(err));
      return [];
    }
  }

  return (
    <section
      id="comments"
      className="mt-10 border-[1.5px] border-ink rounded-sm bg-paper p-5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} aria-hidden className="text-accent" />
          <SectionTitle>
            Discussion {total > 0 ? `(${total})` : ""}
          </SectionTitle>
        </div>
        {!isCommentsEnabled ? (
          <span className="font-hand text-[11px] text-muted uppercase tracking-wider">
            Comments closed
          </span>
        ) : null}
      </div>

      {/* Composer */}
      <div className="mt-4">
        {!isCommentsEnabled ? (
          <NoticeBox tone="muted">
            Comments are disabled for this article.
          </NoticeBox>
        ) : !isAuthenticated ? (
          <NoticeBox tone="muted">
            <span className="text-ink font-sans text-[14px]">
              Join the conversation —{" "}
            </span>
            <Link
              href="/login"
              className="font-sans text-[14px] text-accent hover:underline"
            >
              sign in
            </Link>
            <span className="text-ink font-sans text-[14px]">
              {" "}
              or{" "}
            </span>
            <Link
              href="/register"
              className="font-sans text-[14px] text-accent hover:underline"
            >
              create an account
            </Link>
            <span className="text-ink font-sans text-[14px]">
              {" "}
              to comment.
            </span>
          </NoticeBox>
        ) : isCommentBlocked ? (
          <NoticeBox tone="error">
            Your commenting privileges have been revoked. Contact the editors
            if you think this is a mistake.
          </NoticeBox>
        ) : (
          <CommentForm
            placeholder="Share your perspective…"
            submitLabel="Post comment"
            onSubmit={handlePostComment}
            hint="Be respectful. Markdown is not supported."
          />
        )}
      </div>

      {/* Comment list */}
      <div className="mt-5 space-y-3">
        {loading ? (
          <CommentSkeleton />
        ) : error ? (
          <NoticeBox tone="error">
            {error}{" "}
            <button
              type="button"
              onClick={() => fetchPage(1, false)}
              className="font-hand text-[12px] text-accent hover:underline"
            >
              Retry
            </button>
          </NoticeBox>
        ) : items.length === 0 ? (
          <NoticeBox tone="muted">
            No comments yet — be the first.
          </NoticeBox>
        ) : (
          <>
            {items.map((item) => (
              <CommentItem
                key={item.id}
                comment={item}
                isAuthenticated={isAuthenticated}
                currentUserId={currentUserId}
                isCommentsEnabled={isCommentsEnabled}
                onLikeToggle={handleLikeToggle}
                onDelete={handleDelete}
                onReport={handleReport}
                onReply={handleReply}
                onExpandReplies={handleExpandReplies}
              />
            ))}
            {page < totalPages ? (
              <div className="pt-2 flex justify-center">
                <Btn
                  variant="default"
                  size="sm"
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more comments"}
                </Btn>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

// ---- Pure helpers for like-toggle on the items tree ----

function applyLikeToggle(
  item: CommentWithRepliesDTO,
  id: string,
): CommentWithRepliesDTO {
  if (item.id === id) return flipLike(item) as CommentWithRepliesDTO;
  const replyIdx = item.replies.findIndex((r) => r.id === id);
  if (replyIdx === -1) return item;
  const nextReplies = item.replies.slice();
  nextReplies[replyIdx] = flipLike(nextReplies[replyIdx]);
  return { ...item, replies: nextReplies };
}

function flipLike<T extends CommentDTO>(c: T): T {
  const wasLiked = c.hasLiked;
  return {
    ...c,
    hasLiked: !wasLiked,
    likeCount: Math.max(0, c.likeCount + (wasLiked ? -1 : 1)),
  };
}

function applyServerSync(
  item: CommentWithRepliesDTO,
  server: CommentDTO,
): CommentWithRepliesDTO {
  if (item.id === server.id) {
    return {
      ...item,
      hasLiked: server.hasLiked,
      likeCount: server.likeCount,
    };
  }
  const replyIdx = item.replies.findIndex((r) => r.id === server.id);
  if (replyIdx === -1) return item;
  const nextReplies = item.replies.slice();
  nextReplies[replyIdx] = {
    ...nextReplies[replyIdx],
    hasLiked: server.hasLiked,
    likeCount: server.likeCount,
  };
  return { ...item, replies: nextReplies };
}

// ---- Tiny presentational helpers ----

function NoticeBox({
  tone,
  children,
}: {
  tone: "muted" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        tone === "error"
          ? "border-[1.5px] border-accent rounded-sm bg-paper px-3 py-2.5"
          : "border-[1.5px] border-dashed border-ink/40 rounded-sm bg-paper-2 px-3 py-2.5"
      }
    >
      {children}
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="border-[1.5px] border-ink/20 rounded-sm bg-paper p-3"
        >
          <div className="flex items-center gap-2">
            <span className="block w-7 h-7 rounded-full bg-paper-2 border border-ink/20" />
            <div className="flex flex-col gap-1">
              <span className="block h-3 w-32 bg-paper-2 rounded-sm" />
              <span className="block h-2 w-16 bg-paper-2 rounded-sm" />
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            <span className="block h-3 w-full bg-paper-2 rounded-sm" />
            <span className="block h-3 w-4/5 bg-paper-2 rounded-sm" />
            <span className="block h-3 w-2/5 bg-paper-2 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
