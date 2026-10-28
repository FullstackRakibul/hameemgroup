import { Children } from "react";
import type { CSSProperties, ReactNode } from "react";
import useInViewOnce from "./useInViewOnce";

// A small rolled-paper end; the right one is the same drawing, mirrored
function Curl({ side }: { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="30"
      viewBox="0 0 18 30"
      className={`ribbon-curl ribbon-curl-${side} shrink-0 overflow-visible`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform={side === "right" ? "matrix(-1 0 0 1 18 0)" : undefined}>
      {/* Rolled edge, top to bottom, slightly uneven like paper */}
      <path d="M15 3 C 11 3.5, 9.5 8, 10 15 C 10.5 21, 12 25.5, 16 27" fill="currentColor" fillOpacity="0.06" />
      {/* The spiral of the roll */}
      <path d="M14 4 C 4 4, 2 14, 8 16 C 12 18, 14 12, 10 11" />
      <path d="M16 27 C 13 27.5, 11.5 25, 13 23.5" strokeOpacity="0.7" />
      </g>
    </svg>
  );
}

/** Text of the children when they are plain strings or numbers, else null */
function textOf(children: ReactNode): string | null {
  let out = "";
  for (const c of Children.toArray(children)) {
    if (typeof c === "string" || typeof c === "number") out += c;
    else return null;
  }
  return out;
}

/** Section pre-title. By default a parchment ribbon that unrolls and types its
    letters in the first time it scrolls into view; `plain` is the bare line of
    text, for small notes. Colour comes from currentColor. */
export default function Eyebrow({
  children,
  className = "",
  plain = false,
}: {
  children: ReactNode;
  className?: string;
  plain?: boolean;
}) {
  const [ref, inView] = useInViewOnce<HTMLParagraphElement>();
  const text = textOf(children);

  if (plain)
    return (
      <p className={`text-(--navy) text-xs font-semibold tracking-[0.12em] leading-[1.2] uppercase ${className}`}>
        {children}
      </p>
    );

  return (
    <p
      ref={ref}
      data-play={inView || undefined}
      aria-label={text ?? undefined}
      className={`eyebrow-ribbon relative inline-flex w-fit max-w-full items-center text-(--navy) ${className}`}
    >
      <Curl side="left" />
      <span className="ribbon-body relative -mx-px inline-flex items-center px-3 py-1.5">
        <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d="M0 4 C 25 1, 50 7, 75 3 S 100 4, 100 4 L100 26 C 75 29, 50 23, 25 27 S 0 26, 0 26 Z"
            fill="currentColor"
            fillOpacity="0.06"
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {text !== null ? (
          <span aria-hidden="true" className="relative text-xs font-semibold uppercase leading-[1.2] tracking-[0.12em]">
            {[...text].map((ch, i) => (
              <span key={i} className="ribbon-letter inline-block" style={{ "--i": i } as CSSProperties}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
        ) : (
          // Mixed content (e.g. <sup>): shown as is, fading in as one block
          <span className="ribbon-letter relative text-xs font-semibold uppercase leading-[1.2] tracking-[0.12em]">
            {children}
          </span>
        )}
      </span>
      <Curl side="right" />
      <svg aria-hidden="true" className="ribbon-stitch absolute -bottom-1.5 left-5 right-5 h-0.5 w-[calc(100%-40px)]">
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      </svg>
    </p>
  );
}
