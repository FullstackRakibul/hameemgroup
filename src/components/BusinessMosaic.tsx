import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import CountUp from "./CountUp";
import useInViewOnce from "./useInViewOnce";
import { BUSINESSES, type Business, type MosaicSlot } from "../data/businesses";
import { F } from "../data/facts";

const media = "/media/";
const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";

/* Grid areas from md: each tile takes its slot by name, so the mosaic has no
   holes whatever the content. Below md the tiles simply stack. */
const AREA: Record<MosaicSlot | "g", string> = {
  a: "md:[grid-area:a]",
  b: "md:[grid-area:b]",
  c: "md:[grid-area:c]",
  d: "md:[grid-area:d]",
  e: "md:[grid-area:e]",
  f: "md:[grid-area:f]",
  g: "md:[grid-area:g]",
  h: "md:[grid-area:h]",
  i: "md:[grid-area:i]",
  j: "md:[grid-area:j]",
};
// The three big tiles get bigger type
const LARGE: MosaicSlot[] = ["a", "b", "e"];

/* Each tile rises 16px and settles from 0.98 once the grid is in view, 60ms
   apart in reading order */
const REVEAL =
  "group-data-[play=off]/mosaic:opacity-0 group-data-[play=on]/mosaic:animate-[tileIn_600ms_var(--ease-out)_both] motion-reduce:animate-none!";

function Tile({ b, order }: { b: Business; order: number }) {
  const large = LARGE.includes(b.tile);
  return (
    <Link
      to={b.to}
      style={{ animationDelay: `${order * 60}ms` }}
      className={`group relative isolate block h-55 overflow-hidden rounded-sm bg-(--ink) text-white [view-timeline-name:--tile] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) md:h-auto ${
        b.tile === "a" ? "h-80" : ""
      } ${b.tile > "d" ? "max-md:order-2" : ""} ${AREA[b.tile]} ${REVEAL}`}
    >
      {/* The photo: 12px taller than the tile at each end, so the scroll
          drift (.mosaic-parallax, lg) never shows an edge; zooms on hover */}
      <img
        src={`${media}${b.image}`}
        alt=""
        loading="lazy"
        decoding="async"
        className={`mosaic-parallax absolute inset-x-0 -top-3 h-[calc(100%+24px)] w-full scale-104 object-cover transition-[scale] duration-700 ${EASE} group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:scale-100! motion-reduce:transition-none`}
      />
      {/* A light shade at the foot only, so the photo stays bright */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/45"
      />

      {/* Stitched seam, sewn round the tile on hover or focus; always shown on touch screens */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 h-[calc(100%-20px)] w-[calc(100%-20px)] overflow-visible"
      >
        <defs>
          <mask id={`biz-stitch-${b.tile}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx="3"
              ry="3"
              pathLength={1}
              fill="none"
              stroke="white"
              strokeWidth="6"
              className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-900 group-focus-visible:[stroke-dashoffset:0] motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0]"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="3"
          ry="3"
          fill="none"
          stroke="white"
          strokeOpacity="0.85"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          mask={`url(#biz-stitch-${b.tile})`}
        />
      </svg>

      {/* Open cue: the whole tile is the link. Shown on hover or focus, and
          always on touch screens. */}
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 z-1 grid size-11 place-items-center rounded-full bg-white text-(--ink) opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
      >
        <ArrowUpRight
          size={18}
          strokeWidth={1.75}
          className="transition-transform duration-300 group-hover:rotate-45 group-focus-visible:rotate-45 motion-reduce:transition-none"
        />
      </span>

      {/* Frosted caption bar: title and unit on the left, the figure on the
          right; on hover it grows upward to show the description */}
      <span className="absolute inset-x-3 bottom-3 z-1 rounded-xs border border-white/25 bg-white/14 px-4 py-3 backdrop-blur-md">
        <span className="flex items-end justify-between gap-4">
          <span className="min-w-0">
            <strong
              className={`block font-['Fira_Sans_Condensed'] font-semibold leading-tight ${
                large ? "text-2xl lg:text-[28px]" : "text-lg lg:text-xl"
              }`}
            >
              {b.title}
            </strong>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-white/75">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-(--navy) ring-1 ring-white/70" />
              {b.unit}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end">
            <b
              className={`font-['Fira_Sans_Condensed'] font-semibold leading-none tabular-nums ${
                large ? "text-[32px]" : "text-2xl"
              }`}
            >
              <CountUp text={b.stat} />
            </b>
            <span aria-hidden="true" className="mt-1.5 h-px w-full bg-white/40" />
            <span className="mt-1 text-[11px] text-white/70">/ {b.unitShort}</span>
          </span>
        </span>
        <span
          className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ${EASE} group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none [@media(hover:none)]:grid-rows-[0fr]!`}
        >
          <span className="min-h-0 overflow-hidden">
            <span className="line-clamp-2 pt-2 text-sm leading-snug text-white/85">{b.text}</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

/* The one solid colour block in the section */
function CtaTile({ order }: { order: number }) {
  return (
    <div
      style={{ animationDelay: `${order * 60}ms` }}
      className={`relative isolate flex min-h-55 flex-col justify-between gap-6 overflow-hidden rounded-sm bg-(--navy) p-6 text-white max-md:order-1 md:min-h-0 md:flex-row md:items-end lg:p-8 ${AREA.g} ${REVEAL}`}
    >
      {/* Twill, as on the hero */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_1px,transparent_1px_6px)]"
      />
      <div className="relative">
        <p className="m-0 font-['Fira_Sans_Condensed'] text-[56px] font-semibold leading-none tabular-nums">
          <CountUp text={F.factories} />
        </p>
        <p className="m-0 mt-2 max-w-[22ch] text-sm text-white/80">Garment factories across Bangladesh</p>
      </div>
      <Link
        to="/about"
        className="group/cta relative inline-flex min-h-11 shrink-0 items-center gap-2 self-start overflow-hidden rounded-xs bg-white px-5 text-xs font-semibold uppercase tracking-widest text-(--ink) transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none md:self-auto"
      >
        {/* The fill sweeps in from the left instead of switching colour */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 origin-left scale-x-0 bg-(--ink) transition-transform duration-400 ${EASE} group-hover/cta:scale-x-100 group-focus-visible/cta:scale-x-100 motion-reduce:transition-none`}
        />
        <span className="relative">Explore the group</span>
        <ArrowRight
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="relative transition-transform duration-300 group-hover/cta:translate-x-1 motion-reduce:transition-none"
        />
      </Link>
    </div>
  );
}

/* ── What we do: a mixed-size mosaic ──
   Tall, wide and small photo tiles, each with a frosted caption bar, and one
   solid call-to-action tile (slot g). In the DOM the tiles run in the lg
   reading order (a…f, g, h…j); below md the CTA moves up after the fourth
   business with `order`. */
export default function BusinessMosaic({ className = "" }: { className?: string }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.15);
  const before = BUSINESSES.filter((b) => b.tile <= "f");
  const after = BUSINESSES.filter((b) => b.tile > "f");
  return (
    <div
      ref={ref}
      data-play={inView ? "on" : "off"}
      className={`group/mosaic grid grid-cols-1 gap-3 md:grid-cols-6 md:grid-rows-[repeat(6,200px)] md:[grid-template-areas:'a_a_a_a_b_b'_'a_a_a_a_b_b'_'c_c_c_d_d_d'_'e_e_f_f_f_f'_'e_e_g_g_g_g'_'h_h_i_i_j_j'] lg:grid-cols-12 lg:grid-rows-[repeat(4,220px)] lg:[grid-template-areas:'a_a_a_a_a_b_b_b_c_c_c_c'_'a_a_a_a_a_b_b_b_d_d_d_d'_'e_e_e_f_f_f_f_f_g_g_g_g'_'e_e_e_h_h_h_i_i_i_j_j_j'] ${className}`}
    >
      {before.map((b, i) => (
        <Tile key={b.tile} b={b} order={i} />
      ))}
      <CtaTile order={before.length} />
      {after.map((b, i) => (
        <Tile key={b.tile} b={b} order={before.length + 1 + i} />
      ))}
    </div>
  );
}
