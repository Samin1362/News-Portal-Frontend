"use client";

import Image from "next/image";
import { useState } from "react";
import { Flag, Heart, MessageCircle, Trash2 } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { ReportDialog } from "./ReportDialog";
import { initialsFor, relativeTime } from "./utils";
import { cn } from "@/lib/utils/cn";
import type { CommentDTO, CommentWithRepliesDTO } from "@/lib/types/comment";

interface SharedHandlers {
  isAuthenticated: boolean;
  currentUserId: string | null;
  isCommentsEnabled: boolean;
  /** Optimistically toggles like on the parent. */
  onLikeToggle: (id: string) => Promise<void>;
  /** Confirms + deletes. Returns true if removed. */
  onDelete: (id: string) => Promise<boolean>;
  /** Posts a report. */
  onReport: (id: string, reason: string) => Promise<void>;
}

interface TopLevelProps extends SharedHandlers {
  comment: CommentWithRepliesDTO;
  /** Posts a reply. Returns the new comment (if accepted) or null (pending). */
  onReply: (parentId: string, content: string) => Promise<CommentDTO | null>;
  /** Loads the full reply list, replacing the initial 3 from the server. */
  onExpandReplies: (parentId: string) => Promise<CommentDTO[]>;
}

export function CommentItem({
  comment,
  isAuthenticated,
  currentUserId,
  isCommentsEnabled,
  onLikeToggle,
  onDelete,
  onReport,
  onReply,
  onExpandReplies,
}: TopLevelProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const repliesShown = comment.replies.length;
  const moreReplies = Math.max(0, comment.totalReplies - repliesShown);
  const canExpand = moreReplies > 0 && !expanding;

  async function handleExpand() {
    if (!canExpand) return;
    setExpanding(true);
    try {
      await onExpandReplies(comment.id);
    } finally {
      setExpanding(false);
    }
  }

  return (
    <article className="border-[1.5px] border-ink rounded-sm bg-paper p-3">
      <CommentHeader comment={comment} />

      <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink whitespace-pre-wrap break-words">
        {comment.content}
      </p>

      <ActionRow
        comment={comment}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        isCommentsEnabled={isCommentsEnabled}
        onLikeToggle={onLikeToggle}
        onDelete={onDelete}
        onReport={() => setReportOpen(true)}
        onToggleReply={() => setShowReplyForm((v) => !v)}
        replyOpen={showReplyForm}
        showReplyButton
      />

      {showReplyForm && isAuthenticated && isCommentsEnabled ? (
        <div className="mt-2 pl-4 border-l-2 border-ink/15">
          <CommentForm
            placeholder={`Reply to ${comment.author?.displayName ?? "user"}…`}
            submitLabel="Reply"
            autoFocus
            size="compact"
            onCancel={() => setShowReplyForm(false)}
            onSubmit={async (content) => {
              const result = await onReply(comment.id, content);
              if (result) setShowReplyForm(false);
              return Boolean(result);
            }}
          />
        </div>
      ) : null}

      {comment.replies.length > 0 ? (
        <ul className="mt-3 pl-4 border-l-2 border-ink/15 space-y-2">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <ReplyItem
                reply={reply}
                isAuthenticated={isAuthenticated}
                currentUserId={currentUserId}
                isCommentsEnabled={isCommentsEnabled}
                onLikeToggle={onLikeToggle}
                onDelete={onDelete}
                onReport={onReport}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {canExpand ? (
        <button
          type="button"
          onClick={handleExpand}
          className="mt-2 ml-4 font-hand text-[12px] text-accent hover:underline"
        >
          {expanding
            ? "Loading…"
            : `Show ${moreReplies} more ${moreReplies === 1 ? "reply" : "replies"}`}
        </button>
      ) : null}

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={async (reason) => {
          await onReport(comment.id, reason);
          setReportOpen(false);
        }}
      />
    </article>
  );
}

interface ReplyProps extends SharedHandlers {
  reply: CommentDTO;
}

function ReplyItem({
  reply,
  isAuthenticated,
  currentUserId,
  isCommentsEnabled,
  onLikeToggle,
  onDelete,
  onReport,
}: ReplyProps) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="bg-paper-2 border-[1.5px] border-ink/30 rounded-sm p-2.5">
      <CommentHeader comment={reply} compact />
      <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-ink whitespace-pre-wrap break-words">
        {reply.content}
      </p>
      <ActionRow
        comment={reply}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        isCommentsEnabled={isCommentsEnabled}
        onLikeToggle={onLikeToggle}
        onDelete={onDelete}
        onReport={() => setReportOpen(true)}
        showReplyButton={false}
      />
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={async (reason) => {
          await onReport(reply.id, reason);
          setReportOpen(false);
        }}
      />
    </div>
  );
}

function CommentHeader({
  comment,
  compact = false,
}: {
  comment: CommentDTO;
  compact?: boolean;
}) {
  const name = comment.author?.displayName ?? "[deleted user]";
  const photo = comment.author?.photoURL ?? null;
  const isDeletedUser = comment.author == null;

  return (
    <header className="flex items-center gap-2">
      <Avatar name={name} photoURL={photo} size={compact ? 24 : 28} />
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-sans font-semibold text-ink truncate",
              compact ? "text-[12px]" : "text-[13px]",
              isDeletedUser && "italic text-muted",
            )}
          >
            {name}
          </span>
          {comment.status === "pending" ? (
            <span className="font-hand text-[10px] uppercase tracking-wider text-muted">
              Awaiting moderation
            </span>
          ) : null}
        </div>
        <time
          className="font-hand text-[10px] text-muted"
          dateTime={comment.createdAt}
        >
          {relativeTime(comment.createdAt)}
        </time>
      </div>
    </header>
  );
}

function Avatar({
  name,
  photoURL,
  size,
}: {
  name: string;
  photoURL: string | null;
  size: number;
}) {
  if (photoURL) {
    return (
      <Image
        src={photoURL}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="rounded-full border-[1.5px] border-ink object-cover bg-paper-2 shrink-0"
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full border-[1.5px] border-ink bg-paper-2 font-sans font-bold text-[10px] text-ink shrink-0"
    >
      {initialsFor(name)}
    </span>
  );
}

interface ActionRowProps {
  comment: CommentDTO;
  isAuthenticated: boolean;
  currentUserId: string | null;
  isCommentsEnabled: boolean;
  onLikeToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<boolean>;
  /** ActionRow only opens the report dialog; the parent owns the actual POST. */
  onReport: () => void;
  onToggleReply?: () => void;
  replyOpen?: boolean;
  showReplyButton: boolean;
}

function ActionRow({
  comment,
  isAuthenticated,
  currentUserId,
  isCommentsEnabled,
  onLikeToggle,
  onDelete,
  onReport,
  onToggleReply,
  replyOpen,
  showReplyButton,
}: ActionRowProps) {
  const [busy, setBusy] = useState(false);
  const isOwn =
    isAuthenticated &&
    comment.author != null &&
    currentUserId != null &&
    currentUserId === comment.author.id;

  async function handleLike() {
    if (busy) return;
    setBusy(true);
    try {
      await onLikeToggle(comment.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    try {
      await onDelete(comment.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-1 flex-wrap font-hand text-[11px] text-muted">
      <button
        type="button"
        onClick={handleLike}
        disabled={!isAuthenticated || busy}
        aria-pressed={comment.hasLiked}
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm transition-colors",
          comment.hasLiked ? "text-accent" : "hover:text-accent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        title={isAuthenticated ? "Like" : "Sign in to like"}
      >
        <Heart
          size={12}
          aria-hidden
          fill={comment.hasLiked ? "currentColor" : "none"}
        />
        {comment.likeCount}
      </button>

      {showReplyButton && onToggleReply ? (
        <button
          type="button"
          onClick={onToggleReply}
          disabled={!isAuthenticated || !isCommentsEnabled}
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:text-accent",
            replyOpen && "text-accent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          title={isAuthenticated ? "Reply" : "Sign in to reply"}
        >
          <MessageCircle size={12} aria-hidden />
          Reply
        </button>
      ) : null}

      {isAuthenticated && !isOwn ? (
        <button
          type="button"
          onClick={onReport}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:text-accent"
          title="Report"
        >
          <Flag size={12} aria-hidden />
          Report
        </button>
      ) : null}

      {isOwn ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:text-accent disabled:opacity-50"
          title="Delete"
        >
          <Trash2 size={12} aria-hidden />
          Delete
        </button>
      ) : null}
    </div>
  );
}
