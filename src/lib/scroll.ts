import type Lenis from "lenis";

/* ── The one Lenis instance ──
   SmoothScroll owns it; everything else reaches it through here, so no page
   has to import Lenis or care whether it exists (it does not under reduced
   motion, and not before the component mounts). */

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}

function headerHeight(): number {
  if (typeof window === "undefined") return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  return parseFloat(raw) || 0;
}

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scrolls to an element or an absolute offset, clearing the fixed header.
    `immediate` jumps there with no animation (the old `behavior: "instant"`).
    Falls back to the native scroll when Lenis is not running. */
export function scrollToTarget(
  target: Element | number,
  opts: { offset?: number; immediate?: boolean } = {},
) {
  const offset = opts.offset ?? -headerHeight();
  const immediate = opts.immediate || reducedMotion();

  if (lenis) {
    lenis.scrollTo(target as HTMLElement | number, {
      offset,
      immediate,
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
    return;
  }

  const behavior: ScrollBehavior = immediate ? "instant" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }
  // scroll-margin-top on the section already clears the header here
  target.scrollIntoView({ behavior, block: "start" });
}
