"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Btn } from "@/components/ui/Btn";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-16 bg-paper">
      <div className="max-w-md text-center">
        <p className="font-hand text-[12px] text-accent tracking-widest">
          ERROR
        </p>
        <h1 className="serif text-[32px] font-extrabold tracking-tight mt-2">
          Something broke in the newsroom.
        </h1>
        <p className="font-sans text-[14px] text-muted mt-3 leading-relaxed">
          Press try again. If the problem persists, head back to the homepage.
          {error.digest ? (
            <span className="block mt-2 font-hand text-[10px] text-muted">
              ref: {error.digest}
            </span>
          ) : null}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Btn variant="primary" onClick={reset}>
            Try again
          </Btn>
          <Btn variant="ghost">
            <Link href="/">Go home</Link>
          </Btn>
        </div>
      </div>
    </div>
  );
}
