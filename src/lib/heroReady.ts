/* ── First hero media gate ──
   The home hero opens on a video, which needs a moment to buffer. The
   preloader waits for it, so the page is never revealed on an empty backdrop.

   The hero and the preloader never meet in the tree (one is routed, the other
   is the shell), so readiness travels through this module instead of props.
   `whenHeroReady` resolves as soon as the hero reports in, and the shell's own
   safety net means a stalled or absent video can never hold the page: a route
   that has no hero simply never calls `markHeroReady`, and the net fires. */

let ready = false;
const waiting = new Set<() => void>();

/** Called by the hero once its first slide can paint. */
export function markHeroReady() {
  if (ready) return;
  ready = true;
  waiting.forEach((fn) => fn());
  waiting.clear();
}

/** Resolves when the hero's first slide is ready, or at once if it already is. */
export function whenHeroReady(): Promise<void> {
  if (ready) return Promise.resolve();
  return new Promise((resolve) => waiting.add(resolve));
}
