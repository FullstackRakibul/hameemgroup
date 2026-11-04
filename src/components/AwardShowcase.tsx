import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { Award as AwardIcon, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import CountUp from "./CountUp";
import useInViewOnce from "./useInViewOnce";
import { AWARD_TIMELINE, CERTIFICATIONS, F } from "../data/facts";
import type { TimelineAward } from "../data/facts";

const media = "/media/";
const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";
const AUTOPLAY_MS = 6000;
const N = AWARD_TIMELINE.length;
const START = Math.max(0, AWARD_TIMELINE.findIndex((a) => a.years === "2017"));
const NATIONAL = AWARD_TIMELINE.filter((a) => a.logo === "flags/bd.svg").length;

const firstYear = (a: TimelineAward) => parseInt(a.years, 10);
/** "2018 – 2019" → " – 2019"; "2017" → "" */
const yearRest = (a: TimelineAward) => a.years.slice(String(firstYear(a)).length);
const pad = (n: number) => String(n).padStart(2, "0");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// The rail runs from the first award's year to the last one's
const YEARS = AWARD_TIMELINE.map(firstYear);
const MIN_YEAR = Math.min(...YEARS);
const MAX_YEAR = Math.max(...YEARS);
const railPct = (year: number) => ((year - MIN_YEAR) / Math.max(1, MAX_YEAR - MIN_YEAR)) * 100;
// Awards sharing a year stack upward: 0 for the first, 1 for the next…
const STACK = AWARD_TIMELINE.map((a, i) => YEARS.slice(0, i).filter((y) => y === firstYear(a)).length);

/** Tweens a whole number toward `target` with easeOutCubic once `run` is true:
    1.2s the first time (from 0), 450ms on every later change, continuing from
    wherever it is. With reduced motion it jumps. */
function useTween(target: number, run: boolean) {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    if (!run) return;
    if (reducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    const ms = from === 0 ? 1200 : 450;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / ms, 1);
      current.current = Math.round(from + (target - from) * easeOutCubic(t));
      setValue(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run]);
  return value;
}

/* ── The trophy stage ──
   One award at a time on a lit turntable. Photos stand on a stitched floor
   ring with a reflection; awards without a photo show a turning medal. The
   pointer tilts the piece (one rAF lerp, stopping when settled); with no
   pointer, photos sway slowly in CSS. Changes turn the old piece away and the
   new one in, from the side the visitor is moving toward. */

type StageItem = { key: number; index: number; dir: number; leaving: boolean; first: boolean };

function Medal({ award }: { award: TimelineAward }) {
  return (
    <div className="relative size-55 animate-[medalTurn_10s_linear_infinite] [transform-style:preserve-3d] group-hover/stage:[animation-play-state:paused] motion-reduce:animate-none">
      {/* The edge: stacked discs give the coin its 12px thickness */}
      {Array.from({ length: 11 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--ink)_16%,white)]"
          style={{ transform: `translateZ(${i - 5}px)` }}
        />
      ))}
      {/* Front */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full border-8 border-(--hair) bg-white [backface-visibility:hidden] [transform:translateZ(6px)]">
        <AwardIcon size={44} strokeWidth={1.5} aria-hidden="true" className="text-(--navy)" />
        {award.logo && (
          <img src={`${media}${award.logo}`} alt="" className="max-h-6 max-w-24 object-contain grayscale" />
        )}
        <span className="font-['Fira_Sans_Condensed'] text-xl font-semibold leading-none text-(--heading)">
          {award.years}
        </span>
      </div>
      {/* Back */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-full border-8 border-(--hair) bg-white px-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(6px)]">
        {award.by && <span className="text-[10px] uppercase tracking-widest text-(--mute)">{award.by.split(" · ")[0]}</span>}
        <span className="font-['Fira_Sans_Condensed'] text-base font-semibold leading-tight text-(--heading)">
          {award.title}
        </span>
      </div>
    </div>
  );
}

function Trophy({ award }: { award: TimelineAward }) {
  const src = `${media}${award.image}`;
  return (
    <div className="relative">
      <img
        src={src}
        loading="lazy"
        alt={`${award.title}, ${award.years}`}
        decoding="async"
        draggable={false}
        className="block h-auto max-h-[calc(var(--stage-h)*0.72)] w-auto max-w-[70vw] object-contain mix-blend-multiply select-none lg:max-w-[min(32vw,440px)]"
      />
      {/* Reflection on the floor */}
      <img
        src={src}
        loading="lazy"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute left-0 top-full size-full -scale-y-100 object-contain opacity-15 blur-[1px] mix-blend-multiply mask-[linear-gradient(to_top,black,transparent_35%)] select-none"
      />
      {/* A light sweep crosses the piece once on hover, cut to its shape */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ maskImage: `url(${src})`, maskSize: "100% 100%" }}
      >
        <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-[linear-gradient(105deg,transparent,rgb(255_255_255/0.55),transparent)] transition-none group-hover/stage:translate-x-[420%] group-hover/stage:transition-transform group-hover/stage:duration-900 group-hover/stage:ease-out motion-reduce:hidden" />
      </span>
    </div>
  );
}

function Stage({
  active,
  dir,
  year,
  onSwipe,
  className,
}: {
  active: number;
  dir: number;
  year: number;
  onSwipe: (d: number) => void;
  className: string;
}) {
  const keyRef = useRef(0);
  const [items, setItems] = useState<StageItem[]>([{ key: 0, index: active, dir, leaving: false, first: true }]);

  // A change turns the current piece away and brings the new one in
  useEffect(() => {
    setItems((list) => {
      const current = list.find((it) => !it.leaving);
      if (current?.index === active) return list;
      keyRef.current += 1;
      return [
        ...(current ? [{ ...current, dir, leaving: true }] : []),
        { key: keyRef.current, index: active, dir, leaving: false, first: false },
      ];
    });
  }, [active, dir]);

  // Preload the neighbours' photos, so a change never waits on the network
  useEffect(() => {
    for (const i of [(active + 1) % N, (active - 1 + N) % N]) {
      const img = AWARD_TIMELINE[i].image;
      if (img) new Image().src = `${media}${img}`;
    }
  }, [active]);

  /* Tilt: the active piece faces the pointer, ±14° across and ±8° up and
     down, and the watermark slides 10px the other way. */
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0, frame: 0 });
  const paint = useCallback(() => {
    const t = tilt.current;
    if (tiltRef.current) tiltRef.current.style.transform = `rotateX(${t.x}deg) rotateY(${t.y}deg)`;
    if (markRef.current)
      markRef.current.style.transform = `translate3d(${(-t.y / 14) * 10}px, ${(t.x / 8) * 10}px, 0)`;
  }, []);
  const tick = useCallback(() => {
    const t = tilt.current;
    t.x += (t.tx - t.x) * 0.12;
    t.y += (t.ty - t.y) * 0.12;
    if (Math.abs(t.tx - t.x) < 0.01 && Math.abs(t.ty - t.y) < 0.01) {
      t.x = t.tx;
      t.y = t.ty;
      t.frame = 0;
    } else t.frame = requestAnimationFrame(tick);
    paint();
  }, [paint]);
  const aim = (x: number, y: number) => {
    const t = tilt.current;
    t.tx = x;
    t.ty = y;
    if (!t.frame) t.frame = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(tilt.current.frame), []);
  const setTiltEl = useCallback(
    (el: HTMLDivElement | null) => {
      tiltRef.current = el;
      paint();
    },
    [paint],
  );

  const swipe = useRef<number | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    swipe.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) onSwipe(dx < 0 ? 1 : -1);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || reducedMotion() || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    aim(-ny * 8, nx * 14);
  };
  const onPointerLeave = () => {
    swipe.current = null;
    aim(0, 0);
  };

  return (
    <div
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`group/stage relative h-(--stage-h) touch-pan-y overflow-hidden rounded-sm border border-(--hair) bg-(--mist) [--stage-h:380px] [perspective:1200px] select-none lg:h-auto lg:min-h-(--stage-h) lg:[--stage-h:min(68svh,620px)] ${className}`}
    >
      {/* Spotlight from above */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,white,transparent_60%)]"
      />
      {/* The year, huge and faint, behind the piece */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
        <span
          ref={markRef}
          className="font-['Fira_Sans_Condensed'] text-[160px] font-black leading-none tabular-nums text-(--ink)/[0.04] will-change-transform lg:text-[220px]"
        >
          {year}
        </span>
      </span>
      {/* The floor: a soft shadow and a stitched ring turning under the piece */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[12%] left-1/2 h-12 w-[64%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(0_0_0/0.18),transparent)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[calc(14%-110px)] left-1/2 size-[260px] -translate-x-1/2 [transform:rotateX(76deg)] lg:size-[340px] lg:bottom-[calc(14%-150px)]"
      >
        <svg viewBox="0 0 100 100" className="orbit-spin size-full overflow-visible motion-reduce:animate-none">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="var(--hair)"
            strokeWidth="1.4"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="5 4" />
        </svg>
      </span>

      {/* The piece(s): the leaving one turns away while the new one turns in */}
      {items.map((it) => {
        const award = AWARD_TIMELINE[it.index];
        return (
          <div
            key={it.key}
            onAnimationEnd={(e) => {
              if (it.leaving && e.target === e.currentTarget) setItems((list) => list.filter((x) => x.key !== it.key));
            }}
            style={{ "--dir": it.dir } as CSSProperties}
            className={`absolute inset-x-0 top-[6%] bottom-[14%] flex items-end justify-center [transform-style:preserve-3d] motion-reduce:[--turn:0deg] motion-reduce:[--turn-scale:1] ${
              it.leaving
                ? "pointer-events-none animate-[turnOut_450ms_cubic-bezier(.22,1,.36,1)_both]"
                : it.first
                  ? ""
                  : "animate-[turnIn_550ms_cubic-bezier(.22,1,.36,1)_both]"
            }`}
          >
            <div
              className={`[transform-style:preserve-3d] ${
                award.image
                  ? "animate-[stageSway_6s_ease-in-out_infinite] group-hover/stage:[animation-play-state:paused] motion-reduce:animate-none"
                  : "mb-[6%]"
              }`}
            >
              <div ref={it.leaving ? undefined : setTiltEl} className="[transform-style:preserve-3d] will-change-transform">
                {award.image ? (
                  <Trophy award={award} />
                ) : (
                  <div role="img" aria-label={`${award.title}, ${award.years}`}>
                    <Medal award={award} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Timeline rail ──
   A ruler from the first award's year to the last, one tick a year, a dot per
   award on its first year. The dots are one tab stop (roving tabindex);
   ArrowLeft and ArrowRight move between awards. Below md it scrolls sideways
   and keeps the active dot in view. */
function Rail({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pulse, setPulse] = useState(0);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
    } else setPulse((p) => p + 1);
    const box = scrollRef.current;
    const dot = dotRefs.current[active];
    if (box && dot && box.scrollWidth > box.clientWidth) {
      const left = dot.offsetLeft + dot.offsetWidth / 2 - box.clientWidth / 2;
      box.scrollTo({ left, behavior: reducedMotion() ? "auto" : "smooth" });
    }
  }, [active]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = (active + (e.key === "ArrowRight" ? 1 : -1) + N) % N;
    onPick(i);
    dotRefs.current[i]?.focus({ preventScroll: true });
  };

  const ticks = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

  return (
    <div
      ref={scrollRef}
      data-reveal
      className="mt-10 overflow-x-auto overscroll-x-contain [scrollbar-width:none] max-md:snap-x max-md:snap-mandatory md:overflow-visible lg:mt-12"
    >
      <div role="group" aria-label="Awards by year" onKeyDown={onKeyDown} className="relative mx-6 h-28 min-w-[680px] md:min-w-0">
        {/* The ruler, and the navy run up to the active award */}
        <span aria-hidden="true" className="absolute inset-x-0 top-16 h-px bg-(--hair)" />
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 top-[63.5px] h-0.5 origin-left bg-(--navy) transition-transform duration-600 ${EASE} motion-reduce:transition-none`}
          style={{ transform: `scaleX(${railPct(YEARS[active]) / 100})` }}
        />
        {ticks.map((y) => (
          <span key={y} aria-hidden="true" className="absolute top-16" style={{ left: `${railPct(y)}%` }}>
            <span className={`block w-px -translate-x-1/2 bg-(--hair) ${(y - MIN_YEAR) % 2 === 0 ? "h-2.5" : "h-1.5"}`} />
            {(y - MIN_YEAR) % 2 === 0 && (
              <span className="absolute left-0 top-4 -translate-x-1/2 text-[11px] tabular-nums text-(--mute)">{y}</span>
            )}
          </span>
        ))}

        {AWARD_TIMELINE.map((a, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              type="button"
              tabIndex={on ? 0 : -1}
              aria-label={`${a.title}, ${a.years}`}
              aria-current={on ? "true" : undefined}
              onClick={() => onPick(i)}
              className="group/dot absolute top-16 grid size-8 snap-center place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-(--navy)"
              style={{ left: `${railPct(YEARS[i])}%`, transform: `translate(-50%, calc(-50% - ${STACK[i] * 16}px))` }}
            >
              <span
                className={`relative block size-3 rounded-full ring-1 transition-colors duration-300 motion-reduce:transition-none ${
                  on ? "bg-(--navy) ring-(--navy)" : "bg-white ring-(--hair) group-hover/dot:ring-(--ink)"
                }`}
              >
                {on && pulse > 0 && (
                  <span
                    key={pulse}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-(--navy) animate-[ringPulse_900ms_ease-out_both] motion-reduce:hidden"
                  />
                )}
              </span>
              {/* Tooltip */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded-sm border border-(--hair) bg-white px-2 py-1 text-left text-[11px] leading-snug text-(--ink) opacity-0 transition-opacity duration-200 group-hover/dot:opacity-100 group-focus-visible/dot:opacity-100 motion-reduce:transition-none ${
                  railPct(YEARS[i]) < 20 ? "left-0" : railPct(YEARS[i]) > 80 ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                <b className="mr-1.5 font-semibold tabular-nums">{a.years}</b>
                {a.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── RECOGNITION & AWARDS: the showcase ──
   One `active` award drives the details, the stage, the rail and the counter.
   Autoplay moves on every 6s, timed by the progress hairline's own animation,
   so pausing it (hover, keyboard focus, off screen, a hidden tab, the pause
   button, reduced motion) simply holds the line where it is. */
export default function AwardShowcase({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(START);
  const [dir, setDir] = useState(1);
  const [userPaused, setUserPaused] = useState(() => typeof window !== "undefined" && reducedMotion());
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const paused = userPaused || hovered || focused || !onScreen || tabHidden;

  const rootRef = useRef<HTMLDivElement>(null);
  const [detailsRef, entered] = useInViewOnce<HTMLDivElement>(0.3);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const go = useCallback((i: number, d: number) => {
    setDir(d);
    setActive(((i % N) + N) % N);
  }, []);
  const next = () => go(active + 1, 1);
  const prev = () => go(active - 1, -1);
  const pick = (i: number) => i !== active && go(i, i > active ? 1 : -1);

  // The text leaves (200ms) before the next award's text rises in
  const [shown, setShown] = useState(active);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (active === shown) return;
    if (reducedMotion()) {
      setShown(active);
      return;
    }
    setLeaving(true);
    const t = window.setTimeout(() => {
      setShown(active);
      setLeaving(false);
    }, 200);
    return () => window.clearTimeout(t);
  }, [active, shown]);

  const award = AWARD_TIMELINE[active];
  const text = AWARD_TIMELINE[shown];
  const year = useTween(firstYear(award), entered);
  const count = useTween(active + 1, entered);

  const onFocus = (e: FocusEvent) => setFocused((e.target as HTMLElement).matches(":focus-visible"));
  const onBlur = (e: FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  const iconBtn =
    "grid size-11 place-items-center rounded-full border border-(--hair) bg-white text-(--ink) transition-colors duration-200 hover:border-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) motion-reduce:transition-none";

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch lg:gap-12">
        {/* ── Details ── */}
        <div ref={detailsRef} data-reveal-stagger className="flex flex-col">
          <dl className="m-0 grid grid-cols-3 border-y border-(--hair)">
            {[
              { value: N, label: "Awards" },
              { value: NATIONAL, label: "National trophies" },
              { value: N - NATIONAL, label: "Buyer awards" },
            ].map((s, i) => (
              <div key={s.label} className={`flex flex-col gap-2 py-4 ${i ? "border-l border-(--hair) pl-4 sm:pl-6" : ""}`}>
                <dt className="order-last text-[11px] uppercase leading-snug tracking-widest text-(--mute)">{s.label}</dt>
                <dd className="m-0 font-['Fira_Sans_Condensed'] text-[40px] font-semibold leading-none tabular-nums text-(--heading)">
                  <CountUp text={String(s.value)} delay={i * 80} />
                </dd>
              </div>
            ))}
          </dl>

          <div aria-live={paused ? "polite" : "off"} className="mt-8 min-h-88 sm:min-h-80 lg:mt-10 lg:min-h-0">
            {/* The year: counts from the last one; a range's end fades in */}
            <p className="m-0 font-['Fira_Sans_Condensed'] text-[88px] font-semibold leading-none tracking-[-0.02em] text-(--heading) lg:text-[120px]">
              <span aria-hidden="true" className="tabular-nums">
                {year}
              </span>
              {yearRest(award) && (
                <span
                  key={active}
                  aria-hidden="true"
                  className="ml-2 align-baseline text-[0.32em] tracking-normal text-(--mute) animate-[awardIn_400ms_ease-out_250ms_both] [--award-from:translateY(0)] motion-reduce:animate-none"
                >
                  {yearRest(award)}
                </span>
              )}
              <span className="sr-only">{award.years}</span>
            </p>
            <span
              key={`rule-${active}`}
              aria-hidden="true"
              className="mt-5 block h-0.5 w-10 origin-left bg-(--navy) animate-[autoFill_500ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none"
            />
            <div
              className={
                leaving ? "-translate-y-2 opacity-0 transition-[opacity,translate] duration-200 ease-out" : ""
              }
            >
              <h3
                key={`t-${shown}`}
                className="mt-5 font-['Fira_Sans_Condensed'] text-2xl font-semibold leading-tight text-(--heading) animate-[awardIn_450ms_cubic-bezier(.22,1,.36,1)_both] [--award-from:translateY(10px)] motion-reduce:animate-none lg:text-[32px]"
              >
                {text.title}
              </h3>
              {text.text && (
                <p
                  key={`x-${shown}`}
                  className="mt-3 max-w-[44ch] text-intro text-(--mute) animate-[awardIn_450ms_cubic-bezier(.22,1,.36,1)_60ms_both] [--award-from:translateY(10px)] motion-reduce:animate-none"
                >
                  {text.text}
                </p>
              )}
              {(text.by || text.logo) && (
                <p
                  key={`i-${shown}`}
                  className="mt-4 flex items-center gap-3 text-sm text-(--mute) animate-[awardIn_450ms_cubic-bezier(.22,1,.36,1)_120ms_both] [--award-from:translateY(10px)] motion-reduce:animate-none"
                >
                  {text.logo && (
                    <img src={`${media}${text.logo}`} alt="" className="max-h-6 w-auto max-w-20 object-contain grayscale" />
                  )}
                  {text.by && (
                    <span>
                      Issued by <span className="text-(--ink)">{text.by}</span>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Controls, counter and the autoplay line */}
          <div className="mt-8 flex items-center gap-3 lg:mt-auto lg:pt-8">
            <button type="button" aria-label="Previous award" onClick={prev} className={iconBtn}>
              <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={userPaused ? "Play autoplay" : "Pause autoplay"}
              onClick={() => setUserPaused((p) => !p)}
              className={iconBtn}
            >
              {userPaused ? (
                <Play size={18} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Pause size={18} strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
            <button type="button" aria-label="Next award" onClick={next} className={iconBtn}>
              <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <p className="m-0 ml-2 font-['Fira_Sans_Condensed'] text-lg tabular-nums text-(--heading)">
              <span aria-hidden="true">
                {pad(count)} <span className="text-(--mute)">/ {pad(N)}</span>
              </span>
              <span className="sr-only">
                Award {active + 1} of {N}
              </span>
            </p>
            <span aria-hidden="true" className="relative ml-2 h-px flex-1 overflow-hidden bg-(--hair)">
              <span
                key={active}
                onAnimationEnd={next}
                className="absolute inset-0 origin-left bg-(--navy) animate-[autoFill_linear_both]"
                style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
              />
            </span>
          </div>
        </div>

        {/* ── Stage ── */}
        <Stage active={active} dir={dir} year={year} onSwipe={(d) => (d > 0 ? next() : prev())} className="max-lg:order-first" />
      </div>

      <Rail active={active} onPick={pick} />

      {/* ── Certifications ── */}
      <div className="mt-8 flex flex-col gap-3 border-t border-(--hair) pt-8 sm:flex-row sm:items-center sm:gap-6">
        <p data-reveal className="m-0 shrink-0 text-[11px] tracking-widest text-(--mute)">
          CERTIFIED
        </p>
        <div data-reveal-stagger className="flex flex-wrap gap-3">
          {CERTIFICATIONS.map((c) => (
            <span key={c.abbr} className="rounded-xs border border-(--hair) bg-white px-4 py-2.5 text-xs text-(--mute)">
              <b className="mr-2 font-semibold text-(--ink)">{c.abbr}</b>
              {c.name}
            </span>
          ))}
          <span className="rounded-xs border border-(--hair) bg-white px-4 py-2.5 text-xs text-(--mute)">
            <b className="mr-2 font-semibold text-(--ink)">LAB</b>
            {F.laboratory}
          </span>
        </div>
      </div>
    </div>
  );
}
