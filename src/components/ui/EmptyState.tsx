import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Empty state (Phase 7). A centered, editorial "nothing here yet" block with
 * an optional icon and call-to-action. Keeps blank lists from looking broken.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-[1.5px] border-dashed border-ink/30 rounded-sm",
        "flex flex-col items-center justify-center text-center px-6 py-12",
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 text-muted" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h3 className="serif text-[18px] font-extrabold tracking-tight">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 font-sans text-[13px] text-muted max-w-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
