import { useEffect, useRef, useState } from "react";
import useInViewOnce from "./useInViewOnce";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Splits "75,000+" into 75000 and "+" — the digits to count to, and whatever
    the figure is written with (a "$", a plus, a "K", a unit). `decimals` and
    `grouped` say how the digits are written, so the count lands on them
    exactly: "1984" stays "1984", "29.1" keeps its decimal. */
export function parseFigure(text: string): {
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
  grouped: boolean;
} {
  const match = text.match(/[\d,.\s]*\d/);
  if (!match) return { value: 0, prefix: "", suffix: text, decimals: 0, grouped: false };
  const digits = match[0];
  const start = match.index ?? 0;
  const point = digits.indexOf(".");
  return {
    value: Number(digits.replace(/[,\s]/g, "")),
    prefix: text.slice(0, start),
    suffix: text.slice(start + digits.length),
    decimals: point < 0 ? 0 : digits.length - point - 1,
    grouped: digits.includes(","),
  };
}

/** A figure that counts up from zero the first time it scrolls into view, over
    1.6s with easeOutCubic. The text it lands on is exactly `text`, so the
    heading reads the same once it is done. With reduced motion it is simply
    there. Reserve the line's width with tabular-nums on the caller. `delay`
    (ms) holds the count at zero first, to stagger a row of figures. */
export default function CountUp({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>(0.4);
  const { value, prefix, suffix, decimals, grouped } = parseFigure(text);
  const [shown, setShown] = useState(0);
  const textRef = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    prefix +
    n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped }) +
    suffix;

  // The count writes straight into its text node each frame and commits to
  // React state only once, when it lands: a figure counting while the page
  // scrolls costs no renders.
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion() || typeof requestAnimationFrame === "undefined") {
      setShown(value);
      return;
    }
    const start = performance.now() + delay;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(Math.max(now - start, 0) / 1600, 1);
      const node = textRef.current?.firstChild;
      if (t < 1) {
        if (node) node.nodeValue = format(value * easeOutCubic(t));
        frame = requestAnimationFrame(tick);
      } else setShown(value);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, delay]);

  return (
    <span ref={ref} className={className}>
      {/* The final text equals `text` exactly: screen readers get that, not the count */}
      <span ref={textRef} aria-hidden="true">
        {format(shown)}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
