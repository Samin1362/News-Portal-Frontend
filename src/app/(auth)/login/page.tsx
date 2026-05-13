import Link from "next/link";
import { Btn } from "@/components/ui/Btn";

export const metadata = { title: "Sign in" };

/**
 * Phase 1: visual shell only — fields are inert. Phase 2 wires Firebase
 * email/password + Google OAuth and the call to `POST /api/v1/auth/sync`.
 */
export default function LoginPage() {
  return (
    <div>
      <h1 className="serif text-[22px] font-extrabold tracking-tight">
        Sign in
      </h1>
      <p className="font-hand text-[12px] text-muted mt-1">
        Welcome back to the newsroom.
      </p>

      <form className="mt-6 space-y-4" aria-disabled>
        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Email
          </span>
          <input
            type="email"
            placeholder="you@example.com"
            disabled
            className="mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2 font-sans text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Password
          </span>
          <input
            type="password"
            placeholder="••••••••"
            disabled
            className="mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2 font-sans text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
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

        <Btn variant="primary" className="w-full" disabled>
          Sign in
        </Btn>

        <div className="relative my-2 text-center">
          <hr className="border-t border-black/10" />
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-paper px-2 font-hand text-[11px] text-muted">
            or
          </span>
        </div>

        <Btn variant="default" className="w-full" disabled>
          Continue with Google
        </Btn>
      </form>

      <p className="mt-6 font-hand text-[12px] text-muted text-center">
        New to Deligo?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>

      <p className="mt-4 font-hand text-[10px] text-muted text-center">
        Phase 1 — sign-in is wired in Phase 2.
      </p>
    </div>
  );
}
