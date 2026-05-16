"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Film, ImageIcon, Trash2 } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRequireRole } from "@/lib/auth/useRequireRole";
import { useToast } from "@/lib/ui/toast";
import {
  deleteMedia,
  listMine,
  updateMedia,
  type ListMediaQuery,
} from "@/lib/api/media.api";
import { CloudinaryUploader } from "@/components/dashboard/articles/CloudinaryUploader";
import { Pagination } from "@/components/public/Pagination";
import type { MediaDTO, MediaType } from "@/lib/types/media";

const PAGE_SIZE = 24;
const TABS: Array<{ key: "all" | MediaType; label: string }> = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
];

export default function MediaLibraryPage() {
  const guard = useRequireRole(["journalist", "editor", "admin"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getIdToken } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const type = (searchParams.get("type") ?? "all") as "all" | MediaType;
  const page = Number(searchParams.get("page") ?? "1");
  const unattached = searchParams.get("unattached") === "true";

  const apiQuery: ListMediaQuery = useMemo(
    () => ({
      type: type === "all" ? undefined : type,
      page,
      limit: PAGE_SIZE,
      unattached: unattached || undefined,
    }),
    [type, page, unattached],
  );

  const mediaQuery = useQuery({
    enabled: guard.isAllowed,
    queryKey: ["media", "mine", apiQuery],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      return listMine(apiQuery, token);
    },
  });

  function setQueryParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value == null || value === "") params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    router.replace(`/dashboard/media?${params.toString()}`);
  }

  async function handleDelete(item: MediaDTO) {
    if (!window.confirm(`Delete "${item.alt || item.publicId}"?`)) return;
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      await deleteMedia(item.id, token);
      toast.success("Asset removed.");
      qc.invalidateQueries({ queryKey: ["media", "mine"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't delete.";
      toast.error(msg);
    }
  }

  if (guard.loading || !guard.isAllowed) {
    return (
      <p className="font-hand text-[12px] text-muted">Checking access…</p>
    );
  }

  const items = mediaQuery.data?.items ?? [];
  const meta = mediaQuery.data?.meta;

  return (
    <div className="max-w-[1180px] mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SectionTitle>Media library</SectionTitle>
      </div>

      <div className="border-[1.5px] border-ink rounded-sm bg-paper p-4">
        <h3 className="font-hand text-[11px] uppercase tracking-[0.18em] text-muted mb-2">
          Upload
        </h3>
        <CloudinaryUploader
          accept="any"
          multiple
          onUploaded={() =>
            qc.invalidateQueries({ queryKey: ["media", "mine"] })
          }
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {TABS.map((t) => {
            const active = type === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() =>
                  setQueryParam("type", t.key === "all" ? null : t.key)
                }
                className={
                  active
                    ? "px-2.5 py-1 border-[1.5px] border-ink rounded-full font-hand text-[11px] bg-ink text-paper"
                    : "px-2.5 py-1 border-[1.5px] border-ink rounded-full font-hand text-[11px] hover:bg-paper-2"
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <label className="ml-auto flex items-center gap-2 font-hand text-[11px] text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={unattached}
            onChange={(e) =>
              setQueryParam("unattached", e.target.checked ? "true" : null)
            }
            className="accent-accent w-3.5 h-3.5"
          />
          Show only unused
        </label>
      </div>

      {mediaQuery.isLoading ? (
        <p className="font-hand text-[12px] text-muted">Loading library…</p>
      ) : mediaQuery.isError ? (
        <p className="font-hand text-[12px] text-accent">
          Couldn't load your media.{" "}
          <button
            type="button"
            onClick={() => mediaQuery.refetch()}
            className="underline"
          >
            Retry
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="font-hand text-[12px] text-muted">
          No media here yet — upload something above.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <li
              key={m.id}
              className="border-[1.5px] border-ink rounded-sm bg-paper overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-[4/3] bg-ink/90">
                {m.type === "video" ? (
                  <>
                    <video
                      src={m.url}
                      preload="metadata"
                      muted
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-paper">
                      <Film size={26} aria-hidden />
                    </span>
                  </>
                ) : (
                  <Image
                    src={m.url}
                    alt={m.alt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-3 space-y-2 flex-1 flex flex-col">
                <div className="flex items-center gap-2 font-hand text-[11px] text-muted">
                  {m.type === "video" ? (
                    <Film size={11} aria-hidden />
                  ) : (
                    <ImageIcon size={11} aria-hidden />
                  )}
                  <span className="truncate">{m.publicId}</span>
                </div>
                <InlineMetaEditor
                  media={m}
                  onSaved={() =>
                    qc.invalidateQueries({ queryKey: ["media", "mine"] })
                  }
                />
                <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                  <span className="font-hand text-[10px] text-muted">
                    {m.articleId ? "Attached" : "Unused"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(m)}
                    aria-label="Delete asset"
                    className="inline-flex items-center justify-center w-8 h-8 border-[1.5px] border-ink rounded-sm hover:bg-accent hover:text-paper"
                  >
                    <Trash2 size={12} aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.totalPages > 1 ? (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hrefFor={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(p));
            return `/dashboard/media?${params.toString()}`;
          }}
        />
      ) : null}
    </div>
  );
}

function InlineMetaEditor({
  media,
  onSaved,
}: {
  media: MediaDTO;
  onSaved: () => void;
}) {
  const { getIdToken } = useAuth();
  const toast = useToast();
  const [alt, setAlt] = useState(media.alt ?? "");
  const [caption, setCaption] = useState(media.caption ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = alt !== (media.alt ?? "") || caption !== (media.caption ?? "");

  async function save() {
    setSaving(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      await updateMedia(media.id, { alt, caption }, token);
      toast.success("Updated.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Alt text"
        maxLength={500}
      />
      <Input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption"
        maxLength={500}
      />
      {dirty ? (
        <Btn
          type="button"
          variant="primary"
          size="sm"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </Btn>
      ) : null}
    </div>
  );
}
