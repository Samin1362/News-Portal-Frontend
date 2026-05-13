import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Centered single-card layout used by /login, /register, /forgot-password.
 * No header / footer — just the brand wordmark + the form card.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-paper px-4 py-12">
      <Link href="/" className="flex items-baseline gap-1.5 mb-8">
        <span className="serif text-[32px] font-extrabold leading-none tracking-tight">
          Deligo
        </span>
        <span className="font-hand text-[12px] text-accent">· daily</span>
      </Link>

      <div className="w-full max-w-[420px] border-[1.5px] border-ink rounded-sm bg-paper p-6 sm:p-8">
        {children}
      </div>

      <p className="font-hand text-[11px] text-muted mt-6">
        © {new Date().getFullYear()} Deligo News
      </p>
    </div>
  );
}
