import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Award, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { AWARD_TIMELINE, type TimelineAward } from "../data/facts";

const media = "./media/";
const N = AWARD_TIMELINE.length;
const firstYear = (a: TimelineAward) => a.years.match(/\d{4}/)?.[0] ?? a.years;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n: number) => String(n).padStart(2, "0");

// Open on the first award photo, Kohl's Greatness Award 2017
const START = Math.max(0, AWARD_TIMELINE.findIndex((a) => a.years === "2017"));
const AUTO_MS = 4500;

// Outer cards shrink: 1 → .84 → .68 → .62
const scaleAt = (k: number) => Math.max(0.62, 1 - Math.min(k, 3) * 0.16);

/* One award card: its photo, or a stitched fallback with the issuer */
function CardFace({ a, active }: { a: TimelineAward; active: boolean }) {
  if (a.image)
    return (
      <img
        src={`${media}${a.image}`}
        alt={`${a.title}, ${a.years}`}
        width={220}
        height={294}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`size-full object-cover object-center transition-transform duration-700 ease-out motion-reduce:transition-none ${active ? "group-hover/card:scale-[1.04]" : ""}`}
      />
    );
  return (
    <span className="relative flex size-full flex-col items-center justify-center gap-3 bg-white">
      <Award size={36} strokeWidth={1.5} aria-hidden="true" className="text-(--red)" />
      {a.logo && (
        <img
          src={`${media}${a.logo}`}
          alt={a.by ?? ""}
          width={96}
          height={32}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="max-h-7 w-auto object-contain opacity-70 grayscale"
        />
      )}
      <span className="font-['Fira_Sans_Condensed'] text-lg font-semibold text-(--mute)">{firstYear(a)}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[14px] border border-dashed border-(--ink)/12" />
    </span>
  );
}

export default function AwardSlider({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(START);
  const stageRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const pos = useRef(START);
  const target = useRef(START);
  const raf = useRef(0);
  // Card width and gap by breakpoint; `step` is one card's px for drag and wheel
  const spacing = useRef({ cardW: 220, gap: 28, step: 220 * 0.92 + 28 });
  const drag = useRef<{ x: number; t: number; lastX: number; lastTime: number; v: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [retry, setRetry] = useState(0);
  const [canAuto, setCanAuto] = useState(false);
  // Temporary pauses: hover, focus, drag, off-screen, hidden tab
  const hold = useRef(false);
  const holds = useRef({ hover: false, focus: false, drag: false, offscreen: false });
  const setHold = useCallback((k: keyof typeof holds.current, v: boolean) => {
    holds.current[k] = v;
    hold.current = Object.values(holds.current).some(Boolean) || document.visibilityState === "hidden";
    wrapRef.current?.toggleAttribute("data-held", hold.current);
  }, []);

  // Write every card's transform for the current position: no React render per frame
  const paint = useCallback(() => {
    cards.current.forEach((el, i) => {
      if (!el) return;
      const d = i - pos.current;
      const ad = Math.abs(d);
      const scale = scaleAt(ad);
      const rot = clamp(d, -3, 3) * -10;
      // No overlap: each step moves by the scaled widths of both cards plus a gap
      const { cardW, gap } = spacing.current;
      const stepAt = (k: number) => (cardW * (scaleAt(k) + scaleAt(k + 1))) / 2 + gap;
      const whole = Math.floor(ad);
      let offset = (ad - whole) * stepAt(whole);
      for (let k = 0; k < whole; k++) offset += stepAt(k);
      const x = Math.sign(d) * offset;
      el.style.transform = `translate(-50%,-50%) translateX(${x}px) rotateY(${rot}deg) scale(${scale})`;
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.style.opacity = String(ad > 3.2 ? 0 : 1 - Math.min(ad, 3) * 0.18);
      el.style.visibility = ad > 3.6 ? "hidden" : "visible";
    });
  }, []);

  const tick = useCallback(() => {
    pos.current += (target.current - pos.current) * 0.085;
    if (Math.abs(target.current - pos.current) < 0.0005) {
      pos.current = target.current;
      raf.current = 0;
    } else raf.current = requestAnimationFrame(tick);
    paint();
  }, [paint]);

  const go = useCallback(
    (t: number, bound = true) => {
      target.current = bound ? clamp(t, 0, N - 1) : clamp(t, -0.4, N - 0.6);
      setActive(clamp(Math.round(target.current), 0, N - 1));
      if (reduced()) {
        pos.current = target.current;
        paint();
      } else if (!raf.current) raf.current = requestAnimationFrame(tick);
    },
    [paint, tick],
  );

  // Spacing follows the breakpoint; repaint on resize
  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const cardW = mq.matches ? 220 : 160;
      const gap = mq.matches ? 28 : 16;
      spacing.current = { cardW, gap, step: cardW * 0.92 + gap };
      paint();
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [paint]);

  // Horizontal wheel / trackpad only; vertical scroll is left alone
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let snap = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      go(target.current + e.deltaX / spacing.current.step, false);
      clearTimeout(snap);
      snap = window.setTimeout(() => go(Math.round(target.current)), 150);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      clearTimeout(snap);
    };
  }, [go]);

  // Off-screen and hidden-tab holds; autoplay is off under reduced motion
  useEffect(() => {
    setCanAuto(!reduced());
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHold("offscreen", !e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    const onVis = () => setHold("hover", holds.current.hover);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [setHold]);

  // Autoplay: one timeout, re-armed by every move; while held it just retries
  useEffect(() => {
    if (paused || !canAuto) return;
    const id = window.setTimeout(() => {
      if (!hold.current) go(active === N - 1 ? 0 : active + 1);
      else setRetry((t) => t + 1);
    }, AUTO_MS);
    return () => clearTimeout(id);
  }, [active, paused, retry, go, canAuto]);

  const navBtn =
    "group grid size-11 place-items-center rounded-full border border-(--hair) bg-white text-(--ink) transition-colors duration-300 hover:border-(--ink) disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--red) motion-reduce:transition-none";
  const a = AWARD_TIMELINE[active];

  return (
    <div
      ref={wrapRef}
      className={`group/slider ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHold("hover", true)}
      onPointerLeave={() => setHold("hover", false)}
      onFocus={() => setHold("focus", true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold("focus", false);
      }}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Awards"
        onKeyDown={(e) => {
          const map: Record<string, number> = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: N - 1 };
          if (e.key in map) {
            e.preventDefault();
            go(map[e.key]);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          setHold("drag", true);
          drag.current = { x: e.clientX, t: target.current, lastX: e.clientX, lastTime: e.timeStamp, v: 0, moved: false };
        }}
        onPointerMove={(e) => {
          const g = drag.current;
          if (!g) return;
          const dx = e.clientX - g.x;
          if (!g.moved && Math.abs(dx) > 5) {
            g.moved = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          if (!g.moved) return;
          const dt = e.timeStamp - g.lastTime;
          if (dt > 0) g.v = (e.clientX - g.lastX) / dt;
          g.lastX = e.clientX;
          g.lastTime = e.timeStamp;
          go(g.t - dx / spacing.current.step, false);
        }}
        onPointerUp={() => {
          const g = drag.current;
          drag.current = null;
          setHold("drag", false);
          if (!g?.moved) return;
          suppressClick.current = true;
          // A flick carries on a card or two, by velocity (px/ms)
          go(Math.round(target.current - clamp(g.v * 0.6, -2, 2)));
        }}
        onPointerCancel={() => {
          drag.current = null;
          setHold("drag", false);
          go(Math.round(target.current));
        }}
        className="relative h-85 cursor-grab touch-pan-y select-none overflow-x-clip mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] perspective-[1100px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--red) active:cursor-grabbing md:h-100"
      >
        {AWARD_TIMELINE.map((t, i) => (
          <button
            key={`${t.years}-${t.title}-${i}`}
            ref={(el) => {
              cards.current[i] = el;
            }}
            type="button"
            tabIndex={-1}
            aria-label={`${t.title}, ${t.years}`}
            aria-current={i === active || undefined}
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              go(i);
            }}
            className="group/card absolute left-1/2 top-1/2 h-53.5 w-40 will-change-transform md:h-73.5 md:w-55"
          >
            <span
              className={`block size-full overflow-hidden rounded-[20px] bg-white transition-[filter] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${
                i === active
                  ? "blur-0 ring-2 ring-(--red) ring-offset-[6px] ring-offset-white grayscale-0 saturate-100"
                  : Math.abs(i - active) === 1
                    ? "ring-1 ring-(--hair) blur-[1.5px] grayscale-30"
                    : "ring-1 ring-(--hair) blur-[3px] grayscale-50"
              }`}
            >
              <CardFace a={t} active={i === active} />
            </span>
            {/* Year chip under the active card */}
            <span
              aria-hidden="true"
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--red) px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white transition-[opacity,translate] duration-300 motion-reduce:transition-none ${
                i === active ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              {t.years}
            </span>
          </button>
        ))}
      </div>

      {/* Details of the active award */}
      <div aria-live="polite" className="mx-auto mt-8 max-w-xl text-center">
        <div
          key={active}
          className="animate-[awardIn_400ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none"
          style={{ "--award-from": "translateY(8px)" } as CSSProperties}
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-(--red)">{a.years}</p>
          <h3 className="mt-1 font-['Fira_Sans_Condensed'] text-2xl font-bold text-(--ink)">{a.title}</h3>
          {a.text && <p className="mt-2 text-pretty text-sm text-(--mute)">{a.text}</p>}
          {a.by && <p className="mt-2 text-xs text-(--mute)">Issued by {a.by}</p>}
        </div>
      </div>

      {/* Prev, counter, next */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous award" className={navBtn}>
          <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none" />
        </button>
        <span className="min-w-16 text-center text-sm tabular-nums tracking-widest text-(--mute)">
          <b className="font-semibold text-(--ink)">{pad(active + 1)}</b> / {pad(N)}
        </span>
        {canAuto && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={paused}
            className={navBtn}
          >
            {paused ? <Play size={16} strokeWidth={1.75} fill="currentColor" aria-hidden="true" /> : <Pause size={16} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        )}
        <button type="button" onClick={() => go(active + 1)} disabled={active === N - 1} aria-label="Next award" className={navBtn}>
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </button>
      </div>

      {/* Positions, then the progress track */}
      <div className="mx-auto mt-5 flex w-48 flex-col gap-1">
        <div className="flex justify-between">
          {AWARD_TIMELINE.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to ${t.title}, ${t.years}`}
              className="-mx-2.5 grid size-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-(--red)"
            >
              <span className={`size-1 rounded-full transition-colors duration-300 ${i === active ? "bg-(--red)" : "bg-(--hair)"}`} />
            </button>
          ))}
        </div>
        <div aria-hidden="true" className="h-[2px] overflow-hidden rounded-full bg-(--hair)">
          {canAuto && !paused ? (
            // Autoplay timer: fills over one slide, frozen while held
            <span
              key={active}
              className="block h-full origin-left bg-(--red) animate-[autoFill_4500ms_linear_both] group-data-held/slider:[animation-play-state:paused]"
            />
          ) : (
            <span
              className="block h-full origin-left bg-(--red) transition-transform duration-500 motion-reduce:transition-none"
              style={{ transform: `scaleX(${(active + 1) / N})` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
