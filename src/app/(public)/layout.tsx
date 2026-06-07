import type { ReactNode } from "react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

/**
 * Wraps every reader-facing page (homepage, category, article, tag, author,
 * search, gallery, videos). Header is a Server Component that fetches the
 * category list at request time.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-paper">
      {/* Skip link (Phase 7 a11y) — first focusable element; visible on focus. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border-[1.5px] focus:border-ink focus:bg-paper focus:px-3 focus:py-1.5 focus:font-hand focus:text-[12px]"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
