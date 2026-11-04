import { useEffect, useState } from "react";
import Lenis from "lenis";
import { setLenis } from "../lib/scroll";

/** Lenis for the window, mounted once in the Shell. Wheel and keys are
    smoothed; touch keeps native scrolling (Lenis's default). Anchors are left
    to the router, which routes them through scrollToTarget.

    Nothing is created under reduced motion, and the setting is watched, so
    turning it on tears the instance down. While the body is scroll-locked (the
    mobile menu, the chat sheet, a dialog) Lenis is stopped, which it learns by
    watching body.style.overflow — the same lock those components already set. */
export default function SmoothScroll() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;

    // Lenis drives its own frame loop (autoRaf), so there is no second loop here
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
    });
    setLenis(lenis);

    // html.is-scrolling while the page moves, off 150ms after it stops: costly
    // decoration (the floating garment icons) holds still meanwhile
    const root = document.documentElement;
    let idle: number | undefined;
    const onScroll = () => {
      if (!root.classList.contains("is-scrolling")) root.classList.add("is-scrolling");
      window.clearTimeout(idle);
      idle = window.setTimeout(() => root.classList.remove("is-scrolling"), 150);
    };
    lenis.on("scroll", onScroll);

    // The body scroll lock is the signal that something modal is open; a native
    // <dialog> (the gallery lightbox) locks the page itself, without touching it.
    const locked = () =>
      document.body.style.overflow === "hidden" || document.querySelector("dialog[open]") !== null;
    const syncLock = () => {
      if (locked()) lenis.stop();
      else lenis.start();
    };
    syncLock();
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    // <dialog open> appears and disappears anywhere under the body
    const dialogObserver = new MutationObserver(syncLock);
    dialogObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

    return () => {
      observer.disconnect();
      dialogObserver.disconnect();
      window.clearTimeout(idle);
      root.classList.remove("is-scrolling");
      lenis.off("scroll", onScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
