import { useId, useLayoutEffect, useRef } from "react";
import { buyers } from "../data/buyers";

const WAVE_STEP_MS = 40;

/* Buyer logo grid, in full colour. One component for the homepage and
   /customers; pass ids to show a subset.
   Entrance: once the grid is about 15% into view the logos arrive in a
   diagonal wave from the top left, (row + column) × 40ms apart.
   Hover (mouse only): the logo lifts and a red stitch is sewn round the cell;
   its neighbours in the same row lift half as far, a beat later. */
export default function BuyerGrid({ ids, className = "" }: { ids?: string[]; className?: string }) {
  const list = ids ? buyers.filter((b) => ids.includes(b.id)) : buyers;
  const cols = list.length <= 5 ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-6";
  const ref = useRef<HTMLUListElement>(null);
  const uid = useId();

  // Row and column of each cell from the current column count, which differs
  // between phones and desktop: the wave delay, and the row ends where the
  // hover ripple stops.
  useLayoutEffect(() => {
    const ul = ref.current;
    if (!ul) return;
    const layout = () => {
      const n = Math.max(1, getComputedStyle(ul).gridTemplateColumns.split(" ").length);
      [...ul.children].forEach((li, i) => {
        const row = Math.floor(i / n);
        const col = i % n;
        (li as HTMLElement).style.setProperty("--wave-delay", `${(row + col) * WAVE_STEP_MS}ms`);
        li.toggleAttribute("data-row-end", col === n - 1);
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [list.length]);

  // The wave plays once; a grid already in view, or reduced motion, gets none.
  useLayoutEffect(() => {
    const ul = ref.current;
    if (!ul || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ul.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    ul.dataset.wave = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        ul.dataset.wave = "play";
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(ul);
    return () => {
      io.disconnect();
      if (ul.dataset.wave === "pending") delete ul.dataset.wave;
    };
  }, []);

  return (
    <ul
      ref={ref}
      className={`buyer-grid mx-auto grid max-w-400 gap-px border border-[#e4e4e0] bg-[#e4e4e0] ${cols} ${className}`}
    >
      {list.map((b) => (
        <li key={b.id} className="buyer-cell relative grid h-20 place-items-center bg-white px-4 sm:h-24 sm:px-6">
          {/* Stitched seam, 6px in, sewn round the hovered cell */}
          <svg
            aria-hidden="true"
            className="buyer-stitch pointer-events-none absolute inset-1.5 h-[calc(100%-12px)] w-[calc(100%-12px)] overflow-visible"
          >
            <defs>
              <mask id={`${uid}-${b.id}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
                <rect
                  className="buyer-stitch-mask"
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  pathLength={1}
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="none"
              stroke="var(--red)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              mask={`url(#${uid}-${b.id})`}
            />
          </svg>
          <span className="buyer-wave">
            <img
              src={`/media/buyers/${b.id}.png`}
              alt={b.name}
              loading="lazy"
              className="buyer-logo w-auto max-w-full object-contain max-h-9 sm:max-h-11 sm:max-w-[min(100%,7.5rem)]"
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
