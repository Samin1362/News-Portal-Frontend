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
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
