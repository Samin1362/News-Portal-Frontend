import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { AdSlot } from "@/components/ui/AdSlot";

/**
 * Phase 1: homepage shell. Renders the editorial layout (hero column +
 * sticky rail) using placeholder content so we can verify the theme.
 * Phase 3 fetches `GET /api/v1/public/homepage` and fills in real data
 * (breaking, top headlines, featured, latest, categories, videos, gallery).
 */
export default function HomePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
      <div>
        <SectionTitle more={{ href: "/", label: "All stories" }}>
          Top headline
        </SectionTitle>

        <article className="border-[1.5px] border-ink rounded-sm overflow-hidden bg-paper">
          <div
            aria-hidden
            className="w-full h-[320px] bg-paper-2"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 8px, rgba(0,0,0,0.05) 8px 9px)",
            }}
          />
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Pill variant="solid">Politics</Pill>
              <Pill variant="red">Breaking</Pill>
            </div>
            <h1 className="serif text-[28px] font-extrabold leading-tight tracking-tight">
              Phase 1 wiring complete — backend connected, design tokens locked,
              ready for Phase 3 to fetch real headlines.
            </h1>
            <p className="font-sans text-[14px] text-muted leading-relaxed">
              The Deligo theme is live: Source Serif 4 headlines, Inter for UI
              controls, Kalam for editorial flourishes. The Header is pulling
              real category data from the Render-hosted backend. Phase 3 will
              replace this placeholder with the live homepage composite.
            </p>
            <div className="flex items-center gap-2 font-hand text-[11px] text-muted mt-1">
              <span>By Editorial</span>
              <span>·</span>
              <span>Today</span>
            </div>
          </div>
        </article>

        <div className="mt-8">
          <SectionTitle>Featured</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <article
                key={i}
                className="border-[1.5px] border-ink rounded-sm overflow-hidden bg-paper flex flex-col"
              >
                <div
                  aria-hidden
                  className="w-full h-[160px] bg-paper-2"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, transparent 0 8px, rgba(0,0,0,0.05) 8px 9px)",
                  }}
                />
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Pill variant="solid">Tech</Pill>
                    <Pill variant="green">Trending</Pill>
                  </div>
                  <h3 className="serif text-[17px] font-bold leading-snug tracking-tight">
                    Featured story headline placeholder — Phase 3 fills this in
                  </h3>
                  <div className="flex items-center gap-2 font-hand text-[11px] text-muted mt-auto">
                    <span>By Author</span>
                    <span>·</span>
                    <span>2h ago</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <AdSlot placement="home_sidebar" />
        <div>
          <SectionTitle>Trending</SectionTitle>
          <ol className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex gap-3">
                <span className="serif text-[24px] font-extrabold text-accent leading-none">
                  {i}
                </span>
                <span className="serif text-[14px] font-semibold leading-snug">
                  Placeholder trending headline number {i}, sourced from
                  /public/trending in Phase 3.
                </span>
              </li>
            ))}
          </ol>
        </div>
        <AdSlot placement="home_sidebar" />
      </aside>
    </div>
  );
}
