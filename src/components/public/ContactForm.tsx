"use client";

import { useState } from "react";
import { z } from "zod";
import { Send } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { useToast } from "@/lib/ui/toast";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  subject: z.string().trim().min(3, "Add a short subject."),
  message: z.string().trim().min(10, "Your message is a little short."),
});

type Field = keyof z.infer<typeof ContactSchema>;

const TO_ADDRESS = "newsroom@deligo.news";

/**
 * Contact form (Phase 4). No backend mail endpoint exists, so this stays
 * honest: it validates client-side (zod) then opens the reader's own mail app
 * with a fully prefilled message to the newsroom. The direct addresses on the
 * page remain as a fallback.
 */
export function ContactForm() {
  const toast = useToast();
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = ContactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    const { name, email, subject, message } = parsed.data;
    const body = `${message}\n\n— ${name}\n${email}`;
    const href = `mailto:${TO_ADDRESS}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    toast.info("Opening your email app to send this message…");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          id="contact-name"
          value={values.name}
          onChange={(v) => set("name", v)}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          label="Email"
          id="contact-email"
          type="email"
          value={values.email}
          onChange={(v) => set("email", v)}
          error={errors.email}
          autoComplete="email"
        />
      </div>
      <Field
        label="Subject"
        id="contact-subject"
        value={values.subject}
        onChange={(v) => set("subject", v)}
        error={errors.subject}
      />
      <div>
        <label
          htmlFor="contact-message"
          className="font-hand text-[12px] uppercase tracking-wider text-muted"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          className="mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2 font-sans text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
        />
        {errors.message ? (
          <p className="mt-1 font-hand text-[11px] text-accent">
            {errors.message}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Btn type="submit" variant="primary" size="md">
          <Send size={14} aria-hidden />
          Send message
        </Btn>
        <span className="font-hand text-[11px] text-muted">
          Opens in your email app — no message is stored here.
        </span>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-hand text-[12px] uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2 font-sans text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      {error ? (
        <p className="mt-1 font-hand text-[11px] text-accent">{error}</p>
      ) : null}
    </div>
  );
}
