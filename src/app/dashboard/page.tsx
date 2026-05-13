import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";

export const metadata = { title: "Dashboard" };

const STATS = [
  { label: "Drafts", value: 0, hint: "—" },
  { label: "Awaiting review", value: 0, hint: "—" },
  { label: "Published", value: 0, hint: "—" },
  { label: "Rejected", value: 0, hint: "—" },
];

/**
 * Phase 1: dashboard overview shell. Phase 5 populates the stats from
 * `GET /api/v1/articles/me?status=...` and renders the recent activity feed.
 */
export default function DashboardOverview() {
  return (
    <div className="max-w-[1080px] mx-auto">
      <SectionTitle>Overview</SectionTitle>

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
            Phase 1 status
          </h3>
          <Pill variant="green" dot>
            Theme locked
          </Pill>
        </div>
        <ul className="space-y-1.5 font-sans text-[14px] text-ink">
          <li>✔ Deligo design tokens wired into Tailwind v4</li>
          <li>✔ Source Serif 4 / Inter / Kalam fonts loaded</li>
          <li>✔ Public + auth + dashboard layout shells</li>
          <li>✔ API client foundation (apiFetch + ApiError)</li>
          <li>✔ Header pulls real categories from the Render backend</li>
          <li className="text-muted">
            Next: Phase 2 — Firebase auth + /auth/sync + RoleGuard.
          </li>
        </ul>
      </div>
    </div>
  );
}
