"use client";

import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { useAuth } from "@/lib/auth/AuthProvider";

const STATS = [
  { label: "Drafts", value: 0, hint: "—" },
  { label: "Awaiting review", value: 0, hint: "—" },
  { label: "Published", value: 0, hint: "—" },
  { label: "Rejected", value: 0, hint: "—" },
];

/**
 * Phase 2: signed-in landing page. Stats remain placeholders until Phase 5
 * wires `GET /articles/me?status=` per status.
 */
export default function DashboardOverview() {
  const { profile, role } = useAuth();

  return (
    <div className="max-w-[1080px] mx-auto">
      <SectionTitle>
        {profile ? `Hello, ${profile.displayName}` : "Overview"}
      </SectionTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="border-[1.5px] border-ink rounded-sm bg-paper p-4"
          >
            <div className="font-hand text-[11px] text-muted uppercase tracking-wider">
              {s.label}
            </div>
            <div className="serif text-[32px] font-extrabold leading-none mt-1">
              {s.value}
            </div>
            <div className="font-hand text-[11px] text-muted mt-1">
              {s.hint}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-[1.5px] border-ink rounded-sm bg-paper p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="serif text-[16px] font-bold tracking-tight">
            Phase 2 status
          </h3>
          <Pill variant="green" dot>
            Auth live
          </Pill>
          <Pill variant="default">Role: {role ?? "reader"}</Pill>
        </div>
        <ul className="space-y-1.5 font-sans text-[14px] text-ink">
          <li>✔ Firebase email/password + Google sign-in</li>
          <li>✔ Mongo profile sync via POST /api/v1/auth/sync</li>
          <li>✔ Dashboard guard redirects unauthed → /login</li>
          <li>✔ Role-aware sidebar nav + sign-out</li>
          <li>✔ /profile read + edit (PATCH /api/v1/users/me)</li>
          <li className="text-muted">
            Next: Phase 3 — public reader portal (homepage, category, article).
          </li>
        </ul>
      </div>
    </div>
  );
}
