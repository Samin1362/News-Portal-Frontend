"use client";

import { useCallback, useEffect, useState } from "react";
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
 */
export function MediaPicker(props: Props) {
  const { open, onClose, type, articleId, mode, title } = props;
  const { getIdToken } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  if (!open) return null;

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

  return (
    <>
      <button
        type="button"
        aria-label="Close media picker"
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 z-40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[640px] bg-paper border-l-[1.5px] border-ink flex flex-col"
      >
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b-[1.5px] border-ink">
          <div className="min-w-0">
            <h2
              id="media-picker-title"
              className="serif text-[18px] font-extrabold tracking-tight"
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
            className="inline-flex items-center justify-center w-9 h-9 border-[1.5px] border-ink rounded-sm hover:bg-paper-2"
          >
            <X size={16} aria-hidden />
          </button>
        </header>

        <div className="px-4 py-3 border-b-[1.5px] border-ink/30 bg-paper-2">
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

        <div className="flex-1 overflow-y-auto px-4 py-3">
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
              "flex items-center justify-between gap-3 px-4 py-3",
              "border-t-[1.5px] border-ink bg-paper-2",
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
    </>
  );
}
