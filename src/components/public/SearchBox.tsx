"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { suggestArticles } from "@/lib/api/search.api";
import type { ArticleSuggestionDTO } from "@/lib/types/article";
import { cn } from "@/lib/utils/cn";

const DEBOUNCE_MS = 200;

export function SearchBox() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [items, setItems] = useState<ArticleSuggestionDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value.trim().length < 2) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      const result = await suggestArticles(value, controller.signal);
      setItems(result);
      setActiveIdx(-1);
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(q: string) {
    const term = q.trim();
    if (term.length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit(value);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        setOpen(false);
        router.push(`/article/${items[activeIdx].slug}`);
      } else {
        submit(value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative hidden md:block" ref={boxRef}>
      <label
        className="flex items-center gap-1.5 h-[30px] w-[220px] px-2 border-[1.5px] border-ink rounded-sm font-hand text-[12px] text-muted"
        aria-label="Search news"
      >
        <Search size={14} aria-hidden />
        <input
          type="search"
          placeholder="Search news…"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="bg-transparent flex-1 outline-none font-hand text-[12px] text-ink placeholder:text-muted min-w-0"
        />
      </label>

      {open && value.trim().length >= 2 ? (
        <div className="absolute right-0 mt-1 w-[320px] border-[1.5px] border-ink rounded-sm bg-paper shadow-sm z-50 max-h-[360px] overflow-auto">
          {items.length === 0 ? (
            <div className="px-3 py-3 font-hand text-[11px] text-muted">
              No suggestions. Press enter to run a full search.
            </div>
          ) : (
            <ul role="listbox">
              {items.map((s, idx) => (
                <li key={s.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={idx === activeIdx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => {
                      setOpen(false);
                      router.push(`/article/${s.slug}`);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 font-sans text-[13px] block",
                      idx === activeIdx
                        ? "bg-ink text-paper"
                        : "text-ink hover:bg-paper-2",
                    )}
                  >
                    {s.headline}
                  </button>
                </li>
              ))}
              <li className="border-t border-black/10">
                <button
                  type="button"
                  onClick={() => submit(value)}
                  className="w-full text-left px-3 py-2 font-hand text-[11px] text-accent hover:bg-paper-2"
                >
                  Search “{value}” →
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
