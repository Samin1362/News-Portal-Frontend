import Link from "next/link";

const FOOTER_NAV = [
  {
    title: "Newsroom",
    links: [
      { label: "Latest", href: "/" },
      { label: "Politics", href: "/category/politics" },
      { label: "World", href: "/category/international" },
      { label: "Business", href: "/category/business" },
      { label: "Sports", href: "/category/sports" },
    ],
  },
  {
    title: "Multimedia",
    links: [
      { label: "Video", href: "/videos" },
      { label: "Photo gallery", href: "/gallery" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Editorial",
    links: [
      { label: "About Deligo", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Style guide", href: "/style-guide" },
      { label: "Corrections", href: "/corrections" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t-[1.5px] border-ink bg-paper-2">
      <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="serif text-[22px] font-extrabold leading-none tracking-tight">
              Deligo
            </span>
            <span className="font-hand text-[11px] text-accent">· daily</span>
          </Link>
          <p className="mt-2 font-hand text-[12px] text-muted leading-snug max-w-xs">
            Independent reporting from the newsroom. Published every day.
          </p>
        </div>

        {FOOTER_NAV.map((col) => (
          <div key={col.title}>
            <div className="serif text-[14px] font-bold tracking-tight mb-2">
              {col.title}
            </div>
            <ul className="space-y-1.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-hand text-[12px] text-ink hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-black/10">
        <div className="max-w-[1280px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-hand text-[11px] text-muted">
            © {new Date().getFullYear()} Deligo News. All rights reserved.
          </span>
          <div className="flex gap-3">
            <Link
              href="/privacy"
              className="font-hand text-[11px] text-muted hover:text-accent"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-hand text-[11px] text-muted hover:text-accent"
            >
              Terms
            </Link>
            <Link
              href="/rss"
              className="font-hand text-[11px] text-muted hover:text-accent"
            >
              RSS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
