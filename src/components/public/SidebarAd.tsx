import Image from "next/image";

/**
 * Sidebar ad — fixed IAB-medium-rectangle ratio (6:5, matches the standard
 * 300×250 sidebar slot). Image conforms to the slot via object-cover so the
 * container size doesn't change per asset. Reused on every public page with
 * a sidebar (homepage, category, tag, article).
 */
export function SidebarAd() {
  return (
    <div className="relative w-full aspect-[6/5] overflow-hidden rounded-sm">
      <Image
        src="/adds/ads-3.png"
        alt="Advertisement"
        fill
        sizes="300px"
        className="object-cover"
      />
    </div>
  );
}
