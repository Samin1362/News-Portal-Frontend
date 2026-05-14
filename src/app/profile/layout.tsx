import type { ReactNode } from "react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-paper">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
