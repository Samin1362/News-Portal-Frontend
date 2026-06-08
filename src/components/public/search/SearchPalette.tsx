"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Clock, CornerDownLeft, FileText, Search, Trash2, X } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { suggestArticles } from "@/lib/api/search.api";
import type { ArticleSuggestionDTO } from "@/lib/types/article";
import {
  addRecentSearch,
  clearRecentSearches,
  removeRecentSearch,
  useRecentSearches,
} from "./useRecentSearches";
import { cn } from "@/lib/utils/cn";

const DEBOUNCE_MS = 200;
const MIN = 2;

/**
 * Command-palette style search overlay (Updated-plan Phase 1). One search
 * experience for every viewport: live suggestions with match highlighting,
 * recent searches, full keyboard nav (↑/↓/Enter/Esc). Opened from the header
 * trigger or the ⌘K / `/` hotkeys (see SearchProvider).
 */
export function SearchPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const recent = useRecentSearches();
  const [value, setValue] = useState("");
  const [items, setItems] = useState<ArticleSuggestionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const term = value.trim();
  const mode: "suggest" | "recent" = term.length >= MIN ? "suggest" : "recent";
  const list = mode === "suggest" ? items : recent;

  // Reset the palette's state the moment it opens. Adjusting during render
  // (rather than in an effect) keeps the reset synchronous and avoids
  // set-state-in-effect cascades.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValue("");
      setItems([]);
      setActiveIdx(-1);
    }
  }

  // Focus the input shortly after opening (DOM side effect only).
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  // Debounced typeahead — ported from the old SearchBox.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const t = window.setTimeout(
      async () => {
        if (term.length < MIN) {
          setItems([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        const result = await suggestArticles(term, controller.signal);
        setItems(result);
        setActiveIdx(-1);
        setLoading(false);
      },
      term.length < MIN ? 0 : DEBOUNCE_MS,
    );
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [term, open]);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function runSearch(q: string) {
    const t = q.trim();
    if (t.length < MIN) return;
    addRecentSearch(t);
    go(`/search?q=${encodeURIComponent(t)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(list.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "suggest" && activeIdx >= 0 && items[activeIdx]) {
        go(`/article/${items[activeIdx].slug}`);
      } else if (mode === "recent" && activeIdx >= 0 && recent[activeIdx]) {
        runSearch(recent[activeIdx]);
      } else {
        runSearch(value);
      }
    }
    // Escape is handled by the Panel primitive.
  }

  return (
    <Panel
      open={open}
      onClose={onClose}
      align="top"
      label="Search Deligo"
      className="max-w-[600px]"
    >
      {/* Input row */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b-[1.5px] border-ink">
        <Search size={18} className="text-muted shrink-0" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setActiveIdx(-1);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search news, topics, people…"
          aria-label="Search news"
          className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[15px] text-ink placeholder:text-muted"
        />
        <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded-[3px] border border-ink/25 font-mono text-[10px] text-muted">
          Esc
        </kbd>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-muted hover:text-accent hover:bg-paper-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <X size={15} aria-hidden />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[min(60vh,420px)] overflow-y-auto">
        {mode === "recent" ? (
          recent.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="font-hand text-[10px] uppercase tracking-wider text-muted">
                  Recent searches
                </span>
                <button
                  type="button"
                  onClick={() => clearRecentSearches()}
                  className="inline-flex items-center gap-1 font-hand text-[10px] uppercase tracking-wider text-muted hover:text-accent"
                >
                  <Trash2 size={11} aria-hidden />
                  Clear
                </button>
              </div>
              <ul role="listbox" aria-label="Recent searches">
                {recent.map((t, idx) => (
                  <li key={t}>
                    <div
                      className={cn(
                        "group flex items-center",
                        idx === activeIdx && "bg-ink",
                      )}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={idx === activeIdx}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => runSearch(t)}
                        className={cn(
                          "flex-1 min-w-0 flex items-center gap-3 px-4 py-2.5 text-left font-sans text-[14px]",
                          idx === activeIdx ? "text-paper" : "text-ink",
                        )}
                      >
                        <Clock
                          size={14}
                          aria-hidden
                          className={
                            idx === activeIdx ? "text-paper/70" : "text-muted"
                          }
                        />
                        <span className="truncate">{t}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove “${t}” from recent searches`}
                        onClick={() => removeRecentSearch(t)}
                        className={cn(
                          "self-stretch px-3 flex items-center focus:outline-none",
                          idx === activeIdx
                            ? "text-paper/70 hover:text-paper"
                            : "text-muted hover:text-accent",
                        )}
                      >
                        <X size={13} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Hint>
              Search across every Deligo story. Try a topic, a person, or a
              place — then press{" "}
              <span className="text-ink font-semibold">Enter</span>.
            </Hint>
          )
        ) : loading && items.length === 0 ? (
          <SuggestSkeleton />
        ) : items.length === 0 ? (
          <Hint>
            No quick matches. Press{" "}
            <span className="text-ink font-semibold">Enter</span> to run a full
            search for “{term}”.
          </Hint>
        ) : (
          <ul role="listbox" aria-label="Suggestions">
            {items.map((s, idx) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={idx === activeIdx}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => go(`/article/${s.slug}`)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left font-sans text-[14px]",
                    idx === activeIdx
                      ? "bg-ink text-paper"
                      : "text-ink hover:bg-paper-2",
                  )}
                >
                  <FileText
                    size={14}
                    aria-hidden
                    className={
                      idx === activeIdx ? "text-paper/70" : "text-muted"
                    }
                  />
                  <span className="flex-1 min-w-0 truncate">
                    {highlight(s.headline, term)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 h-11 border-t-[1.5px] border-ink bg-paper-2">
        <button
          type="button"
          onClick={() => runSearch(value)}
          disabled={term.length < MIN}
          className={cn(
            "inline-flex items-center gap-1.5 font-hand text-[11px] uppercase tracking-wider",
            "focus:outline-none focus-visible:underline",
            term.length < MIN
              ? "text-muted/60 cursor-not-allowed"
              : "text-accent hover:underline",
          )}
        >
          <CornerDownLeft size={12} aria-hidden />
          {term.length >= MIN ? `Search “${term}”` : "Type to search"}
        </button>
        <span className="hidden sm:inline font-hand text-[10px] uppercase tracking-wider text-muted">
          ↑↓ to navigate
        </span>
      </div>
    </Panel>
  );
}

/** Highlight the first case-insensitive occurrence of the query. */
function highlight(text: string, q: string): ReactNode {
  const term = q.trim();
  if (term.length < MIN) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/15 text-inherit rounded-[2px] px-0.5">
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 py-8 text-center font-sans text-[13px] leading-relaxed text-muted">
      {children}
    </p>
  );
}

function SuggestSkeleton() {
  return (
    <ul aria-hidden className="py-2">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-2.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-paper-2 animate-pulse" />
          <span
            className="h-3.5 rounded-sm bg-paper-2 animate-pulse"
            style={{ width: `${70 - i * 12}%` }}
          />
        </li>
      ))}
    </ul>
  );
}
