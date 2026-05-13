import Link from "next/link";
import { Btn } from "@/components/ui/Btn";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center px-4 py-16 bg-paper">
      <div className="max-w-md text-center">
        <p className="font-hand text-[12px] text-accent tracking-widest">
          404
        </p>
        <h1 className="serif text-[48px] font-extrabold tracking-tight mt-1 leading-none">
          Off the press.
        </h1>
        <p className="font-sans text-[14px] text-muted mt-3 leading-relaxed">
          We couldn't find the story you were looking for. It may have been
          unpublished, archived, or never existed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Btn variant="primary">
            <Link href="/">Back to homepage</Link>
          </Btn>
          <Btn variant="ghost">
            <Link href="/search">Search news</Link>
          </Btn>
        </div>
      </div>
    </div>
  );
}
