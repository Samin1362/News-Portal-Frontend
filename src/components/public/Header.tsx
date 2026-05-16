import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { listCategories } from "@/lib/api/categories.api";
import { getBreaking } from "@/lib/api/public.api";
import { BreakingTicker } from "./BreakingTicker";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { SearchBox } from "./SearchBox";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

const STATIC_FALLBACK_NAV = [
  { slug: "latest", name: "Latest" },
  { slug: "politics", name: "Politics" },
  { slug: "international", name: "World" },
  { slug: "business", name: "Business" },
  { slug: "sports", name: "Sport" },
  { slug: "technology", name: "Tech" },
];

function formatToday(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Editorial masthead. Server component — fetches categories + breaking
 * items in parallel and falls back gracefully when the backend is cold.
 *
 * Layouts:
 *  - Mobile (`< md`): [hamburger] [centered Deligo logo] [account]
 *  - Desktop (`>= md`): Top ad strip → masthead (logo + date — typeahead search,
 *    bell, account) → category nav row → breaking ticker. The masthead is
 *    centered and framed by twin ink rules to give the logo a "newspaper plate"
 *    feel.
 */
export async function Header() {
  let nav = STATIC_FALLBACK_NAV;
  const [categoriesResult, breaking] = await Promise.all([
    listCategories().catch(() => []),
    getBreaking(10),
  ]);
  if (categoriesResult.length > 0) {
    nav = categoriesResult
      .filter((c) => c.isActive)
      .slice(0, 8)
      .map((c) => ({ slug: c.slug, name: c.name }));
  }

  const today = formatToday();

  return (
    <header className="border-b-[1.5px] border-ink bg-paper">
      {/* Top ad strip — hidden on mobile to free up vertical space.
          Slot is a fixed leaderboard ratio (728:90) so the image conforms
          to the slot, not the other way around. The image fills the slot
          via object-cover; designs taller than 8:1 will be cropped vertically. */}
      <div className="hidden md:flex bg-paper-2 border-b-[1.5px] border-dashed border-ink py-1.5 justify-center">
        <div className="relative w-full max-w-[728px] mx-4 aspect-[728/90] overflow-hidden rounded-sm">
          <Image
            src="/adds/add_1.png"
            alt="Advertisement"
            fill
            priority
            sizes="(max-width: 1080px) 100vw, 728px"
            className="object-cover"
          />
        </div>
      </div>

      {/* ---------- Mobile masthead ---------- */}
      <div className="md:hidden grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5">
        <MobileMenu nav={nav} todayLabel={today} />
        <div className="flex justify-center min-w-0">
          <Logo size="md" align="center" withTagline={false} />
        </div>
        <HeaderUserMenu />
      </div>

      {/* ---------- Desktop masthead ---------- */}
      <div className="hidden md:block">
        <div className="px-6 pt-4 pb-3 border-y-[1.5px] border-ink/15">
          <div className="flex items-end gap-6">
            <Logo size="lg" />
            <div className="font-hand text-[12px] text-muted pb-1.5">
              {today}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3 pb-1">
              <SearchBox />
              <button
                type="button"
                aria-label="Notifications"
                className="text-ink hover:text-accent transition-colors"
              >
                <Bell size={18} aria-hidden />
              </button>
              <HeaderUserMenu />
            </div>
          </div>
        </div>

        {/* Category nav row — desktop only */}
        <nav
          aria-label="Categories"
          className="px-6 py-2 flex items-center gap-4 border-t border-black/10 overflow-x-auto"
        >
          <Link
            href="/"
            className="font-hand text-[13px] font-bold text-accent shrink-0"
          >
            Home
          </Link>
          {nav.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="font-hand text-[13px] text-ink hover:text-accent transition-colors shrink-0"
            >
              {c.name}
            </Link>
          ))}
          <div className="flex-1" />
          <Link
            href="/videos"
            className="font-hand text-[13px] text-muted shrink-0 hover:text-accent"
          >
            Watch
          </Link>
          <Link
            href="/gallery"
            className="font-hand text-[13px] text-muted shrink-0 hover:text-accent"
          >
            Pictures
          </Link>
        </nav>
      </div>

      {/* Breaking ticker — visible on every viewport */}
      <BreakingTicker items={breaking} />
    </header>
  );
}
