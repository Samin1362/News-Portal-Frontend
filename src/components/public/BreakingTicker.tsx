/**
 * BreakingTicker — Phase 1 shell.
 *
 * Renders the BREAKING red tag + an ink-bg marquee of placeholder items.
 * Phase 3 swaps the placeholder array for a server-side fetch of
 * `GET /api/v1/public/breaking` and renders article headlines + links.
 */

const PLACEHOLDER_ITEMS = [
  "Parliament passes contested tribunal bill in late-night session",
  "Rain forecast: monsoon expected to hit western coast by Friday",
  "Stock index closes 1.4% higher after central bank hold decision",
  "Bridge collapse in northern district leaves three injured",
  "Cricket: national side names squad for upcoming three-match tour",
];

export function BreakingTicker() {
  // Render the items twice back-to-back so the CSS marquee loops seamlessly.
  const looped = [...PLACEHOLDER_ITEMS, ...PLACEHOLDER_ITEMS];

  return (
    <div className="flex items-center gap-3 bg-ink text-paper overflow-hidden">
      <span className="bg-accent text-paper font-hand font-bold text-[12px] tracking-widest px-3 py-1.5 shrink-0">
        BREAKING
      </span>
      <div className="flex-1 overflow-hidden">
        <div className="ticker-track font-hand text-[12px]">
          {looped.map((text, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span aria-hidden>●</span>
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
      <span className="font-hand text-[11px] text-paper/60 pr-3 shrink-0 hidden md:inline">
        10 items · 24h
      </span>
    </div>
  );
}
