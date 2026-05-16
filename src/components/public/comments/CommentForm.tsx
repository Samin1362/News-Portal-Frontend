"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Btn } from "@/components/ui/Btn";
import { cn } from "@/lib/utils/cn";

interface Props {
  placeholder: string;
  /** Submit-button label. "Post" / "Reply". */
  submitLabel: string;
  /** Returns true if the form should clear itself after submission. */
  onSubmit: (content: string) => Promise<boolean>;
  /** Optional cancel handler (renders a secondary "Cancel" button). */
  onCancel?: () => void;
  /** When true, the textarea autofocuses on mount. */
  autoFocus?: boolean;
  /** Smaller padding + textarea for reply use. */
  size?: "default" | "compact";
  /** Disable the form entirely (e.g. comments disabled on the article). */
  disabled?: boolean;
  /** Helper line beneath the input. */
  hint?: string;
}

const MAX = 2000;
const MIN = 1;

export function CommentForm({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus = false,
  size = "default",
  disabled = false,
  hint,
}: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (autoFocus && taRef.current) taRef.current.focus();
  }, [autoFocus]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < MIN || trimmed.length > MAX || submitting || disabled)
      return;
    setSubmitting(true);
    try {
      const clear = await onSubmit(trimmed);
      if (clear) setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  const tooLong = content.length > MAX;
  const canSubmit =
    !submitting && !disabled && !tooLong && content.trim().length >= MIN;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border-[1.5px] border-ink rounded-sm bg-paper",
        size === "compact" ? "p-2.5" : "p-3",
      )}
      noValidate
    >
      <textarea
        ref={taRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={size === "compact" ? 2 : 3}
        maxLength={MAX + 200}
        aria-invalid={tooLong || undefined}
        className={cn(
          "w-full bg-transparent outline-none resize-y font-sans leading-relaxed text-ink",
          size === "compact" ? "text-[13px]" : "text-[14px]",
          "placeholder:text-muted disabled:opacity-60",
        )}
      />
      <div className="mt-2 flex items-center gap-2">
        {hint ? (
          <span className="font-hand text-[11px] text-muted">{hint}</span>
        ) : null}
        <span
          className={cn(
            "ml-auto font-hand text-[10px]",
            tooLong ? "text-accent" : "text-muted",
          )}
          aria-live="polite"
        >
          {content.length}/{MAX}
        </span>
        {onCancel ? (
          <Btn
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Btn>
        ) : null}
        <Btn
          type="submit"
          variant="primary"
          size="sm"
          disabled={!canSubmit}
        >
          {submitting ? "Posting…" : submitLabel}
        </Btn>
      </div>
    </form>
  );
}
