"use client";

import { Check, Plus } from "lucide-react";
import { useToast } from "@/lib/ui/toast";
import {
  toggleFollow,
  useFollows,
  type FollowTarget,
} from "@/lib/reading/followsStore";
import { cn } from "@/lib/utils/cn";

/**
 * "Follow this section" chip (Phase 4) for category pages. Optimistic via the
 * local follows store; followed sections surface on the homepage "Following"
 * strip. No backend.
 */
export function FollowButton({
  category,
  className,
}: {
  category: FollowTarget;
  className?: string;
}) {
  const { ids } = useFollows();
  const toast = useToast();
  const following = ids.has(category.id);

  function onClick() {
    const now = toggleFollow(category);
    if (now) toast.success(`Following ${category.name}`);
    else toast.info(`Unfollowed ${category.name}`);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={following}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 h-[34px] border-[1.5px] rounded-full font-hand text-[12px] uppercase tracking-wider transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        following
          ? "border-accent-2 bg-accent-2 text-paper"
          : "border-ink bg-paper text-ink hover:bg-paper-2",
        className,
      )}
    >
      {following ? (
        <>
          <Check size={14} aria-hidden />
          Following
        </>
      ) : (
        <>
          <Plus size={14} aria-hidden />
          Follow
        </>
      )}
    </button>
  );
}
