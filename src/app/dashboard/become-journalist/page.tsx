"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Card, CardHead, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { OtpInput } from "@/components/dashboard/become-journalist/OtpInput";
import { CloudinaryUploader } from "@/components/dashboard/articles/CloudinaryUploader";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { ApiError } from "@/lib/api/client";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/api/emailOtp.api";
import { createRoleRequest } from "@/lib/api/roleRequests.api";
import { useMyRoleRequest } from "@/hooks/useMyRoleRequest";
import type { CloudinaryAsset } from "@/lib/cloudinary/upload";
import { cn } from "@/lib/utils/cn";

const phonePattern = /^\+[1-9]\d{6,14}$/u;
const httpsPattern = /^https:\/\/.+/u;
const tagPattern = /^[a-z0-9](?:[a-z0-9 \-_.]{0,38}[a-z0-9])?$/u;

const formSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required.")
    .max(120, "Full name is too long."),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name is required.")
    .max(60, "Display name must be 60 characters or fewer."),
  bio: z
    .string()
    .trim()
    .min(120, "Bio must be at least 120 characters.")
    .max(2000, "Bio must be 2000 characters or fewer."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || phonePattern.test(v),
      "Use E.164 format, e.g. +14155552671",
    ),
  expertiseTags: z
    .array(z.string().trim().toLowerCase())
    .min(1, "Add at least one tag.")
    .max(5, "At most 5 tags."),
  sampleLinks: z
    .array(z.string().trim())
    .max(3, "At most 3 sample links.")
    .refine(
      (arr) => arr.every((s) => s === "" || httpsPattern.test(s)),
      "Sample links must start with https://",
    ),
  motivation: z
    .string()
    .trim()
    .min(80, "Tell us at least a few sentences (80 chars).")
    .max(1500, "Motivation must be 1500 characters or fewer."),
  photoPublicId: z.string().optional(),
  agreedToGuidelines: z.literal(true, {
    error: "You must agree to the journalism guidelines.",
  }),
  emailVerificationToken: z
    .string()
    .min(1, "Verify your email to continue."),
});

type FormValues = z.infer<typeof formSchema>;

type StepKey = 1 | 2 | 3 | 4 | 5;

const STEP_TITLES: Record<StepKey, string> = {
  1: "About you",
  2: "Your beat",
  3: "Motivation",
  4: "Verify email",
  5: "Review & submit",
};

const STEP_FIELDS: Record<StepKey, Array<keyof FormValues>> = {
  1: ["fullName", "displayName", "bio", "phone"],
  2: ["expertiseTags", "sampleLinks"],
  3: ["motivation", "photoPublicId", "agreedToGuidelines"],
  4: ["emailVerificationToken"],
  5: [],
};

const TOTAL_STEPS = 5 as const;

export default function BecomeJournalistPage() {
  const { profile, role, getIdToken, loading } = useAuth();
  const { data: existing, isPending: existingPending } = useMyRoleRequest();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();

  const [step, setStep] = useState<StepKey>(1);
  const [uploadedAvatar, setUploadedAvatar] =
    useState<CloudinaryAsset | null>(null);

  // Route-level guard. Non-readers don't see the form, and an active pending
  // request bumps the user to the status page.
  useEffect(() => {
    if (loading || existingPending) return;
    if (role && role !== "reader") {
      router.replace("/dashboard");
      return;
    }
    if (existing && existing.status === "pending") {
      router.replace("/dashboard/become-journalist/status");
    }
  }, [loading, existingPending, role, existing, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      displayName: profile?.displayName ?? "",
      bio: "",
      phone: "",
      expertiseTags: [],
      sampleLinks: [],
      motivation: "",
      photoPublicId: undefined,
      agreedToGuidelines: undefined as unknown as true,
      emailVerificationToken: "",
    },
  });

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting },
    getValues,
  } = form;

  const goNext = useCallback(async () => {
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const ok = await trigger(fields as Array<keyof FormValues>, {
        shouldFocus: true,
      });
      if (!ok) return;
    }
    setStep((s) => (s < TOTAL_STEPS ? ((s + 1) as StepKey) : s));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, trigger]);

  const goBack = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as StepKey) : s));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      return createRoleRequest(
        {
          toRole: "journalist",
          submittedInfo: {
            fullName: values.fullName.trim(),
            displayName: values.displayName.trim(),
            bio: values.bio.trim(),
            expertiseTags: values.expertiseTags
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean),
            sampleLinks: values.sampleLinks
              .map((l) => l.trim())
              .filter(Boolean),
            motivation: values.motivation.trim(),
            phone: values.phone?.trim() ? values.phone.trim() : undefined,
            photoPublicId: values.photoPublicId ?? undefined,
          },
          verificationToken: values.emailVerificationToken,
        },
        token,
      );
    },
    onSuccess: (req) => {
      qc.setQueryData(["role-request", "me", profile?.id], req);
      toast.success("Application submitted — we'll email you soon.");
      router.replace("/dashboard/become-journalist/status");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Submission failed.";
      toast.error(msg);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    submitMutation.mutate(values);
  };

  if (loading || existingPending) {
    return <FormSkeleton />;
  }
  if (role !== "reader" || !profile) {
    return null;
  }

  return (
    <>
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-hand text-[11px] uppercase tracking-[0.12em] text-muted">
            Application
          </p>
          <h1 className="serif text-[24px] sm:text-[30px] font-extrabold tracking-tight leading-tight mt-1">
            Become a journalist
          </h1>
          <p className="font-sans text-[13px] text-ink/85 mt-1 max-w-prose">
            Tell us about yourself in 5 quick steps. Approved applicants get
            a journalist seat and can start drafting articles immediately.
          </p>
        </div>
      </header>

      <StepIndicator current={step} />

      <Card>
        <CardHead>
          <CardTitle>Step {step}. {STEP_TITLES[step]}</CardTitle>
          <Pill variant="default">{step}/{TOTAL_STEPS}</Pill>
        </CardHead>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {step === 1 ? <Step1 form={form} /> : null}
          {step === 2 ? <Step2 form={form} /> : null}
          {step === 3 ? (
            <Step3
              form={form}
              uploadedAvatar={uploadedAvatar}
              setUploadedAvatar={setUploadedAvatar}
            />
          ) : null}
          {step === 4 ? <Step4 form={form} /> : null}
          {step === 5 ? (
            <Step5 form={form} uploadedAvatar={uploadedAvatar} />
          ) : null}

          <Nav
            step={step}
            onBack={goBack}
            onNext={goNext}
            submitting={isSubmitting || submitMutation.isPending}
            canSubmit={!!getValues("emailVerificationToken")}
          />
        </form>
      </Card>
    </>
  );
}

/* ──────────────── helpers ──────────────── */

function FormSkeleton() {
  return (
    <Card>
      <div className="h-6 w-1/3 bg-paper-2 rounded animate-pulse" />
      <div className="h-32 bg-paper-2 rounded animate-pulse" />
      <div className="h-10 bg-paper-2 rounded animate-pulse" />
    </Card>
  );
}

function StepIndicator({ current }: { current: StepKey }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      {([1, 2, 3, 4, 5] as const).map((n, idx) => {
        const done = n < current;
        const active = n === current;
        return (
          <li key={n} className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full border-[1.5px] font-sans text-[12px] font-bold transition-colors",
                done
                  ? "bg-ink text-paper border-ink"
                  : active
                    ? "bg-accent text-paper border-accent"
                    : "bg-paper text-muted border-ink/30",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check size={14} aria-hidden /> : n}
            </span>
            <span
              className={cn(
                "font-hand text-[11px] hidden sm:inline",
                done || active ? "text-ink" : "text-muted",
              )}
            >
              {STEP_TITLES[n]}
            </span>
            {idx < 4 ? (
              <ChevronRight
                size={12}
                aria-hidden
                className="text-muted/60 shrink-0"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Nav({
  step,
  onBack,
  onNext,
  submitting,
  canSubmit,
}: {
  step: StepKey;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
  canSubmit: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mt-2 pt-3 border-t border-ink/10">
      {step > 1 ? (
        <Btn type="button" variant="default" onClick={onBack}>
          <span className="inline-flex items-center gap-1.5">
            <ArrowLeft size={12} aria-hidden /> Back
          </span>
        </Btn>
      ) : (
        <span />
      )}
      {step < TOTAL_STEPS ? (
        <Btn type="button" variant="primary" onClick={onNext}>
          <span className="inline-flex items-center gap-1.5">
            Next <ArrowRight size={12} aria-hidden />
          </span>
        </Btn>
      ) : (
        <Btn
          type="submit"
          variant="primary"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 size={12} aria-hidden className="animate-spin" />
              Submitting…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              Submit application
            </span>
          )}
        </Btn>
      )}
    </div>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <span className="flex items-baseline justify-between gap-2">
      <span className="font-hand text-[12px] tracking-wide text-ink">
        {children}
      </span>
      {hint ? (
        <span className="font-hand text-[11px] text-muted">{hint}</span>
      ) : null}
    </span>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 font-hand text-[11px] text-accent inline-flex items-center gap-1">
      <AlertCircle size={11} aria-hidden /> {message}
    </p>
  );
}

/* ──────────────── steps ──────────────── */

type StepProps = { form: ReturnType<typeof useForm<FormValues>> };

function Step1({ form }: StepProps) {
  const { register, watch, formState } = form;
  const bio = watch("bio") ?? "";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="flex flex-col">
        <FieldLabel>Full legal name</FieldLabel>
        <Input
          {...register("fullName")}
          autoComplete="name"
          placeholder="Jane Maria Doe"
          errorText={formState.errors.fullName?.message}
        />
      </label>
      <label className="flex flex-col">
        <FieldLabel hint="What readers see on your byline">
          Byline / display name
        </FieldLabel>
        <Input
          {...register("displayName")}
          autoComplete="nickname"
          placeholder="Jane Doe"
          errorText={formState.errors.displayName?.message}
        />
      </label>
      <label className="flex flex-col md:col-span-2">
        <FieldLabel hint={`${bio.length} / 2000 — min 120`}>
          Bio
        </FieldLabel>
        <textarea
          {...register("bio")}
          rows={6}
          placeholder="A short paragraph about your background, beats covered, and notable bylines (min 120 characters)."
          className={cn(
            "mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2",
            "font-sans text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30",
            formState.errors.bio ? "border-accent" : "",
          )}
          aria-invalid={formState.errors.bio ? true : undefined}
        />
        <ErrorText message={formState.errors.bio?.message} />
      </label>
      <label className="flex flex-col md:col-span-2">
        <FieldLabel hint="Optional — for editor follow-up">Phone</FieldLabel>
        <Input
          {...register("phone")}
          inputMode="tel"
          placeholder="+14155552671"
          autoComplete="tel"
          errorText={formState.errors.phone?.message}
        />
      </label>
    </div>
  );
}

function Step2({ form }: StepProps) {
  const { control, register, watch, setValue, formState } = form;
  const tags = watch("expertiseTags");
  const links = watch("sampleLinks");
  const [tagDraft, setTagDraft] = useState("");

  const commitTag = (raw: string) => {
    const t = raw.trim().toLowerCase();
    if (!t) return;
    if (!tagPattern.test(t)) return;
    if (tags.includes(t)) return;
    if (tags.length >= 5) return;
    setValue("expertiseTags", [...tags, t], { shouldValidate: true });
    setTagDraft("");
  };

  const removeTag = (t: string) => {
    setValue(
      "expertiseTags",
      tags.filter((x) => x !== t),
      { shouldValidate: true },
    );
  };

  const addLinkRow = () => {
    if (links.length >= 3) return;
    setValue("sampleLinks", [...links, ""], { shouldValidate: true });
  };

  const removeLinkRow = (idx: number) => {
    setValue(
      "sampleLinks",
      links.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="expertiseTags"
        render={() => (
          <div className="flex flex-col">
            <FieldLabel hint={`${tags.length} / 5 — at least 1`}>
              Expertise tags
            </FieldLabel>
            <div
              className={cn(
                "mt-1 flex flex-wrap items-center gap-1.5 border-[1.5px] rounded-sm bg-paper px-2 py-2 min-h-10",
                formState.errors.expertiseTags ? "border-accent" : "border-ink",
              )}
            >
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-[1.5px] border-ink bg-paper-2 font-hand text-[11px]"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove ${t}`}
                    className="text-muted hover:text-accent"
                  >
                    <X size={11} aria-hidden />
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    commitTag(tagDraft);
                  } else if (
                    e.key === "Backspace" &&
                    !tagDraft &&
                    tags.length > 0
                  ) {
                    removeTag(tags[tags.length - 1]);
                  }
                }}
                onBlur={() => commitTag(tagDraft)}
                placeholder={
                  tags.length === 0
                    ? "e.g. politics, climate (Enter to add)"
                    : ""
                }
                className="flex-1 min-w-[140px] bg-transparent outline-none font-sans text-[13px]"
              />
            </div>
            <ErrorText message={formState.errors.expertiseTags?.message} />
            <p className="mt-1 font-hand text-[11px] text-muted">
              Lowercase, letters/numbers/spaces, 2–40 chars each. Press Enter
              or comma to add.
            </p>
          </div>
        )}
      />

      <div className="flex flex-col">
        <FieldLabel hint={`${links.length} / 3 — https only`}>
          Sample links
        </FieldLabel>
        <div className="mt-1 flex flex-col gap-2">
          {links.map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                {...register(`sampleLinks.${idx}` as const)}
                placeholder="https://example.com/your-piece"
                inputMode="url"
              />
              <button
                type="button"
                onClick={() => removeLinkRow(idx)}
                aria-label="Remove link"
                className="text-muted hover:text-accent shrink-0"
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          ))}
          {links.length < 3 ? (
            <button
              type="button"
              onClick={addLinkRow}
              className="self-start inline-flex items-center gap-1.5 font-hand text-[12px] text-accent hover:underline"
            >
              <Plus size={12} aria-hidden /> Add a sample link
            </button>
          ) : null}
        </div>
        <ErrorText
          message={
            (formState.errors.sampleLinks as { message?: string } | undefined)
              ?.message
          }
        />
      </div>
    </div>
  );
}

function Step3({
  form,
  uploadedAvatar,
  setUploadedAvatar,
}: StepProps & {
  uploadedAvatar: CloudinaryAsset | null;
  setUploadedAvatar: (m: CloudinaryAsset | null) => void;
}) {
  const { register, watch, setValue, formState } = form;
  const motivation = watch("motivation") ?? "";

  const handleUploaded = (asset: CloudinaryAsset) => {
    setUploadedAvatar(asset);
    setValue("photoPublicId", asset.publicId, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col">
        <FieldLabel hint={`${motivation.length} / 1500 — min 80`}>
          Why do you want to write for Deligo?
        </FieldLabel>
        <textarea
          {...register("motivation")}
          rows={6}
          placeholder="What stories you'd cover, why now, and what your editor needs to know to evaluate fit."
          className={cn(
            "mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2",
            "font-sans text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30",
            formState.errors.motivation ? "border-accent" : "",
          )}
        />
        <ErrorText message={formState.errors.motivation?.message} />
      </label>

      <div className="flex flex-col">
        <FieldLabel hint="Optional — adds trust to your byline">
          Avatar
        </FieldLabel>
        {uploadedAvatar ? (
          <div className="mt-1 flex items-center gap-3 p-2 border-[1.5px] border-ink rounded-sm bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedAvatar.url}
              alt="Your avatar"
              className="w-14 h-14 rounded-full object-cover border-[1.5px] border-ink"
            />
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[13px] truncate">
                {uploadedAvatar.publicId}
              </p>
              <p className="font-hand text-[11px] text-muted">
                {uploadedAvatar.format ?? "image"} ·{" "}
                {uploadedAvatar.bytes
                  ? `${Math.round(uploadedAvatar.bytes / 1024)} KB`
                  : "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUploadedAvatar(null);
                setValue("photoPublicId", undefined, { shouldValidate: true });
              }}
              className="text-muted hover:text-accent"
              aria-label="Remove avatar"
            >
              <Trash2 size={14} aria-hidden />
            </button>
          </div>
        ) : (
          <div className="mt-1">
            <CloudinaryUploader
              accept="image"
              multiple={false}
              size="compact"
              mode="direct"
              onDirectUploaded={handleUploaded}
            />
          </div>
        )}
      </div>

      <Controller
        control={form.control}
        name="agreedToGuidelines"
        render={({ field }) => (
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.value === true}
              onChange={(e) => field.onChange(e.target.checked || undefined)}
              className="mt-1 w-4 h-4 accent-[var(--color-accent)]"
            />
            <span className="font-sans text-[13px] text-ink/90 leading-snug">
              I have read and agree to the{" "}
              <Link
                href="/journalist-guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Deligo journalism guidelines
              </Link>
              . I understand my application is reviewed against these.
            </span>
          </label>
        )}
      />
      <ErrorText message={formState.errors.agreedToGuidelines?.message} />
    </div>
  );
}

const RESEND_COOLDOWN_SECONDS = 60;

function Step4({ form }: StepProps) {
  const { profile } = useAuth();
  const toast = useToast();
  const email = profile?.email ?? "";

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [sentOnce, setSentOnce] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const verifiedToken = form.watch("emailVerificationToken");

  // Countdown for the "Resend in 0:Xs" button. Decrements each second.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const sendMutation = useMutation({
    mutationFn: () => sendEmailOtp({ email, purpose: "role-request" }),
    onSuccess: () => {
      setSentOnce(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setErrorMsg(null);
      setCode("");
      setResetSignal((n) => n + 1);
      toast.success(`Code sent to ${email}`);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Send failed.";
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const verify = useCallback(
    async (override?: string) => {
      const full = (override ?? code).trim();
      if (full.length < 4) return;
      setVerifying(true);
      setErrorMsg(null);
      try {
        const result = await verifyEmailOtp({
          email,
          code: full,
          purpose: "role-request",
        });
        form.setValue("emailVerificationToken", result.verificationToken, {
          shouldValidate: true,
        });
        toast.success("Email verified.");
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Invalid code.";
        setErrorMsg(msg);
      } finally {
        setVerifying(false);
      }
    },
    [code, email, form, toast],
  );

  if (verifiedToken) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 p-3 border-[1.5px] border-accent-2 bg-accent-2/10 rounded-sm">
          <CheckCircle2 size={18} className="text-accent-2 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-sans text-[14px] font-semibold">
              Email verified
            </p>
            <p className="font-hand text-[12px] text-muted mt-0.5">
              We confirmed you own <strong>{email}</strong>. Continue to
              review and submit your application.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              form.setValue("emailVerificationToken", "", {
                shouldValidate: true,
              });
              setCode("");
              setResetSignal((n) => n + 1);
            }}
            className="font-hand text-[12px] text-muted hover:text-accent underline"
          >
            Change email / re-verify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 p-3 border-[1.5px] border-ink/30 rounded-sm bg-paper-2">
        <Mail size={16} className="text-muted shrink-0" aria-hidden />
        <p className="font-sans text-[13px] flex-1">
          We&apos;ll send a 6-digit code to{" "}
          <strong className="font-semibold">{email}</strong>.
        </p>
      </div>

      {!sentOnce ? (
        <Btn
          type="button"
          variant="primary"
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 size={12} aria-hidden className="animate-spin" />
              Sending…
            </span>
          ) : (
            "Send code"
          )}
        </Btn>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <FieldLabel>Enter the 6-digit code</FieldLabel>
            <OtpInput
              value={code}
              onChange={setCode}
              onComplete={(full) => verify(full)}
              disabled={verifying}
              resetSignal={resetSignal}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Btn
              type="button"
              variant="primary"
              onClick={() => verify()}
              disabled={verifying || code.length < 4}
            >
              {verifying ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2
                    size={12}
                    aria-hidden
                    className="animate-spin"
                  />
                  Verifying…
                </span>
              ) : (
                "Verify code"
              )}
            </Btn>
            <Btn
              type="button"
              variant="default"
              onClick={() => sendMutation.mutate()}
              disabled={cooldown > 0 || sendMutation.isPending}
            >
              {cooldown > 0
                ? `Resend in ${formatCooldown(cooldown)}`
                : "Resend code"}
            </Btn>
          </div>
          {errorMsg ? <ErrorText message={errorMsg} /> : null}
        </div>
      )}
    </div>
  );
}

function formatCooldown(s: number): string {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

function Step5({
  form,
  uploadedAvatar,
}: StepProps & { uploadedAvatar: CloudinaryAsset | null }) {
  const v = form.getValues();
  return (
    <div className="flex flex-col gap-3">
      <p className="font-hand text-[12px] text-muted">
        Review what we&apos;ll send the editors. You can still go back to fix
        anything.
      </p>
      <ReviewRow label="Full name" value={v.fullName} />
      <ReviewRow label="Byline / display name" value={v.displayName} />
      <ReviewRow label="Bio" value={v.bio} multiline />
      {v.phone ? <ReviewRow label="Phone" value={v.phone} /> : null}
      <ReviewRow
        label="Expertise"
        value={
          v.expertiseTags.length === 0
            ? "—"
            : v.expertiseTags.join(", ")
        }
      />
      <ReviewRow
        label="Sample links"
        value={
          v.sampleLinks.filter(Boolean).length === 0
            ? "—"
            : v.sampleLinks.filter(Boolean).join("\n")
        }
        multiline
      />
      <ReviewRow label="Motivation" value={v.motivation} multiline />
      {uploadedAvatar ? (
        <div>
          <p className="font-hand text-[11px] uppercase tracking-wider text-muted mb-1">
            Avatar
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedAvatar.url}
            alt="Your avatar"
            className="w-16 h-16 rounded-full object-cover border-[1.5px] border-ink"
          />
        </div>
      ) : null}
      <p className="font-hand text-[11px] text-muted">
        By submitting, you confirm the information above is accurate and you
        agreed to the journalism guidelines on{" "}
        {new Date().toLocaleDateString()}.
      </p>
    </div>
  );
}

function ReviewRow({
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
          multiline ? "whitespace-pre-line" : "truncate",
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

