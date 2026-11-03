import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, PointerEvent, ReactNode } from "react";
import CountUp from "./CountUp";
import FiberField from "./FiberField";
import FoundedOrbit from "./FoundedOrbit";
import useInViewOnce from "./useInViewOnce";
import StatVideoBackdrop from "./StatVideoBackdrop";
import { GROUP_STATS } from "../data/facts";
import { ABOUT_STATS_DEFAULT_VIDEO, VIDEOS, type VideoId } from "../data/videos";

const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";
// The hero's denim twill, in ink: 4% for the section, 6% on a hovered tile
const TWILL =
  "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--ink)_4%,transparent)_0_1px,transparent_1px_6px)]";
const TWILL_TILE =
  "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--ink)_6%,transparent)_0_1px,transparent_1px_6px)]";

/* Each line rises from its own clip mask (the hero's heroLine), 90ms apart,
   once the statement's wrapper is set to data-play="on". */
const LINE =
  "block group-data-[play=off]/stmt:translate-y-full group-data-[play=off]/stmt:[clip-path:inset(-0.2em_-0.2em_100%_-0.2em)] group-data-[play=on]/stmt:animate-[heroLine_0.6s_var(--ease-out)_calc(150ms_+_var(--line)_*_90ms)_backwards] motion-reduce:animate-none!";

/* "vertically integrated": a soft navy wash under the lower half, and a navy
   dashed stitch that sews in from the left once the lines have landed. */
function KeyPhrase({ children }: { children: ReactNode }) {
  return (
    <span className="relative whitespace-nowrap bg-[linear-gradient(transparent_55%,color-mix(in_srgb,var(--navy)_8%,transparent)_55%)]">
      {children}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-1 h-1 w-full overflow-visible">
        <defs>
          <mask id="company-phrase-stitch" maskUnits="userSpaceOnUse" x="-4" y="-6" width="120%" height="16">
            <line
              x1="0"
              y1="2"
              x2="100%"
              y2="2"
              pathLength={1}
              stroke="white"
              strokeWidth="6"
              className="[stroke-dasharray:1] [stroke-dashoffset:0] transition-[stroke-dashoffset] delay-700 duration-700 ease-in-out group-data-[play=off]/stmt:[stroke-dashoffset:1] motion-reduce:transition-none"
            />
          </mask>
        </defs>
        <line
          x1="0"
          y1="2"
          x2="100%"
          y2="2"
          stroke="var(--navy)"
          strokeWidth="2"
          strokeDasharray="7 4"
          mask="url(#company-phrase-stitch)"
        />
      </svg>
    </span>
  );
}

/* The statement in four set lines, so each can rise on its own. They stay
   inside one paragraph, with spaces between, so it reads as one sentence. */
const LINES: ReactNode[] = [
  <>
    <span className="text-(--navy)">Ha-Meem Group</span> is one of
  </>,
  <>Bangladesh&apos;s largest</>,
  <KeyPhrase>vertically integrated</KeyPhrase>,
  <>apparel manufacturers.</>,
];

function Statement() {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.4);
  return (
    <div ref={ref} data-play={inView ? "on" : "off"} className="group/stmt">
      {/* The label's rule draws first, then the label */}
      <p className="mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-(--ink)">
        <span
          aria-hidden="true"
          className={`h-0.5 w-6 origin-left bg-(--navy) transition-transform duration-500 ${EASE} group-data-[play=off]/stmt:scale-x-0 motion-reduce:transition-none`}
        />
        <span className="transition-opacity delay-100 duration-500 group-data-[play=off]/stmt:opacity-0 motion-reduce:transition-none">
          ABOUT THE GROUP
        </span>
      </p>
      <p className="max-w-[60ch] font-['Fira_Sans_Condensed'] text-lead font-bold leading-tight text-(--ink) lg:max-w-[34ch]">
        {LINES.map((line, i) => (
          <Fragment key={i}>
            <span className={LINE} style={{ "--line": i } as CSSProperties}>
              {line}
            </span>{" "}
          </Fragment>
        ))}
        <span className="mt-5 block max-w-[48ch] text-pretty text-[max(18px,0.6em)] font-semibold leading-snug text-(--mute) transition-opacity delay-[800ms] duration-500 group-data-[play=off]/stmt:opacity-0 motion-reduce:transition-none">
          From our own yarn and denim to sewing, washing, trims and shipping, we make bottoms, tops, denim and
          sweaters for the world&apos;s leading retailers.
        </span>
      </p>
    </div>
  );
}

/* A loose thread from under the founded badge to the stats grid's top-left
   corner, ending in a needle's eye. Measured from the layout (offsets, so the
   reveal transforms don't skew it) and drawn by the section's scroll where
   the browser supports scroll-driven animation; elsewhere it is simply drawn.
   lg and up only. */
function CompanyThread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<{ d: string; ex: number; ey: number; angle: number } | null>(null);

  useLayoutEffect(() => {
    const box = svgRef.current?.parentElement;
    if (!box) return;
    const measure = () => {
      const from = box.querySelector<HTMLElement>("[data-thread-from]");
      const to = box.querySelector<HTMLElement>("[data-thread-to]");
      if (!from || !to || !from.offsetWidth) return setGeo(null);
      // Start under the ring, clear of the chips that ride it (they hang 20px out)
      const fx = from.offsetLeft + from.offsetWidth / 2;
      const fy = from.offsetTop + from.offsetHeight + 26;
      const tx = to.offsetLeft + 28;
      const ty = to.offsetTop + to.offsetHeight - 14;
      const dy = Math.max(ty - fy, 24);
      const c2x = tx + 70;
      const c2y = ty - dy * 0.15;
      setGeo({
        d: `M ${fx} ${fy} C ${fx + 36} ${fy + dy * 0.7}, ${c2x} ${c2y}, ${tx} ${ty}`,
        ex: tx,
        ey: ty,
        angle: (Math.atan2(ty - c2y, tx - c2x) * 180) / Math.PI,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
    >
      {geo && (
        <>
          <defs>
            <mask id="company-thread" maskUnits="userSpaceOnUse" x="-10%" y="-10%" width="120%" height="120%">
              <path
                d={geo.d}
                pathLength={1}
                fill="none"
                stroke="white"
                strokeWidth="16"
                strokeLinecap="round"
                className="company-thread-draw [stroke-dasharray:1] [stroke-dashoffset:0]"
              />
            </mask>
          </defs>
          <g mask="url(#company-thread)" className="stroke-(--ink)/30" fill="none" strokeWidth="1.5">
            <path d={geo.d} strokeDasharray="6 5" />
            <ellipse cx={geo.ex} cy={geo.ey} rx="6" ry="2.5" transform={`rotate(${geo.angle} ${geo.ex} ${geo.ey})`} />
          </g>
        </>
      )}
    </svg>
  );
}

/* Frosted mosaic cells over the band's film, in fixed patterns (col, row on a
   12 × 6 grid of squares); each film change moves them to the next pattern. */
const MOSAIC: [number, number][][] = [
  [[0, 0], [3, 1], [11, 0], [7, 2], [1, 4], [10, 3], [5, 5], [8, 5], [2, 2], [11, 5]],
  [[1, 0], [6, 0], [10, 1], [0, 3], [4, 3], [9, 4], [2, 5], [11, 3], [7, 5], [5, 2]],
  [[2, 1], [8, 0], [0, 5], [11, 2], [5, 4], [3, 0], [9, 2], [6, 5], [1, 2], [10, 5]],
];
const VIDEO_ORDER = Object.keys(VIDEOS) as VideoId[];
const CYCLE_MS = 8000;
const NOW_SHOWING = "about-now-showing";

/* ── The group at a glance: a full-bleed film band ──
   The six figures sit on glass tiles over a denim film. Pointing at a tile
   (after a 120ms intent), focusing or tapping it plays that figure's film;
   leaving the grid returns to the default film after 600ms. Left alone, the
   band walks through the figures every 8s (not while pointed at or focused,
   off screen, or with reduced motion). */
function StatsBand() {
  const [ref, inView] = useInViewOnce<HTMLUListElement>(0.2);
  const bandRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [auto, setAuto] = useState(false); // the last change came from the walk
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [live, setLive] = useState(false);
  const intent = useRef<number | undefined>(undefined);
  const leave = useRef<number | undefined>(undefined);

  const video: VideoId = (active !== null && GROUP_STATS[active].video) || ABOUT_STATS_DEFAULT_VIDEO;
  const pattern = MOSAIC[VIDEO_ORDER.indexOf(video) % MOSAIC.length];

  const choose = (i: number | null) => {
    setAuto(false);
    setActive(i);
  };

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    let onScreen = false;
    const update = () => setLive(onScreen && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    io.observe(band);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.clearTimeout(intent.current);
      window.clearTimeout(leave.current);
    };
  }, []);

  // The idle walk through the figures
  useEffect(() => {
    if (hovering || focused || !live || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      setAuto(true);
      setActive((i) => (i === null ? 0 : (i + 1) % GROUP_STATS.length));
    }, CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [active, hovering, focused, live]);

  const onCardEnter = (i: number) => (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => choose(i), 120);
  };
  const onGridEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(leave.current);
    setHovering(true);
  };
  const backToDefault = () => {
    window.clearTimeout(leave.current);
    leave.current = window.setTimeout(() => choose(null), 600);
  };
  const onGridLeave = (e: PointerEvent) => {
    // A finger lifting is not leaving: a tapped tile keeps its film
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(intent.current);
    setHovering(false);
    if (!focused) backToDefault();
  };
  const onGridBlur = (e: FocusEvent<HTMLUListElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setFocused(false);
    if (!hovering) backToDefault();
  };

  return (
    <div ref={bandRef} data-reveal className="@container relative isolate overflow-hidden bg-(--ink)">
      <StatVideoBackdrop activeId={video} />
      {/* Shade for legibility: ink, a deeper foot, and the hero's navy wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-(--ink)/45" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-(--ink)/80 to-transparent"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-(--navy)/12 mix-blend-multiply" />
      {/* The hero's fine twill over the film */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_5px)]"
      />
      {/* A tile mosaic: faint square lines and ten frosted cells, lg only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden auto-rows-[calc(100cqw/12)] grid-cols-12 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-size-[calc(100cqw/12)_calc(100cqw/12)] lg:motion-safe:grid"
      >
        {pattern.map(([col, row], n) => (
          <span
            key={`${video}-${n}`}
            className="bg-white/[0.04] backdrop-blur-sm animate-[awardIn_500ms_ease-out_both] [--award-from:scale(1)]"
            style={{ gridColumnStart: col + 1, gridRowStart: row + 1, animationDelay: `${n * 50}ms` }}
          />
        ))}
      </div>
      {/* Selvedge stitches inside the top and bottom edges */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-3 border-t border-dashed border-white/30" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-3 border-t border-dashed border-white/30" />

      <div className="wrap relative py-16 lg:py-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="m-0 text-[11px] tracking-[0.2em] text-white/80">THE GROUP AT A GLANCE</p>
          <p id={NOW_SHOWING} aria-live={auto ? "off" : "polite"} className="m-0 flex items-center gap-2 text-xs text-white/60">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-white animate-pulse motion-reduce:animate-none" />
            <span key={video} className="animate-[awardIn_400ms_ease-out_both] [--award-from:scale(1)] motion-reduce:animate-none">
              Now showing · {VIDEOS[video].label}
            </span>
          </p>
        </div>

        <ul
          ref={ref}
          data-reveal-stagger
          onPointerEnter={onGridEnter}
          onPointerLeave={onGridLeave}
          onFocus={(e) => {
            // Keyboard focus holds a tile; a click's focus does not
            if (!(e.target as HTMLElement).matches(":focus-visible")) return;
            window.clearTimeout(leave.current);
            setFocused(true);
          }}
          onBlur={onGridBlur}
          className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-3 lg:gap-4"
        >
          {GROUP_STATS.map((s, i) => {
            const state = active === i ? "active" : active !== null ? "dim" : "rest";
            return (
              <li key={s.label} className="flex">
                <button
                  type="button"
                  data-state={state}
                  aria-pressed={active === i}
                  aria-describedby={NOW_SHOWING}
                  onClick={() => choose(i)}
                  onFocus={(e) => e.currentTarget.matches(":focus-visible") && choose(i)}
                  onPointerEnter={onCardEnter(i)}
                  onPointerLeave={() => window.clearTimeout(intent.current)}
                  className={`group relative flex w-full flex-col rounded-sm border border-white/40 px-4 py-6 text-left backdrop-blur-md transition-transform duration-500 ${EASE} data-[state=active]:-translate-y-1 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none sm:px-6 md:px-8 md:py-10`}
                >
                  {/* The glass: solid white when chosen, thinner when another is (75%, so
                      the small grey text stays readable over the film) */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 rounded-sm bg-white opacity-86 transition-opacity duration-500 ${EASE} group-data-[state=active]:opacity-100 group-data-[state=dim]:opacity-75 motion-reduce:transition-none`}
                  />
                  {/* Denim twill, woven in on hover */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 rounded-sm ${TWILL_TILE} opacity-0 transition-opacity duration-400 group-hover:opacity-100 motion-reduce:transition-none`}
                  />
                  {/* A thread along the top, drawn in as the grid arrives */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-4 top-0 border-t border-dashed border-(--ink)/30 transition-[clip-path] duration-600 ${EASE} motion-reduce:transition-none sm:inset-x-6 md:inset-x-8 ${
                      inView ? "[clip-path:inset(0)]" : "[clip-path:inset(0_100%_0_0)]"
                    }`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  />
                  {/* Stitched seam, sewn round the tile on hover; always shown on touch screens */}
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] overflow-visible"
                  >
                    <defs>
                      <mask id={`company-stitch-${i}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          pathLength={1}
                          fill="none"
                          stroke="white"
                          strokeWidth="6"
                          className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-900 motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0] [@media(hover:none)]:transition-none"
                        />
                      </mask>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill="none"
                      strokeOpacity="0.4"
                      strokeWidth="1.5"
                      strokeDasharray="8 6"
                      className="stroke-(--ink)"
                      mask={`url(#company-stitch-${i})`}
                    />
                  </svg>

                  <span className="relative flex flex-col transition-opacity duration-500 group-data-[state=dim]:opacity-90 motion-reduce:transition-none">
                    {/* Figure, with a tag-style index in the corner */}
                    <span className="flex items-start justify-between gap-3">
                      <b className="font-['Fira_Sans_Condensed'] text-[38px] font-black leading-none tabular-nums text-(--ink) sm:text-[46px] md:text-[56px]">
                        <CountUp text={s.value} delay={i * 80} />
                      </b>
                      <span className="pt-1 text-[11px] font-semibold tabular-nums tracking-widest text-(--mute) transition-colors duration-300 group-data-[state=active]:text-(--navy) motion-reduce:transition-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    {/* Navy rule, stretching on the chosen tile */}
                    <span
                      aria-hidden="true"
                      className={`mt-5 h-0.5 w-12 origin-left scale-x-50 bg-(--navy) transition-transform duration-500 ${EASE} group-data-[state=active]:scale-x-100 motion-reduce:transition-none`}
                    />
                    <span className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-(--mute) sm:text-[11px]">
                      {s.label}
                    </span>
                    {s.sub && <span className="mt-2 text-[13px] leading-snug text-(--mute) sm:text-sm">{s.sub}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ── FOUNDED IN 1984 ──
   A cut of denim: twill at the edges (clean behind the text), a navy selvedge
   along the top, cotton fibres drifting up through it. The founded badge
   beside the statement, a thread from the badge down to the group's figures,
   which close the section on a full-bleed film band. */
export default function CompanySection() {
  return (
    <section id="company" className="relative isolate bg-(--mist) pt-section [view-timeline-name:--company]">
      <FiberField />
      {/* Denim twill, faded out toward the centre so the text sits on clean cloth */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${TWILL} mask-[radial-gradient(ellipse_at_center,transparent_30%,black_85%)]`}
      />
      {/* Selvedge: the navy edge of a roll of denim, with a stitch just inside it */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0">
        <div className="h-1 bg-(--navy)" />
        <div className="mt-2 border-t border-dashed border-(--ink)/25" />
      </div>

      <div className="wrap relative">
        <CompanyThread />
        {/* Founded badge beside the statement; stacked, badge centred, below lg */}
        <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:items-center lg:gap-16">
          <div data-reveal data-thread-from className="flex justify-center">
            <FoundedOrbit />
          </div>
          <Statement />
        </div>
        {/* The gap down to the band; the thread ends at its foot */}
        <div data-thread-to aria-hidden="true" className="h-section-head" />
      </div>
      <StatsBand />
    </section>
  );
}
