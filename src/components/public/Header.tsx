import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { listCategories } from "@/lib/api/categories.api";
import { AdSlot } from "@/components/ui/AdSlot";
import { BreakingTicker } from "./BreakingTicker";
import { HeaderUserMenu } from "./HeaderUserMenu";

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
 * Server component. Fetches the category list at request time (with backend
 * `GET /categories` cached 5 minutes by the API client). Falls back to a
 * static list if the backend is unreachable so the header still renders.
 */
export async function Header() {
  let nav = STATIC_FALLBACK_NAV;
  try {
    const categories = await listCategories();
    if (categories.length > 0) {
      nav = categories
        .filter((c) => c.isActive)
        .slice(0, 8)
        .map((c) => ({ slug: c.slug, name: c.name }));
    }
  } catch {
    // Backend cold-start or unreachable — fall back silently.
  }

  return (
    <header className="border-b-[1.5px] border-ink bg-paper">
      {/* Top ad strip */}
      <div className="bg-paper-2 border-b-[1.5px] border-dashed border-ink py-1.5 flex justify-center">
        <div className="w-full max-w-[728px] px-4">
          <AdSlot placement="home_top" height={56} />
        </div>
      </div>

      {/* Logo + utility row */}
      <div className="px-6 py-2.5 flex items-center gap-4">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="serif text-[28px] font-extrabold leading-none tracking-tight">
            Deligo
          </span>
          <span className="font-hand text-[11px] text-accent">· daily</span>
        </Link>
        <span className="font-hand text-[11px] text-muted ml-1">
          {formatToday()}
        </span>

        <div className="flex-1" />

        <label
          className="hidden md:flex items-center gap-1.5 h-[30px] w-[220px] px-2 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-muted"
          aria-label="Search news"
        >
          <Search size={14} aria-hidden />
          <input
            type="search"
            placeholder="Search news…"
            className="bg-transparent flex-1 outline-none font-hand text-[12px] text-ink placeholder:text-muted"
          />
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="text-ink hover:text-accent transition-colors"
        >
          <Bell size={18} aria-hidden />
        </button>

        <HeaderUserMenu />
      </div>

      {/* Category nav row */}
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
          href="/categories"
          className="font-hand text-[13px] text-muted shrink-0"
        >
          ≡ More
        </Link>
      </nav>

      {/* Breaking ticker */}
      <BreakingTicker />
    </header>
  );
}
