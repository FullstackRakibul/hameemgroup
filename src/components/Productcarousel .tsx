import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

/* ── Product carousel ──
   A 3D "coverflow" slider: the active card faces forward, its neighbours sit
   back, turned and slightly blurred. Image and text move at different speeds
   (parallax) while the track travels. Autoplays, pauses on hover / focus /
   off-screen, and supports drag, swipe, arrow keys and the stitch pagination.

   Styling is Tailwind only and uses the site tokens from index.css
   (--ink, --red, --mist, --hair, --mute). No extra CSS file is needed. */

export type CarouselItem = {
  title: string;
  text?: string;
  image: string;
};

type Props = {
  items: CarouselItem[];
  /** Accessible name of the carousel region. */
  label?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Time each slide stays up before autoplay advances, in ms. */
  interval?: number;
  /** Length of the slide-to-slide animation, in ms. */
  transitionMs?: number;
};

/* Geometry of the 3D layout. Narrower screens get a flatter, tighter stack. */
type Tuning = {
  gap: number; // px between cards
  peek: number; // share of the viewport left free on each side for neighbours
  rotateY: number; // deg a neighbour is turned
  zDepth: number; // px a neighbour is pushed back
  scaleDrop: number; // scale lost per step away from centre
  blurMax: number; // px of blur on neighbours
};

const BASE: Tuning = {
  gap: 28,
  peek: 0.15,
  rotateY: 34,
  zDepth: 150,
  scaleDrop: 0.09,
  blurMax: 2,
};

const BREAKPOINTS: Array<{ mq: string } & Partial<Tuning>> = [
  { mq: "(max-width: 1200px)", gap: 24, peek: 0.12, rotateY: 28, zDepth: 120, scaleDrop: 0.08 },
  { mq: "(max-width: 1000px)", gap: 18, peek: 0.09, rotateY: 22, zDepth: 90, scaleDrop: 0.07 },
  { mq: "(max-width: 768px)", gap: 14, peek: 0.06, rotateY: 16, zDepth: 70, scaleDrop: 0.06 },
  { mq: "(max-width: 560px)", gap: 12, peek: 0.05, rotateY: 12, zDepth: 60, scaleDrop: 0.05 },
];

const MAX_SLIDE_W = 880;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const mod = (i: number, n: number) => ((i % n) + n) % n;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);

/* What the React controls can ask the animation engine to do. */
type Engine = {
  prev: () => void;
  next: () => void;
  goTo: (i: number) => void;
};

const roundBtn =
  "btn-ring grid place-items-center size-11 rounded-full border border-(--ink) bg-transparent text-(--ink) transition-colors duration-300 hover:bg-(--ink) hover:text-white! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--red)";

/* Stitch dash, same 8 / 6 rhythm as the page's stitch scrollbar. */
const stitchRest =
  "bg-[repeating-linear-gradient(90deg,color-mix(in_srgb,var(--ink)_28%,transparent)_0_8px,transparent_8px_14px)]";
const stitchActive =
  "bg-[repeating-linear-gradient(90deg,var(--ink)_0_8px,transparent_8px_14px)]";
const stitchLive =
  "bg-[repeating-linear-gradient(90deg,var(--red)_0_8px,transparent_8px_14px)]";

function ProductCarousel({
  items,
  label = "Products",
  ctaLabel = "SOURCING ENQUIRY",
  ctaHref = "#contact",
  interval = 4500,
  transitionMs = 900,
}: Props) {
  const n = items.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const engineRef = useRef<Engine | null>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  // The engine reads the pause flag every frame without being rebuilt.
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    if (!root || !viewport || n === 0) return;

    const motionQuery = window.matchMedia(REDUCED_MOTION);
    let reducedMotion = motionQuery.matches;
    setReduced(reducedMotion);

    let tuning: Tuning = BASE;
    let slideW = 0;
    let parallaxScale = 1;

    let index = 0; // slide the track rests on
    let pos = 0; // live, fractional track position
    let shown = 0; // slide currently reported to React

    let anim: { from: number; to: number; t0: number; dur: number } | null = null;
    let elapsed = 0; // autoplay clock for the current slide
    let last = 0;
    let rafId = 0;
    let running = false;
    let dirty = true;

    let inView = false;
    let hovering = false;
    let focused = false;

    let tiltX = 0;
    let tiltY = 0;

    // Drag state. A press only becomes a drag after a clear horizontal move.
    let pointerId: number | null = null;
    let dragging = false;
    let x0 = 0;
    let y0 = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let dragBase = 0;
    let justDragged = false;

    const setProgress = (p: number) =>
      root.style.setProperty("--carousel-progress", clamp(p, 0, 1).toFixed(4));

    const report = (i: number) => {
      if (i === shown) return;
      shown = i;
      setActive(i);
    };

    const measure = () => {
      tuning = { ...BASE };
      for (const { mq, ...patch } of BREAKPOINTS) {
        if (window.matchMedia(mq).matches) Object.assign(tuning, patch);
      }
      if (reducedMotion) {
        tuning.rotateY = 0;
        tuning.zDepth = 0;
        tuning.blurMax = 0;
      }
      slideW = Math.min(MAX_SLIDE_W, viewport.clientWidth * (1 - tuning.peek * 2));
      // Parallax travel shrinks with the card so the image never runs out.
      parallaxScale = reducedMotion ? 0 : slideW / MAX_SLIDE_W;
      root.style.setProperty("--slide-w", `${slideW.toFixed(1)}px`);
      dirty = true;
    };

    const render = () => {
      const span = slideW + tuning.gap;
      for (let i = 0; i < n; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;

        // Signed distance from the centre, wrapped so the track is endless.
        let d = i - pos;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        const abs = Math.abs(d);

        const tx = d * span;
        const depth = -abs * tuning.zDepth;
        const rot = -d * tuning.rotateY;
        const scale = 1 - Math.min(abs * tuning.scaleDrop, 0.42);
        const blur = Math.min(abs * tuning.blurMax, tuning.blurMax);

        el.style.transform = `translate3d(calc(-50% + ${tx.toFixed(2)}px), -50%, ${depth.toFixed(2)}px) rotateY(${rot.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
        el.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none";
        el.style.zIndex = String(Math.round(1000 - abs * 10));

        const parBase = clamp(-d, -1, 1);
        const parX = (parBase * 48 + tiltY * 2) * parallaxScale;
        const parY = tiltX * -1.5 * parallaxScale;
        const bgX = (parBase * -64 + tiltY * -2.4) * parallaxScale;
        el.style.setProperty("--par-x", `${parX.toFixed(2)}px`);
        el.style.setProperty("--par-y", `${parY.toFixed(2)}px`);
        el.style.setProperty("--par-bg-x", `${bgX.toFixed(2)}px`);
        el.style.setProperty("--par-bg-y", `${(parY * 0.35).toFixed(2)}px`);
      }
      report(mod(Math.round(pos), n));
    };

    const autoplayAllowed = () =>
      !reducedMotion && !pausedRef.current && !hovering && !focused && inView && n > 1;

    const frame = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;

      if (anim) {
        const t = anim.dur > 0 ? Math.min(1, (now - anim.t0) / anim.dur) : 1;
        pos = anim.from + (anim.to - anim.from) * easeOutQuart(t);
        dirty = true;
        if (t >= 1) {
          index = mod(Math.round(pos), n);
          pos = index;
          anim = null;
          elapsed = 0;
          setProgress(reducedMotion ? 1 : 0);
        }
      } else if (!dragging && autoplayAllowed()) {
        elapsed += dt;
        setProgress(elapsed / interval);
        if (elapsed >= interval) goTo(index + 1);
      }

      if (dirty) {
        render();
        dirty = false;
      }

      // Nothing to animate while the section is off-screen: stop the loop.
      if (inView || anim || dragging) rafId = requestAnimationFrame(frame);
      else running = false;
    };

    const ensureLoop = () => {
      if (running) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    function goTo(target: number, animate = true) {
      const from = pos;
      // Travel the short way round.
      let d = mod(target, n) - Math.round(from);
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const to = Math.round(from) + d;
      anim = {
        from,
        to,
        t0: performance.now(),
        dur: animate && !reducedMotion ? transitionMs : 0,
      };
      ensureLoop();
    }

    engineRef.current = {
      prev: () => goTo(mod(Math.round(pos), n) - 1),
      next: () => goTo(mod(Math.round(pos), n) + 1),
      goTo: (i) => goTo(i),
    };

    /* ── Pointer: drag / swipe ── */
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointerId = e.pointerId;
      dragging = false;
      x0 = lastX = e.clientX;
      y0 = e.clientY;
      lastT = performance.now();
      velocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && !reducedMotion) {
        const r = viewport.getBoundingClientRect();
        tiltX = ((e.clientY - r.top) / r.height - 0.5) * -6;
        tiltY = ((e.clientX - r.left) / r.width - 0.5) * 6;
        dirty = true;
      }
      if (pointerId !== e.pointerId) return;

      const dx = e.clientX - x0;
      if (!dragging) {
        const dy = e.clientY - y0;
        if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return;
        dragging = true;
        anim = null;
        dragBase = pos;
        x0 = e.clientX;
        viewport.setPointerCapture(e.pointerId);
        viewport.dataset.dragging = "true";
        ensureLoop();
        return;
      }

      const now = performance.now();
      const instant = (e.clientX - lastX) / Math.max(1, now - lastT);
      velocity = velocity * 0.6 + instant * 0.4;
      lastX = e.clientX;
      lastT = now;
      pos = dragBase - dx / (slideW + tuning.gap);
      dirty = true;
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      delete viewport.dataset.dragging;
      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId);
      }
      // A flick carries the track one card further in its direction.
      const flick = Math.abs(velocity) > 0.18 ? Math.sign(velocity) * 0.5 : 0;
      goTo(Math.round(pos - flick));
      justDragged = true;
      window.setTimeout(() => (justDragged = false), 0);
    };

    /* ── Click: swallow the click that ends a drag; a click on a neighbour
       brings it forward instead of following its link. ── */
    const onClickCapture = (e: MouseEvent) => {
      if (justDragged) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const slide = (e.target as HTMLElement).closest<HTMLElement>("[data-slide]");
      if (!slide) return;
      const i = Number(slide.dataset.slide);
      if (i !== mod(Math.round(pos), n)) {
        e.preventDefault();
        e.stopPropagation();
        goTo(i);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        engineRef.current?.prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        engineRef.current?.next();
      }
    };

    /* ── Autoplay holds ── */
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovering = true;
    };
    const onLeave = () => {
      hovering = false;
      tiltX = tiltY = 0;
      dirty = true;
    };
    const onFocusIn = () => (focused = true);
    const onFocusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) focused = false;
    };

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      setReduced(reducedMotion);
      setProgress(reducedMotion ? 1 : 0);
      elapsed = 0;
      measure();
      ensureLoop();
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerEnd);
    viewport.addEventListener("pointercancel", onPointerEnd);
    viewport.addEventListener("click", onClickCapture, true);
    viewport.addEventListener("keydown", onKeyDown);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    motionQuery.addEventListener("change", onMotionChange);

    const resizeObserver = new ResizeObserver(() => {
      measure();
      ensureLoop();
    });
    resizeObserver.observe(viewport);

    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) ensureLoop();
      },
      { threshold: 0.25 },
    );
    viewObserver.observe(root);

    // First paint: lay the cards out before the browser shows anything.
    measure();
    setProgress(reducedMotion ? 1 : 0);
    render();
    dirty = false;

    return () => {
      cancelAnimationFrame(rafId);
      running = false;
      engineRef.current = null;
      resizeObserver.disconnect();
      viewObserver.disconnect();
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerEnd);
      viewport.removeEventListener("pointercancel", onPointerEnd);
      viewport.removeEventListener("click", onClickCapture, true);
      viewport.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [n, interval, transitionMs]);

  if (n === 0) return null;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative [--card-h:clamp(340px,58vh,580px)]"
    >
      {/* Stage */}
      <div
        ref={viewportRef}
        tabIndex={0}
        className="relative isolate overflow-hidden select-none touch-pan-y cursor-grab data-dragging:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--red)"
      >
        <div
          aria-live={paused || reduced ? "polite" : "off"}
          className="relative h-[calc(var(--card-h)+112px)] perspective-[1200px]"
        >
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <article
                key={item.title}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                data-slide={i}
                data-state={isActive ? "active" : "rest"}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${item.title}`}
                aria-hidden={!isActive}
                className="group absolute top-1/2 left-1/2 h-(--card-h) w-(--slide-w) overflow-hidden bg-(--ink) text-white will-change-[transform,filter] shadow-[0_16px_32px_-16px_rgba(17,20,24,0.5)] transition-shadow duration-500 data-[state=active]:shadow-[0_22px_40px_-18px_rgba(17,20,24,0.65)] data-[state=rest]:cursor-pointer"
              >
                {/* Image layer: oversized so it can slide behind the frame */}
                <img
                  src={item.image}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="absolute -inset-[2%] size-[104%] max-w-none object-cover scale-[1.18] translate-x-(--par-bg-x) translate-y-(--par-bg-y) brightness-[0.82] saturate-[0.9] transition-[translate,filter] duration-800 ease-[cubic-bezier(0.2,0.7,0,1)] group-data-[state=active]:brightness-100 group-data-[state=active]:saturate-100"
                />
                {/* Ink wash: dark at the top and bottom for the type, clear in the middle for the product */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-b from-[rgba(17,20,24,0.62)] via-[rgba(17,20,24,0.08)] via-45% to-[rgba(17,20,24,0.82)]"
                />

                {/* Title */}
                <h3 className="absolute left-6 right-6 top-6 md:left-9 md:right-9 md:top-8 m-0 font-['Fira_Sans_Condensed'] font-black text-[clamp(26px,3.6vw,46px)] leading-[0.98] text-balance translate-x-[calc(var(--par-x,0px)*0.35)] translate-y-[calc(var(--par-y,0px)*0.35)] transition-[translate] duration-500 ease-[cubic-bezier(0.2,0.7,0,1)] will-change-transform">
                  {item.title}
                </h3>

                {/* Description + action */}
                <div className="absolute left-6 right-6 bottom-6 md:left-9 md:right-9 md:bottom-8 flex flex-col items-start gap-5">
                  {item.text && (
                    <p className="max-w-[46ch] text-sm md:text-base leading-relaxed text-white/85 text-pretty translate-x-[calc(var(--par-x,0px)*0.25)] translate-y-[calc(var(--par-y,0px)*0.25)] transition-[translate] duration-500 ease-[cubic-bezier(0.2,0.7,0,1)] will-change-transform">
                      {item.text}
                    </p>
                  )}
                  <a
                    href={ctaHref}
                    tabIndex={isActive ? 0 : -1}
                    draggable={false}
                    className="btn-ring [--ring:#fff] inline-block rounded-full border border-white px-7 py-3.5 text-[11px] font-semibold tracking-widest text-white translate-x-[calc(var(--par-x,0px)*0.18)] translate-y-[calc(var(--par-y,0px)*0.18)] transition-[translate,background-color,color] duration-500 ease-[cubic-bezier(0.2,0.7,0,1)] hover:bg-white hover:text-(--ink)! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {ctaLabel}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Controls: stitch pagination (also the autoplay progress) + buttons */}
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex items-center sm:gap-2.5 md:gap-4">
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <button
                key={item.title}
                type="button"
                aria-label={`Show ${item.title}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => engineRef.current?.goTo(i)}
                className="group/dot relative h-11 w-11 sm:w-9 md:w-16 border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-(--red)"
              >
                <span
                  className={`absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 sm:inset-x-0 ${
                    isActive ? stitchActive : `${stitchRest} group-hover/dot:opacity-60`
                  }`}
                />
                <span
                  className={`absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 sm:inset-x-0 ${stitchLive} ${
                    isActive
                      ? "[clip-path:inset(0_calc((1_-_var(--carousel-progress,0))*100%)_0_0)]"
                      : "[clip-path:inset(0_100%_0_0)]"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous product"
            onClick={() => engineRef.current?.prev()}
            className={roundBtn}
          >
            ←
          </button>
          {!reduced && (
            <button
              type="button"
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
              className={roundBtn}
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
          )}
          <button
            type="button"
            aria-label="Next product"
            onClick={() => engineRef.current?.next()}
            className={roundBtn}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCarousel);