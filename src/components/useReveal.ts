import { useLayoutEffect } from "react";

const STEP_MS = 60;
const MAX_STEPS = 6;

/** On-scroll reveal for the current page. Blocks marked `data-reveal` fade up
    once they are about 15% into the viewport; children of a
    `data-reveal-stagger` container do so 60ms apart, at most 360ms, counted
    within each batch that enters together. Each block plays once.

    Nothing is hidden until this runs: html.reveal-ready and
    data-reveal="hidden" are set here, only on blocks that are out of view, and
    never with reduced motion or without IntersectionObserver. Pass the
    pathname: the page is re-scanned on every route change, and the observer
    disconnects when the route unmounts. */
export default function useReveal(routeKey: string, enabled = true) {
  useLayoutEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    document.documentElement.classList.add("reveal-ready");

    // Children of a stagger group reveal one by one, unless a child marks its
    // own content (a hairline grid keeps its cells and reveals what is inside).
    main.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
      for (const child of group.children)
        if (!child.hasAttribute("data-reveal") && !child.querySelector("[data-reveal]")) child.setAttribute("data-reveal", "");
    });

    const pending: HTMLElement[] = [];
    main.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.reveal === "static" || el.dataset.reveal === "shown") return;
      const r = el.getBoundingClientRect();
      const inView = r.top < window.innerHeight && r.bottom > 0;
      // Already on screen, or not rendered at this width: leave it visible.
      if (inView || r.height === 0) el.dataset.reveal = "static";
      else {
        el.dataset.reveal = "hidden";
        pending.push(el);
      }
    });
    if (!pending.length) return;

    const show = (els: HTMLElement[]) => {
      const batch = new Map<Element, number>();
      for (const el of els) {
        const group = el.parentElement?.closest("[data-reveal-stagger]") ?? null;
        const step = group ? (batch.get(group) ?? 0) : 0;
        if (group) batch.set(group, step + 1);
        el.style.setProperty("--reveal-delay", `${Math.min(step, MAX_STEPS) * STEP_MS}ms`);
        el.dataset.reveal = "shown";
        io.unobserve(el);
      }
    };

    const io = new IntersectionObserver(
      (entries) => show(entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)),
      { rootMargin: "0px 0px -15% 0px" },
    );
    pending.forEach((el) => io.observe(el));

    // At the foot of the page a block may never climb 15% in: show what is on screen.
    const onScroll = () => {
      const root = document.documentElement;
      if (window.scrollY + window.innerHeight < root.scrollHeight - 4) return;
      show(
        pending.filter((el) => el.dataset.reveal === "hidden" && el.getBoundingClientRect().top < window.innerHeight),
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [routeKey, enabled]);
}
