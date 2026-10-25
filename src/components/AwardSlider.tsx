import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";
import { AWARD_TIMELINE, type TimelineAward } from "../data/facts";

const media = "/media/";
const N = AWARD_TIMELINE.length;
const firstYear = (a: TimelineAward) => a.years.match(/\d{4}/)?.[0] ?? a.years;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n: number) => String(n).padStart(2, "0");

// Open on the newest award that has a photo
const START = AWARD_TIMELINE.reduce((last, a, i) => (a.image ? i : last), N - 1);

/* One award card: its photo, or a stitched fallback with the issuer */
function CardFace({ a }: { a: TimelineAward }) {
  if (a.image)
    return (
      <img
        src={`${media}${a.image}`}
        alt={`${a.title}, ${a.years}`}
        width={200}
        height={270}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="size-full object-cover"
      />
    );
  return (
    <span className="relative flex size-full flex-col items-center justify-center gap-3 bg-[linear-gradient(160deg,#fff,var(--mist))]">
      <Award size={40} strokeWidth={1.5} aria-hidden="true" className="text-(--red)" />
      {a.logo && (
        <img
          src={`${media}${a.logo}`}
          alt={a.by ?? ""}
          width={96}
          height={32}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="max-h-8 w-auto object-contain opacity-70 grayscale"
        />
      )}
      <span className="font-['Fira_Sans_Condensed'] text-lg font-semibold text-(--mute)">{firstYear(a)}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-2.5 rounded-xl border border-dashed border-(--ink)/15" />
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
  const spacing = useRef(210);
  const drag = useRef<{ x: number; t: number; lastX: number; lastTime: number; v: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  // Write every card's transform for the current position: no React render per frame
  const paint = useCallback(() => {
    cards.current.forEach((el, i) => {
      if (!el) return;
      const d = i - pos.current;
      const ad = Math.abs(d);
      const scale = 1 + Math.min(ad, 3) * 0.16;
      const rot = clamp(d, -3, 3) * -14;
      el.style.transform = `translate(-50%,-50%) translateX(${d * spacing.current}px) rotateY(${rot}deg) scale(${scale})`;
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.style.opacity = ad > 3.5 ? "0" : "1";
      el.style.visibility = ad > 4 ? "hidden" : "visible";
    });
  }, []);

  const tick = useCallback(() => {
    pos.current += (target.current - pos.current) * 0.12;
    if (Math.abs(target.current - pos.current) < 0.001) {
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
      spacing.current = mq.matches ? 210 : 160;
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
      go(target.current + e.deltaX / spacing.current, false);
      clearTimeout(snap);
      snap = window.setTimeout(() => go(Math.round(target.current)), 150);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      clearTimeout(snap);
    };
  }, [go]);

  const navBtn =
    "group grid size-11 place-items-center rounded-full border border-(--hair) bg-white text-(--ink) transition-colors duration-300 hover:border-(--red) disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--red) motion-reduce:transition-none";
  const a = AWARD_TIMELINE[active];

  return (
    <div className={className}>
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
          go(g.t - dx / spacing.current, false);
        }}
        onPointerUp={() => {
          const g = drag.current;
          drag.current = null;
          if (!g?.moved) return;
          suppressClick.current = true;
          // A flick carries on a card or two, by velocity (px/ms)
          go(Math.round(target.current - clamp(g.v * 0.6, -2, 2)));
        }}
        onPointerCancel={() => {
          drag.current = null;
          go(Math.round(target.current));
        }}
        className="relative h-[380px] cursor-grab touch-pan-y select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [perspective:1100px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--red) active:cursor-grabbing md:h-[440px]"
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
            className={`absolute left-1/2 top-1/2 h-[205px] w-[150px] overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_rgba(17,20,24,0.14)] transition-[filter,box-shadow] duration-300 will-change-transform motion-reduce:transition-none md:h-[270px] md:w-[200px] ${
              i === active ? "ring-2 ring-(--red) ring-offset-4 ring-offset-(--mist)" : "brightness-95 grayscale-[35%]"
            }`}
          >
            <CardFace a={t} />
          </button>
        ))}
        {/* Centre marker */}
        <span aria-hidden="true" className="absolute bottom-3 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-(--red)" />
      </div>

      {/* Details of the active award */}
      <div aria-live="polite" className="relative z-10 mx-auto -mt-6 max-w-md rounded-2xl border border-(--hair) bg-white px-6 py-5 text-center shadow-sm">
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
        <button type="button" onClick={() => go(active + 1)} disabled={active === N - 1} aria-label="Next award" className={navBtn}>
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </button>
      </div>

      {/* Progress track */}
      <div aria-hidden="true" className="relative mx-auto mt-5 h-px w-40 bg-(--hair)">
        <span
          className="absolute top-1/2 h-0.5 w-6 -translate-y-1/2 bg-(--red) transition-[left] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
          style={{ left: `calc(${active / (N - 1)} * (100% - 1.5rem))` }}
        />
      </div>
    </div>
  );
}
