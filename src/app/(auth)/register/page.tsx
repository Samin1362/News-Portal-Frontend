"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Btn } from "@/components/ui/Btn";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { authErrorMessage } from "@/lib/auth/errors";

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "At least 2 characters.")
    .max(60, "Max 60 characters."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!auth.loading && auth.firebaseUser && auth.profile) {
      router.replace("/dashboard");
    }
  }, [auth.loading, auth.firebaseUser, auth.profile, router]);

  async function onSubmit(values: FormValues) {
    try {
      await auth.signUp(values.email, values.password, values.displayName);
      toast.success("Account created. Welcome to Deligo.");
    } catch (err) {
      toast.error(authErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="serif text-[22px] font-extrabold tracking-tight">
        Create your account
      </h1>
      <p className="font-hand text-[12px] text-muted mt-1">
        Read everywhere. Comment, share, save stories.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Display name
          </span>
          <Input
            type="text"
            autoComplete="name"
            placeholder="Your name"
            errorText={errors.displayName?.message}
            {...register("displayName")}
          />
        </label>

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
            autoComplete="new-password"
            placeholder="Min 8 characters"
            errorText={errors.password?.message}
            {...register("password")}
          />
        </label>

        <Btn
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create account"}
        </Btn>
      </form>

      <p className="mt-6 font-hand text-[12px] text-muted text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
