/** Background films are heavy, so they are opt-in: only screens from md up,
    not on a metered or slow connection, and not asking for less motion. Every
    other visitor gets the poster still, which costs nothing extra. */
export function canPlayBackgroundVideo() {
  if (typeof window === "undefined") return false;
  const wide = window.matchMedia("(min-width: 768px)").matches;
  const calm = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Chrome-only, hence the cast; absent elsewhere, which counts as fine.
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const fast = !conn?.saveData && !/2g/.test(conn?.effectiveType ?? "");
  return wide && calm && fast;
}
