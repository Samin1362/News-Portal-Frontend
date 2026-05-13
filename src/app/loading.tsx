export default function Loading() {
  return (
    <div className="min-h-full flex items-center justify-center px-4 py-16 bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div
          aria-hidden
          className="h-8 w-8 rounded-full border-[1.5px] border-ink border-t-accent animate-spin"
        />
        <span className="font-hand text-[12px] text-muted">
          Loading the newsroom…
        </span>
      </div>
    </div>
  );
}
