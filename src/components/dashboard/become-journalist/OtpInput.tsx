"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  /** Fires when the user enters the final digit — used to auto-submit. */
  onComplete?: (full: string) => void;
  disabled?: boolean;
  /** Reset internal refs/focus when toggled. */
  resetSignal?: number;
}

/**
 * 6 (default) single-character inputs in a row. Auto-advance on entry,
 * backspace jumps back, paste of a `length`-digit string fills all cells.
 * Numeric inputMode for mobile keypads.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  resetSignal,
}: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const prevResetSignalRef = useRef<number | undefined>(resetSignal);

  // When the parent bumps `resetSignal` we snap focus back to the first cell.
  // Focusing fires `onFocus`, which calls setFocusIdx — so we never
  // setState directly inside the effect.
  useEffect(() => {
    if (resetSignal === undefined) return;
    if (prevResetSignalRef.current === resetSignal) return;
    prevResetSignalRef.current = resetSignal;
    refs.current[0]?.focus();
  }, [resetSignal]);

  // Normalise the controlled value to exactly `length` chars (pad with " ").
  const padded = value.padEnd(length, " ");

  const setDigit = (idx: number, ch: string) => {
    const next = padded.split("");
    next[idx] = ch || " ";
    const joined = next.join("").replace(/\s+$/u, "");
    onChange(joined);
    if (ch && idx < length - 1) {
      refs.current[idx + 1]?.focus();
      setFocusIdx(idx + 1);
    }
    const compact = joined.replace(/\s/gu, "");
    if (compact.length === length) onComplete?.(compact);
  };

  const handleKeyDown = (
    idx: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (padded[idx] === " " && idx > 0) {
        e.preventDefault();
        refs.current[idx - 1]?.focus();
        setFocusIdx(idx - 1);
        setDigit(idx - 1, "");
      } else {
        setDigit(idx, "");
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      refs.current[idx - 1]?.focus();
      setFocusIdx(idx - 1);
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      e.preventDefault();
      refs.current[idx + 1]?.focus();
      setFocusIdx(idx + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D+/gu, "");
    if (!text) return;
    e.preventDefault();
    const trimmed = text.slice(0, length);
    onChange(trimmed);
    const target = Math.min(trimmed.length, length - 1);
    refs.current[target]?.focus();
    setFocusIdx(target);
    if (trimmed.length === length) onComplete?.(trimmed);
  };

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length }).map((_, idx) => {
        const ch = padded[idx];
        const isFocus = focusIdx === idx;
        return (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            inputMode="numeric"
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            type="text"
            maxLength={1}
            disabled={disabled}
            value={ch === " " ? "" : ch}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/gu, "").slice(-1);
              setDigit(idx, v);
            }}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusIdx(idx)}
            aria-label={`Digit ${idx + 1}`}
            className={cn(
              "w-10 h-12 sm:w-12 sm:h-14 text-center serif text-[22px] font-extrabold",
              "border-[1.5px] border-ink rounded-sm bg-paper outline-none",
              "transition-shadow",
              isFocus ? "ring-2 ring-accent/30 border-accent" : "",
              disabled ? "opacity-60" : "",
            )}
          />
        );
      })}
    </div>
  );
}
