import Link from "next/link";
import { Btn } from "@/components/ui/Btn";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="serif text-[22px] font-extrabold tracking-tight">
        Reset your password
      </h1>
      <p className="font-hand text-[12px] text-muted mt-1">
        Enter your email and we'll send you a reset link.
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

        <Btn variant="primary" className="w-full" disabled>
          Send reset link
        </Btn>
      </form>

      <p className="mt-6 font-hand text-[12px] text-muted text-center">
        Remembered it?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>

      <p className="mt-4 font-hand text-[10px] text-muted text-center">
        Phase 1 — reset flow is wired in Phase 2.
      </p>
    </div>
  );
}
