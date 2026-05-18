"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { listMine } from "@/lib/api/media.api";
import type { MediaDTO, MediaType } from "@/lib/types/media";
import { cn } from "@/lib/utils/cn";
import { CloudinaryUploader } from "./CloudinaryUploader";
import { MediaCard } from "./MediaCard";

type Mode = "single" | "multi";

interface BaseProps {
  open: boolean;
  onClose: () => void;
  type: MediaType;
  /** Optional articleId attached to newly uploaded items. */
  articleId?: string;
  title?: string;
}

interface SingleProps extends BaseProps {
  mode: "single";
  onSelect: (media: MediaDTO) => void;
}
interface MultiProps extends BaseProps {
  mode: "multi";
  onSelect: (media: MediaDTO[]) => void;
}

type Props = SingleProps | MultiProps;

const PAGE_SIZE = 24;

/**
 * Drawer-style modal for picking media from the journalist's library or
 * uploading a new asset. Supports single-pick (featured image) and
 * multi-pick (gallery / video list).
 *
 * Rendered through a Portal to `document.body` so it always anchors to the
 * viewport — without this, the dashboard shell's stagger animation (which
 * leaves a `translateY(0)` transform on the page wrapper) becomes the
 * containing block and clips the drawer to the main column.
 */
export function MediaPicker(props: Props) {
  const { open, onClose, type, articleId, mode, title } = props;
  const { getIdToken } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      const result = await listMine({ type, limit: PAGE_SIZE }, token);
      setItems(result.items);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't load your library.",
      );
    } finally {
      setLoading(false);
    }
  }, [getIdToken, toast, type]);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    void refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  function handleClick(media: MediaDTO) {
    if (mode === "single") {
      props.onSelect(media);
      onClose();
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(media.id)) next.delete(media.id);
      else next.add(media.id);
      return next;
    });
  }

  function handleConfirmMulti() {
    if (mode !== "multi") return;
    const picked = items.filter((m) => selected.has(m.id));
    props.onSelect(picked);
    onClose();
  }

  const headerLabel =
    title ?? (mode === "single" ? "Pick an asset" : "Pick assets");

  return createPortal(
    <div
      data-modal-open="true"
      className="fixed inset-0 z-[60] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
    >
      <button
        type="button"
        aria-label="Close media picker"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />
      <div
        className={cn(
          "relative bg-paper border-l-[1.5px] border-ink flex flex-col h-full min-h-0",
          "w-full sm:w-[min(640px,92vw)]",
          "shadow-[-6px_0_0_var(--color-ink)]",
        )}
      >
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b-[1.5px] border-ink bg-paper shrink-0">
          <div className="min-w-0">
            <h2
              id="media-picker-title"
              className="serif text-[18px] font-extrabold tracking-tight truncate"
            >
              {headerLabel}
            </h2>
            <p className="font-hand text-[11px] text-muted">
              Type: {type} · {items.length} in library
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-sm hover:bg-paper-2 shrink-0"
          >
            <X size={16} aria-hidden />
          </button>
        </header>

        <div className="px-4 sm:px-5 py-3 border-b-[1.5px] border-ink/30 bg-paper-2 shrink-0">
          <CloudinaryUploader
            accept={type === "video" ? "video" : "image"}
            multiple={mode === "multi"}
            articleId={articleId}
            size="compact"
            onUploaded={(media) => {
              setItems((prev) => [media, ...prev]);
              if (mode === "single") {
                props.onSelect(media);
                onClose();
              } else {
                setSelected((prev) => {
                  const next = new Set(prev);
                  next.add(media.id);
                  return next;
                });
              }
            }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-3">
          {loading ? (
            <p className="font-hand text-[12px] text-muted">Loading library…</p>
          ) : items.length === 0 ? (
            <p className="font-hand text-[12px] text-muted">
              No {type === "video" ? "videos" : "images"} yet — upload one
              above to get started.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((m) => (
                <MediaCard
                  key={m.id}
                  media={m}
                  compact
                  selected={selected.has(m.id)}
                  onClick={() => handleClick(m)}
                />
              ))}
            </div>
          )}
        </div>

        {mode === "multi" ? (
          <footer
            className={cn(
              "flex items-center justify-between gap-3 px-4 sm:px-5 py-3",
              "border-t-[1.5px] border-ink bg-paper-2 shrink-0",
            )}
          >
            <span className="font-hand text-[12px] text-muted">
              {selected.size} selected
            </span>
            <div className="flex items-center gap-2">
              <Btn type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Btn>
              <Btn
                type="button"
                variant="primary"
                size="sm"
                disabled={selected.size === 0}
                onClick={handleConfirmMulti}
              >
                Add {selected.size > 0 ? `(${selected.size})` : ""}
              </Btn>
            </div>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
