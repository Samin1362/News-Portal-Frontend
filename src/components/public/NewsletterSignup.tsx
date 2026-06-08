"use client";

import { useEffect, useId, useState } from "react";
import { z } from "zod";
import { Check, Mail } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { useToast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "deligo.newsletter";
const EmailSchema = z.string().trim().email();

interface StoredCapture {
  email: string;
  at: string;
  status: "subscribed" | "pending";
}

/**
 * Honest newsletter capture (Phase 4). Posts to `/api/newsletter`, which either
 * forwards to a configured provider (→ "subscribed") or, with no provider,
 * accepts the address (→ "pending"). Either way we record it locally so a
 * returning reader sees the confirmed state instead of an empty form — and we
 * never show a dead field.
 *
 * Two looks: `footer` (compact, on the footer's paper-2) and `inline` (a
 * bordered call-to-action card at the end of an article).
 */
export function NewsletterSignup({
  variant = "footer",
  className,
}: {
  variant?: "footer" | "inline";
  className?: string;
}) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inline = variant === "inline";
  const inputId = useId();

  // Surface the confirmed state for readers who already signed up (deferred
  // setState so we don't update synchronously inside the effect body).
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      raw = null;
    }
    if (!raw) return;
    const id = window.setTimeout(() => setDone(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = EmailSchema.safeParse(email);
    if (!valid.success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: valid.data }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; status?: StoredCapture["status"]; message?: string }
        | null;

      if (!res.ok || !json?.ok) {
        toast.error(json?.message ?? "Something went wrong. Please try again.");
        return;
      }

      const status: StoredCapture["status"] =
        json.status === "subscribed" ? "subscribed" : "pending";
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            email: valid.data,
            at: new Date().toISOString(),
            status,
          } satisfies StoredCapture),
        );
      } catch {
        // localStorage unavailable — non-fatal.
      }
      setDone(true);
      toast.success(
        status === "subscribed"
          ? "You're subscribed. Watch your inbox."
          : "You're on the list — we'll email you when it launches.",
      );
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 font-sans text-[13px] text-ink",
          inline &&
            "border-[1.5px] border-accent-2 rounded-sm bg-paper px-4 py-3",
          className,
        )}
      >
        <Check
          size={16}
          aria-hidden
          className="text-accent-2 shrink-0"
        />
        <span>
          Thanks — you&apos;re on the list. We&apos;ll email you when the Deligo
          newsletter launches.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        inline &&
          "border-[1.5px] border-ink rounded-sm bg-paper-2 px-4 py-4 sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Mail size={inline ? 16 : 13} aria-hidden className="text-accent" />
        <span
          className={cn(
            "serif font-bold tracking-tight",
            inline ? "text-[18px]" : "text-[14px]",
          )}
        >
          The Deligo Daily
        </span>
      </div>
      <p
        className={cn(
          "font-hand text-muted mt-1",
          inline ? "text-[12px]" : "text-[11px] leading-snug",
        )}
      >
        Top stories in your inbox each morning. No spam, unsubscribe anytime.
      </p>

      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div className={cn("mt-2.5 flex gap-2", inline ? "flex-col sm:flex-row" : "flex-col")}>
        <input
          id={inputId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className={cn(
            "flex-1 min-w-0 border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2",
            "font-sans text-[14px] placeholder:text-muted",
            "focus:outline-none focus:ring-2 focus:ring-accent/30",
          )}
        />
        <Btn
          type="submit"
          variant="primary"
          size="md"
          disabled={submitting}
          className="shrink-0"
        >
          {submitting ? "Joining…" : "Subscribe"}
        </Btn>
      </div>
    </form>
  );
}
