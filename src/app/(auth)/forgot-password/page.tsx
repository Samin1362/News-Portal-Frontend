"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Btn } from "@/components/ui/Btn";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { authErrorMessage } from "@/lib/auth/errors";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await auth.sendPasswordReset(values.email);
      setSent(true);
      toast.success("Reset link sent. Check your inbox.");
    } catch (err) {
      toast.error(authErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="serif text-[22px] font-extrabold tracking-tight">
        Reset your password
      </h1>
      <p className="font-hand text-[12px] text-muted mt-1">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Email
          </span>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            errorText={errors.email?.message}
            {...register("email")}
          />
        </label>

        <Btn
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : sent ? "Resend link" : "Send reset link"}
        </Btn>

        {sent ? (
          <p className="font-hand text-[12px] text-accent-2 text-center">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : null}
      </form>

      <p className="mt-6 font-hand text-[12px] text-muted text-center">
        Remembered it?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
