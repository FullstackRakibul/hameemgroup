import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Award, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AWARD_TIMELINE, type TimelineAward } from "../data/facts";

const media = "/media/";
const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";
const firstYear = (a: TimelineAward) => a.years.match(/\d{4}/)?.[0] ?? a.years;
const lastYear = (a: TimelineAward) => a.years.match(/\d{4}/g)?.at(-1) ?? a.years;

/* One award at a given size: its photo, or a stitched fallback frame */
function AwardFrame({ a, featured = false, className = "" }: { a: TimelineAward; featured?: boolean; className?: string }) {
  const box = `relative overflow-hidden rounded-sm ring-1 ring-(--hair) transition-[box-shadow,translate] duration-500 ${EASE} motion-reduce:transition-none ${className}`;
  if (a.image)
    return (
      <span className={box}>
        <img
          src={`${media}${a.image}`}
          alt={`${a.title}, ${a.years}`}
          width={featured ? 360 : 192}
          height={featured ? 480 : 256}
          loading="lazy"
          decoding="async"
          className={`size-full object-cover transition-transform duration-500 ${EASE} group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
        />
      </span>
    );
  return (
    <span className={`${box} flex flex-col items-center justify-center gap-2 bg-white bg-[linear-gradient(160deg,#fff_0%,var(--mist)_100%)]`}>
      <Award size={featured ? 56 : 28} strokeWidth={1.5} aria-hidden="true" className="text-(--primary)" />
      {a.logo && (
        <img
          src={`${media}${a.logo}`}
          alt={a.by ?? ""}
          width={featured ? 120 : 72}
          height={featured ? 40 : 24}
          loading="lazy"
          decoding="async"
          className={`${featured ? "max-h-10" : "max-h-6"} w-auto object-contain opacity-70 grayscale`}
        />
      )}
      <span className="font-['Fira_Sans_Condensed'] text-sm font-semibold text-(--mute)">{firstYear(a)}</span>
      {/* Stitch inside the frame */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-sm border border-dashed border-(--ink)/15" />
    </span>
  );
}

export default function AwardGallery({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const stripRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<number | null>(null);
  const last = AWARD_TIMELINE.length - 1;

  // Focus the close button on open; give focus back to the opener on close.
  useEffect(() => {
    if (open !== null) closeRef.current?.focus({ preventScroll: true });
    else if (openerRef.current !== null) {
      stripRefs.current[openerRef.current]?.focus({ preventScroll: true });
      openerRef.current = null;
    }
  }, [open === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard, only while an award is open
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : Math.max(0, o - 1)));
      else if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : Math.min(last, o + 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open === null, last]); // eslint-disable-line react-hooks/exhaustive-deps

  const a = open === null ? null : AWARD_TIMELINE[open];
  const view = (active: boolean) =>
    `transition-[opacity,scale] duration-500 ${EASE} motion-reduce:transition-none ${
      active ? "relative opacity-100 scale-100" : "pointer-events-none absolute inset-0 opacity-0 scale-[0.96]"
    }`;

  const thumb = (i: number) => {
    const t = AWARD_TIMELINE[i];
    return (
      <button
        key={i}
        type="button"
        onClick={() => setOpen(i)}
        aria-label={`View ${t.title}, ${t.years}`}
        className="group shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
      >
        <AwardFrame a={t} className="block h-20 w-16 group-hover:ring-(--primary) md:h-24 md:w-20" />
      </button>
    );
  };
  const before = open === null ? [] : Array.from({ length: Math.min(3, open) }, (_, k) => open - Math.min(3, open) + k);
  const after = open === null ? [] : Array.from({ length: Math.min(3, last - open) }, (_, k) => open + 1 + k);

  const roundBtn =
    "grid size-10 place-items-center rounded-full border border-(--hair) bg-white text-(--primary) transition-colors duration-300 hover:border-(--primary) hover:bg-(--primary) hover:text-white disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) motion-reduce:transition-none";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl px-4 py-8 transition-colors duration-700 motion-reduce:transition-none md:px-8 md:py-12 ${className}`}
      style={{ backgroundColor: a ? a.tint : "transparent" }}
    >
      {/* ── Strip ── */}
      <div inert={open !== null} className={view(open === null)}>
        <div className="flex snap-x items-center justify-start gap-4 overflow-x-auto pb-4 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] md:gap-6">
          {AWARD_TIMELINE.map((t, i) => (
            <button
              key={`${t.years}-${t.title}-${i}`}
              ref={(el) => {
                stripRefs.current[i] = el;
              }}
              type="button"
              onClick={() => {
                openerRef.current = i;
                setOpen(i);
              }}
              aria-label={`View ${t.title}, ${t.years}`}
              className="group shrink-0 snap-center py-2 first:ml-6 last:mr-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--primary)"
            >
              <AwardFrame
                a={t}
                className={`block group-hover:-translate-y-1 group-hover:ring-(--primary) motion-reduce:group-hover:translate-y-0 ${
                  i % 2 === 0 ? "h-52 w-40 md:h-64 md:w-48" : "h-40 w-32 md:h-48 md:w-36"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-4 font-['Fira_Sans_Condensed'] text-4xl font-light text-(--primary) md:text-5xl">
          {firstYear(AWARD_TIMELINE[0])}
          <span aria-hidden="true" className="h-px w-16 bg-(--hair)" />
          {lastYear(AWARD_TIMELINE[last])}
        </p>
        <p className="mt-2 text-center text-[10px] tracking-[0.2em] text-(--mute)">SELECT AN AWARD</p>
      </div>

      {/* ── Open award ── */}
      <div inert={open === null} className={view(open !== null)}>
        {a && open !== null && (
          <>
            <button ref={closeRef} type="button" onClick={() => setOpen(null)} aria-label="Close award" className={`${roundBtn} absolute right-0 top-0 z-10`}>
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>

            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
              <div className="hidden flex-col items-end gap-3 md:flex">{before.map(thumb)}</div>

              {/* Featured: re-keyed so the entrance plays for each award */}
              <div key={open} className={`flex flex-col items-center animate-[awardIn_500ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none`}>
                <div className="relative w-full max-w-[320px] md:w-[345px] md:max-w-[360px]">
                  <AwardFrame
                    a={a}
                    featured
                    className="flex aspect-[3/4] w-full shadow-[0_20px_50px_rgba(17,20,24,0.18)] md:h-[460px]"
                  />
                  {/* Vertical captions on the frame edges */}
                  <span className="absolute -left-6 top-0 hidden max-h-full truncate rotate-180 text-[10px] uppercase tracking-[0.18em] text-(--mute) [writing-mode:vertical-rl] sm:block">
                    {a.title}
                  </span>
                  <span className="absolute -right-6 bottom-0 hidden max-h-full truncate rotate-180 text-[10px] uppercase tracking-[0.18em] text-(--mute) [writing-mode:vertical-rl] sm:block">
                    {a.by ? `Issued by ${a.by}` : a.years}
                  </span>
                  {/* Huge year, overlapping the frame's right edge */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-1/2 translate-x-[75%] -translate-y-1/2 font-['Fira_Sans_Condensed'] text-[72px] font-light leading-none text-(--primary)/85 mix-blend-multiply animate-[awardIn_500ms_cubic-bezier(.22,1,.36,1)_100ms_both] motion-reduce:animate-none md:text-[150px]"
                    style={{ "--award-from": "translateX(24px)" } as CSSProperties}
                  >
                    {firstYear(a)}
                  </span>
                </div>

                {/* Caption */}
                <div className="mt-8 max-w-[52ch] text-center">
                  <p className="text-xs font-semibold tracking-[0.18em] text-(--accent)">{a.years}</p>
                  <h3 className="mt-2 font-['Fira_Sans_Condensed'] text-2xl font-bold text-(--ink)">{a.title}</h3>
                  {a.text && <p className="mt-3 text-pretty text-(--mute)">{a.text}</p>}
                  {a.by && <p className="mt-2 text-sm text-(--accent)">Issued by {a.by}</p>}
                  <div className="mt-6 flex justify-center gap-3">
                    <button type="button" onClick={() => setOpen(open - 1)} disabled={open === 0} aria-label="Previous award" className={`group ${roundBtn}`}>
                      <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none" />
                    </button>
                    <button type="button" onClick={() => setOpen(open + 1)} disabled={open === last} aria-label="Next award" className={`group ${roundBtn}`}>
                      <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden flex-col items-start gap-3 md:flex">{after.map(thumb)}</div>

              {/* Phones: neighbours as one scrollable row */}
              <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">{[...before, ...after].map(thumb)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
