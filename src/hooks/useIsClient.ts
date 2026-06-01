import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `false` during SSR and the very first (server-matched) client
 * render, then `true` once running on the client. A drop-in, purity-safe
 * replacement for the `useState(false)` + `useEffect(() => setMounted(true))`
 * pattern — it never sets state in an effect, so it satisfies
 * `react-hooks/set-state-in-effect` while still gating portals that need
 * `document`.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
