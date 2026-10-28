import { useEffect, useState } from "react";
import useInViewOnce from "./useInViewOnce";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Splits "75,000+" into 75000 and "+" — the digits to count to, and whatever
    the figure is written with (a plus, a "K", a unit). */
export function parseFigure(text: string): { value: number; prefix: string; suffix: string } {
  const match = text.match(/[\d,.\s]*\d/);
  if (!match) return { value: 0, prefix: "", suffix: text };
  const digits = match[0];
  const start = match.index ?? 0;
  return {
    value: Number(digits.replace(/[,\s]/g, "")),
    prefix: text.slice(0, start),
    suffix: text.slice(start + digits.length),
  };
}

/** A figure that counts up from zero the first time it scrolls into view, over
    1.6s with easeOutCubic. The text it lands on is exactly `text`, so the
    heading reads the same once it is done. With reduced motion it is simply
    there. Reserve the line's width with tabular-nums on the caller. */
export default function CountUp({ text, className = "" }: { text: string; className?: string }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>(0.4);
  const { value, prefix, suffix } = parseFigure(text);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion() || typeof requestAnimationFrame === "undefined") {
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1600, 1);
      setShown(Math.round(value * easeOutCubic(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {/* The final text equals `text` exactly: screen readers get that, not the count */}
      <span aria-hidden="true">
        {prefix}
        {shown.toLocaleString("en-US")}
        {suffix}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
