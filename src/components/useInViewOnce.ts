import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/** True from the first time the element is at least `threshold` in view. One
    observer per element, disconnected once it fires. Without
    IntersectionObserver, or with reduced motion, it is true straight away. */
export default function useInViewOnce<T extends Element>(threshold = 0.6): [RefObject<T>, boolean] {
  const ref = useRef<T>(null!);
  const [inView, setInView] = useState(
    () =>
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = ref.current;
    if (inView || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold]);

  return [ref, inView];
}
