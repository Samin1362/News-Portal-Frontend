"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { Card, CardHead, CardTitle } from "@/components/ui/Card";
import { Pill, type PillProps } from "@/components/ui/Pill";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useMyRoleRequest } from "@/hooks/useMyRoleRequest";
import { cancelMyRoleRequest } from "@/lib/api/roleRequests.api";
import { useToast } from "@/lib/ui/toast";
import { ApiError } from "@/lib/api/client";
import { shortDate, timeAgo } from "@/lib/utils/format";
import type {
  RoleRequestDTO,
  RoleRequestStatus,
} from "@/lib/types/roleRequest";
import { cn } from "@/lib/utils/cn";

const STATUS_TONE: Record<RoleRequestStatus, PillProps["variant"]> = {
  pending: "default",
  approved: "green",
  rejected: "red",
  cancelled: "default",
};

const STATUS_LABEL: Record<RoleRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const REAPPLY_COOLDOWN_DAYS = 30;

export default function BecomeJournalistStatusPage() {
  const { profile, role, getIdToken, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isPending, isError, error, refetch } = useMyRoleRequest();
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Route-level guard. Non-readers go back to the main dashboard; readers
  // without any request go to the form to start one.
  useEffect(() => {
    if (loading || isPending) return;
    if (role && role !== "reader") {
      router.replace("/dashboard");
      return;
    }
    if (!data) {
      router.replace("/dashboard/become-journalist");
    }
  }, [loading, isPending, role, data, router]);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("No request to cancel");
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      return cancelMyRoleRequest(data.id, token);
    },
    onSuccess: (req) => {
      qc.setQueryData(["role-request", "me", profile?.id], req);
      toast.success("Request cancelled — you can re-apply anytime.");
      router.replace("/dashboard");
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Cancel failed.";
      toast.error(msg);
    },
  });

  if (loading || isPending) return <StatusSkeleton />;
  if (isError) {
    return (
      <Card>
        <p className="font-hand text-[12px] text-accent">
          Couldn&apos;t load your application —{" "}
          {(error as Error | undefined)?.message ?? "please try again."}{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="underline"
          >
            Retry
          </button>
        </p>
      </Card>
    );
  }
  if (!data) return null;

  const req: RoleRequestDTO = data;
  const cooldownEnd = req.decidedAt
    ? new Date(
        new Date(req.decidedAt).getTime() +
          REAPPLY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
      )
    : null;

  return (
    <>
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-hand text-[11px] uppercase tracking-[0.12em] text-muted">
            Application
          </p>
          <h1 className="serif text-[24px] sm:text-[30px] font-extrabold tracking-tight leading-tight mt-1">
            Your journalist application
          </h1>
          <p className="font-hand text-[12px] text-muted mt-1">
            Submitted {timeAgo(req.createdAt)} ·{" "}
            {req.emailVerifiedAt ? (
              <span className="inline-flex items-center gap-1 text-accent-2">
                <ShieldCheck size={11} aria-hidden /> Email verified
              </span>
            ) : null}
          </p>
        </div>
        <Pill variant={STATUS_TONE[req.status]} dot={req.status === "pending"}>
          {STATUS_LABEL[req.status]}
        </Pill>
      </header>

      {req.status === "pending" ? (
        <Card accent>
          <CardHead>
            <CardTitle>Under review</CardTitle>
          </CardHead>
          <p className="font-sans text-[13.5px] text-ink/85 leading-relaxed">
            Thanks for applying. We aim to respond within 48 hours. You&apos;ll
            receive an email at <strong>{profile?.email}</strong> when an
            admin reaches a decision.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Btn
              type="button"
              variant="default"
              onClick={() => setConfirmCancel(true)}
              disabled={cancelMutation.isPending}
            >
              Cancel application
            </Btn>
          </div>
        </Card>
      ) : null}

      {req.status === "approved" ? (
        <Card accent>
          <CardHead>
            <CardTitle>You&apos;re approved</CardTitle>
            <span className="inline-flex items-center gap-1 text-accent-2 font-hand text-[12px]">
              <CheckCircle2 size={12} aria-hidden /> Welcome to the desk
            </span>
          </CardHead>
          <p className="font-sans text-[13.5px] text-ink/85 leading-relaxed">
            Approved on {shortDate(req.decidedAt)}. Sign out and back in to
            switch to the journalist dashboard.
          </p>
        </Card>
      ) : null}

      {req.status === "rejected" ? (
        <Card accent>
          <CardHead>
            <CardTitle>Application not accepted</CardTitle>
            <span className="inline-flex items-center gap-1 text-accent font-hand text-[12px]">
              <XCircle size={12} aria-hidden /> Decided {timeAgo(req.decidedAt)}
            </span>
          </CardHead>
          {req.decisionReason ? (
            <blockquote className="border-l-[3px] border-accent pl-3 py-1 font-sans text-[13.5px] text-ink/85 whitespace-pre-wrap leading-relaxed">
              {req.decisionReason}
            </blockquote>
          ) : null}
          {cooldownEnd && cooldownEnd > new Date() ? (
            <div className="flex items-start gap-2 p-3 border-[1.5px] border-ink/20 rounded-sm bg-paper-2">
              <AlertCircle size={14} className="text-muted shrink-0 mt-0.5" aria-hidden />
              <p className="font-hand text-[12px] text-ink/85">
                You can re-apply on{" "}
                <strong>{shortDate(cooldownEnd.toISOString())}</strong>.
              </p>
            </div>
          ) : (
            <Link href="/dashboard/become-journalist">
              <Btn variant="primary" size="sm">
                <span className="inline-flex items-center gap-1.5">
                  <RotateCcw size={12} aria-hidden /> Re-apply now
                </span>
              </Btn>
            </Link>
          )}
        </Card>
      ) : null}

      {req.status === "cancelled" ? (
        <Card>
          <CardHead>
            <CardTitle>Application cancelled</CardTitle>
          </CardHead>
          <p className="font-sans text-[13.5px] text-ink/85">
            You cancelled this application on {shortDate(req.decidedAt ?? req.updatedAt)}.
            You can start a fresh one whenever you&apos;re ready.
          </p>
          <Link href="/dashboard/become-journalist">
            <Btn variant="primary" size="sm">
              Start a new application
            </Btn>
          </Link>
        </Card>
      ) : null}

      <Card>
        <CardHead>
          <CardTitle>What you submitted</CardTitle>
        </CardHead>
        <ReviewBlock req={req} />
      </Card>

      {confirmCancel ? (
        <CancelModal
          onClose={() => setConfirmCancel(false)}
          onConfirm={() => {
            setConfirmCancel(false);
            cancelMutation.mutate();
          }}
          inFlight={cancelMutation.isPending}
        />
      ) : null}
    </>
  );
}

function StatusSkeleton() {
  return (
    <Card>
      <div className="h-6 w-1/3 bg-paper-2 rounded animate-pulse" />
      <div className="h-32 bg-paper-2 rounded animate-pulse" />
    </Card>
  );
}

function ReviewBlock({ req }: { req: RoleRequestDTO }) {
  const info = req.submittedInfo;
  return (
    <div className="flex flex-col gap-3">
      <Row label="Full name" value={info.fullName} />
      <Row label="Byline / display name" value={info.displayName} />
      <Row label="Bio" value={info.bio} multiline />
      {info.phone ? <Row label="Phone" value={info.phone} /> : null}
      <Row
        label="Expertise"
        value={info.expertiseTags.join(", ") || "—"}
      />
      <Row
        label="Sample links"
        value={info.sampleLinks.join("\n") || "—"}
        multiline
      />
      <Row label="Motivation" value={info.motivation} multiline />
      <Row
        label="Guidelines version"
        value={`${info.guidelinesVersion} · agreed ${shortDate(info.agreedToGuidelinesAt)}`}
      />
    </div>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="font-hand text-[11px] uppercase tracking-wider text-muted mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "font-sans text-[13.5px] text-ink",
          multiline ? "whitespace-pre-line" : "",
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function CancelModal({
  onClose,
  onConfirm,
  inFlight,
}: {
  onClose: () => void;
  onConfirm: () => void;
  inFlight: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-app-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !inFlight) onClose();
      }}
    >
      <div className="bg-paper border-[1.5px] border-ink rounded-sm w-full max-w-[420px] p-5 flex flex-col gap-3">
        <h2 id="cancel-app-title" className="serif font-extrabold text-[18px]">
          Cancel your application?
        </h2>
        <p className="font-sans text-[13.5px] text-ink/85">
          This withdraws your application from the editor inbox. You can
          start a new one at any time — your old submission won&apos;t be
          retained.
        </p>
        <div className="flex items-center justify-end gap-2 mt-1">
          <Btn variant="default" onClick={onClose} disabled={inFlight}>
            Keep application
          </Btn>
          <Btn variant="primary" onClick={onConfirm} disabled={inFlight}>
            {inFlight ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={12} aria-hidden className="animate-spin" />
                Cancelling…
              </span>
            ) : (
              "Yes, cancel it"
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}
