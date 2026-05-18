"use client";

import { useAuth } from "@/lib/auth/AuthProvider";

interface GreetingProps {
  /** Trailing line ("3 drafts waiting · 1 awaiting review"). */
  meta?: string;
}

function firstName(displayName?: string | null): string {
  if (!displayName) return "there";
  const trimmed = displayName.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0]!;
}

function partOfDay(hour: number): string {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function prettyDate(now: Date): string {
  return now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function Greeting({ meta }: GreetingProps) {
  const { profile } = useAuth();
  const now = new Date();

  return (
    <header className="flex flex-col gap-1">
      <h1 className="serif text-[32px] sm:text-[34px] tracking-[-0.02em] font-extrabold leading-[1.1]">
        Good {partOfDay(now.getHours())},{" "}
        <span className="uline">{firstName(profile?.displayName)}</span>.
      </h1>
      <p className="font-hand text-[13px] text-muted">
        {prettyDate(now)}
        {meta ? ` · ${meta}` : null}
      </p>
    </header>
  );
}
