"use client";

import { useState } from "react";
import { Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  url: string;
  title: string;
}

function shareTargets(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${t}%20${u}`,
    },
  ];
}

export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const targets = shareTargets(url, title);

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & {
          share: (data: { title: string; url: string }) => Promise<void>;
        }).share({ title, url });
      } catch {
        // user cancelled — no-op
      }
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard refused — fall through
    }
  }

  const hasNative =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex items-center flex-wrap gap-2">
      <span className="font-hand text-[11px] text-muted uppercase tracking-wider mr-1">
        Share
      </span>
      {targets.map((t) => (
        <a
          key={t.key}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2 h-[28px] border-[1.5px] border-ink rounded-sm font-hand text-[11px] hover:bg-paper-2"
        >
          {t.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className={cn(
          "inline-flex items-center gap-1 px-2 h-[28px] border-[1.5px] border-ink rounded-sm font-hand text-[11px]",
          copied ? "bg-accent-2 text-paper" : "hover:bg-paper-2",
        )}
      >
        <Link2 size={12} aria-hidden />
        {copied ? "Copied" : "Copy link"}
      </button>
      {hasNative ? (
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex items-center gap-1 px-2 h-[28px] border-[1.5px] border-ink rounded-sm font-hand text-[11px] hover:bg-paper-2"
        >
          <Share2 size={12} aria-hidden />
          More
        </button>
      ) : null}
    </div>
  );
}
