"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  password: z.string().min(1, "Password is required."),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirect") ?? "/dashboard";
  const auth = useAuth();
  const toast = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!auth.loading && auth.firebaseUser && auth.profile) {
      router.replace(redirectTo);
    }
  }, [auth.loading, auth.firebaseUser, auth.profile, router, redirectTo]);

  async function onSubmit(values: FormValues) {
    try {
      await auth.signIn(values.email, values.password);
      toast.success("Signed in.");
    } catch (err) {
      toast.error(authErrorMessage(err));
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      await auth.signInWithGoogle();
      toast.success("Signed in with Google.");
    } catch (err) {
      toast.error(authErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div>
      <h1 className="serif text-[22px] font-extrabold tracking-tight">
        Sign in
      </h1>
      <p className="font-hand text-[12px] text-muted mt-1">
        Welcome back to the newsroom.
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

        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Password
          </span>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            errorText={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="font-hand text-[11px] text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </label>

        <Btn
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Btn>

        <div className="relative my-2 text-center">
          <hr className="border-t border-black/10" />
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-paper px-2 font-hand text-[11px] text-muted">
            or
          </span>
        </div>

        <Btn
          type="button"
          variant="default"
          className="w-full"
          disabled={googleLoading}
          onClick={onGoogle}
        >
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </Btn>
      </form>

      <p className="mt-6 font-hand text-[12px] text-muted text-center">
        New to Deligo?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
