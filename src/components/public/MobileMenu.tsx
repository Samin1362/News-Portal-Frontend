"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  slug: string;
  name: string;
}

interface Props {
  nav: NavItem[];
  todayLabel: string;
}

/**
 * Mobile-only header companion: a hamburger button + a slide-down drawer.
 * Contains a Kalam datestamp, full search field, full category list, and an
 * auth-aware CTA row. Closes automatically on route change and on Escape.
 */
export function MobileMenu({ nav, todayLabel }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, profile, signOut } = useAuth();

  // Close the drawer whenever the route changes. Tracking the previous path
  // and adjusting during render (rather than in an effect) keeps the close
  // synchronous and avoids set-state-in-effect.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    router.replace("/");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-sm bg-paper text-ink hover:bg-paper-2"
      >
        <Menu size={18} aria-hidden />
      </button>

      {open ? (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 bg-ink/40 z-40"
          />
          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            className="md:hidden fixed inset-x-0 top-0 z-50 bg-paper border-b-[1.5px] border-ink max-h-[100dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-[1.5px] border-ink">
              <span className="font-hand text-[11px] text-muted uppercase tracking-[0.28em]">
                Menu
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-sm hover:bg-paper-2"
              >
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="px-4 py-4 space-y-5">
              <div className="font-hand text-[12px] text-muted">
                {todayLabel}
              </div>

              {/* Account block */}
              <div className="border-[1.5px] border-ink rounded-sm bg-paper-2 p-3">
                {firebaseUser ? (
                  <div className="space-y-2">
                    <div className="font-sans text-[13px] text-ink truncate">
                      {profile?.displayName ?? firebaseUser.email}
                    </div>
                    <div className="font-hand text-[11px] text-accent">
                      {profile?.role ?? "reader"}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Btn variant="solid" size="sm" className="flex-1">
                        <Link href="/dashboard">Dashboard</Link>
                      </Btn>
                      <Btn variant="default" size="sm" className="flex-1">
                        <Link href="/profile">Profile</Link>
                      </Btn>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full mt-1 px-2 py-1.5 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-accent hover:bg-paper"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Btn variant="ghost" size="sm" className="flex-1">
                      <Link href="/login">Sign in</Link>
                    </Btn>
                    <Btn variant="solid" size="sm" className="flex-1">
                      <Link href="/register">Subscribe</Link>
                    </Btn>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <div className="font-hand text-[11px] text-muted uppercase tracking-[0.28em] mb-2">
                  Sections
                </div>
                <ul className="border-[1.5px] border-ink rounded-sm divide-y divide-black/10 bg-paper">
                  <li>
                    <Link
                      href="/"
                      className={cn(
                        "block px-3 py-2.5 font-hand text-[14px]",
                        pathname === "/"
                          ? "bg-ink text-paper"
                          : "text-ink hover:bg-paper-2",
                      )}
                    >
                      Home
                    </Link>
                  </li>
                  {nav.map((c) => {
                    const href = `/category/${c.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={c.slug}>
                        <Link
                          href={href}
                          className={cn(
                            "block px-3 py-2.5 font-hand text-[14px]",
                            active
                              ? "bg-ink text-paper"
                              : "text-ink hover:bg-paper-2",
                          )}
                        >
                          {c.name}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <Link
                      href="/videos"
                      className="block px-3 py-2.5 font-hand text-[14px] text-ink hover:bg-paper-2"
                    >
                      Watch
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/gallery"
                      className="block px-3 py-2.5 font-hand text-[14px] text-ink hover:bg-paper-2"
                    >
                      In pictures
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
