"use client";

import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import { friendlyErrorMessage } from "@/lib/auth/errors";

/**
 * Shared error-boundary UI (Phase 7). Renders friendly, code-mapped copy for a
 * thrown error and a retry button. Used by the route-group `error.tsx` files so
 * every section fails gracefully with the same editorial look.
 */
export function ErrorState({
  error,
  reset,
  title = "Something broke.",
  homeHref = "/",
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  homeHref?: string;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <p className="font-hand text-[12px] text-accent tracking-widest">ERROR</p>
        <h1 className="serif text-[28px] font-extrabold tracking-tight mt-2">
          {title}
        </h1>
        <p className="font-sans text-[14px] text-muted mt-3 leading-relaxed">
          {friendlyErrorMessage(error)}
          {error.digest ? (
            <span className="block mt-2 font-hand text-[10px] text-muted">
              ref: {error.digest}
            </span>
          ) : null}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          {reset ? (
            <Btn variant="primary" onClick={reset}>
              Try again
            </Btn>
          ) : null}
          <Btn variant="ghost">
            <Link href={homeHref}>Go back</Link>
          </Btn>
        </div>
      </div>
    </div>
  );
}
