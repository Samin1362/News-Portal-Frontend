"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Btn } from "@/components/ui/Btn";
import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

const MIN = 3;
const MAX = 500;
const QUICK_REASONS = [
  "Spam or advertising",
  "Harassment or hate speech",
  "Off-topic",
  "Misinformation",
];

/**
 * Lightweight modal for reporting a comment. Locks body scroll while open
 * and closes on Escape. Submits to the parent via `onSubmit`, which is
 * responsible for posting to the API and surfacing success / error toasts.
 */
export function ReportDialog({ open, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isClient = useIsClient();
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Clear the textarea each time the dialog opens. Done during render via a
  // previous-value compare (not an effect) so no setState runs in an effect
  // body.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setReason("");
  }

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => taRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  if (!open || !isClient) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < MIN || trimmed.length > MAX || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setSubmitting(false);
    }
  }

  const tooShort = reason.trim().length > 0 && reason.trim().length < MIN;
  const tooLong = reason.length > MAX;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close report dialog"
        className="fixed inset-0 bg-ink/40 z-[60]"
        onClick={() => (submitting ? null : onClose())}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="fixed inset-0 z-[61] flex items-center justify-center px-4"
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[420px] bg-paper border-[1.5px] border-ink rounded-sm p-4 shadow-md"
          noValidate
        >
          <h2
            id="report-dialog-title"
            className="serif text-[18px] font-extrabold tracking-tight"
          >
            Report comment
          </h2>
          <p className="mt-1 font-hand text-[11px] text-muted">
            Tell our editors what&apos;s wrong. Reports are reviewed by
            moderators.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "px-2 py-0.5 border-[1.5px] border-ink rounded-full font-hand text-[11px]",
                  reason === r
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink hover:bg-paper-2",
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <label className="block mt-3">
            <span className="font-sans text-[12px] font-semibold text-ink">
              Reason
            </span>
            <textarea
              ref={taRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={MAX + 100}
              className={cn(
                "mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2",
                "font-sans text-[14px] placeholder:text-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y",
                (tooShort || tooLong) && "border-accent",
              )}
              placeholder="Briefly describe the issue…"
              aria-invalid={tooShort || tooLong || undefined}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="font-hand text-[11px] text-accent">
                {tooShort
                  ? `At least ${MIN} characters.`
                  : tooLong
                    ? `Max ${MAX} characters.`
                    : ""}
              </span>
              <span className="font-hand text-[10px] text-muted">
                {reason.length}/{MAX}
              </span>
            </div>
          </label>

          <div className="mt-3 flex items-center justify-end gap-2">
            <Btn
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Btn>
            <Btn
              type="submit"
              variant="primary"
              size="sm"
              disabled={
                submitting ||
                reason.trim().length < MIN ||
                reason.length > MAX
              }
            >
              {submitting ? "Sending…" : "Submit report"}
            </Btn>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
}
