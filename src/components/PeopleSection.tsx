import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, PointerEvent } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import CountUp from "./CountUp";
import { F, PEOPLE_PROGRAMS } from "../data/facts";

const media = "/media/";
const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";
const LABEL = "text-[11px] uppercase tracking-widest text-(--mute)";
// Where the index gets the floating preview: wide screens with a real pointer
const DESK = "(min-width: 64rem) and (hover: hover)";
/* With the card up, the title and summary stop short of it: the card is 300px
   wide at right-6, so they keep to the list width less 300 + 24 + 80 (the
   index column, its gap and the 8px slide). */
const CLEAR_CARD = "max-w-[calc(100cqw-404px)]";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n: number) => String(n).padStart(2, "0");

const schools = PEOPLE_PROGRAMS.find((p) => p.id === "schools");
const GLANCE = [
  { value: F.employeesText, label: "People across the group" },
  ...(schools ? [{ value: String(schools.points.length), label: "Schools founded" }] : []),
  { value: String(PEOPLE_PROGRAMS.length), label: "Programmes" },
  { value: F.factories, label: "Factories" },
];

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/* ── PEOPLE ──
   A full-width header, then two columns: "At a glance" on the left (four
   figures and a coverage strip mirroring the index), the programme index on
   the right. Pointing at a row (after a short hover intent), focusing it or
   tapping it makes it active; it stays active until another is chosen.
   On wide pointer screens a floating card follows the pointer down the index
   with the active programme's photo and details; everywhere else the rows are
   a one-at-a-time accordion. */
export default function PeopleSection() {
  const [activeId, setActiveId] = useState(PEOPLE_PROGRAMS[0].id);
  const activeIndex = Math.max(0, PEOPLE_PROGRAMS.findIndex((p) => p.id === activeId));
  const active = PEOPLE_PROGRAMS[activeIndex];
  const isDesk = useMedia(DESK);

  const [pointerIn, setPointerIn] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const shown = isDesk && (pointerIn || focusIn);

  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const hoverTimer = useRef<number | undefined>(undefined);
  const shownRef = useRef(false);
  // The card's eased position and tilt; one rAF loop runs only until it settles
  const motion = useRef({ y: 0, target: 0, tilt: 0, frame: 0 });

  const cancelHover = () => window.clearTimeout(hoverTimer.current);
  useEffect(
    () => () => {
      cancelHover();
      cancelAnimationFrame(motion.current.frame);
    },
    [],
  );

  const paint = () => {
    const m = motion.current;
    if (cardRef.current) cardRef.current.style.transform = `translate3d(0, ${m.y}px, 0) rotate(${m.tilt}deg)`;
  };

  const step = () => {
    const m = motion.current;
    const before = m.y;
    m.y += (m.target - m.y) * 0.14;
    // Tilt with the vertical speed, ±2° at most, easing back to level
    const tiltTo = Math.max(-2, Math.min(2, (m.y - before) * 0.15));
    m.tilt += (tiltTo - m.tilt) * 0.14;
    if (Math.abs(m.target - m.y) < 0.25 && Math.abs(m.tilt) < 0.01) {
      m.y = m.target;
      m.tilt = 0;
      m.frame = 0;
      paint();
      return;
    }
    paint();
    m.frame = requestAnimationFrame(step);
  };

  /* Sends the card's top to y (relative to the list), kept inside the
     section: it may hang into the section's bottom padding, never past it. */
  const moveTo = (y: number, snap = false) => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const section = sectionRef.current;
    if (!wrap || !card || !section) return;
    const room = section.getBoundingClientRect().bottom - wrap.getBoundingClientRect().top - 24;
    const max = Math.max(0, Math.min(room, wrap.offsetHeight + 64) - card.offsetHeight);
    const m = motion.current;
    m.target = Math.min(Math.max(y, 0), max);
    if (snap || reducedMotion()) {
      cancelAnimationFrame(m.frame);
      m.frame = 0;
      m.y = m.target;
      m.tilt = 0;
      paint();
    } else if (!m.frame) {
      m.frame = requestAnimationFrame(step);
    }
  };

  const followPointer = (clientY: number, snap: boolean) => {
    if (reducedMotion() || !wrapRef.current || !cardRef.current) return;
    const top = wrapRef.current.getBoundingClientRect().top;
    moveTo(clientY - top - cardRef.current.offsetHeight / 2, snap);
  };

  /* Without a moving pointer (keyboard, reduced motion, or after a click
     leaves focus behind), the card sits beside the active row. */
  useLayoutEffect(() => {
    const was = shownRef.current;
    shownRef.current = shown;
    if (!shown) return;
    if (!pointerIn || reducedMotion()) {
      const row = rowRefs.current.get(activeId);
      if (row) moveTo(row.offsetTop, !was);
    } else {
      // The card's height follows its content: keep it inside its bounds
      moveTo(motion.current.target);
    }
  }, [shown, activeId, pointerIn]);

  const onListEnter = (e: PointerEvent) => {
    if (!isDesk || e.pointerType !== "mouse") return;
    followPointer(e.clientY, !shownRef.current);
    setPointerIn(true);
  };
  const onListMove = (e: PointerEvent) => {
    if (isDesk && e.pointerType === "mouse") followPointer(e.clientY, false);
  };
  const onListLeave = () => {
    cancelHover();
    setPointerIn(false);
  };
  // Only keyboard focus keeps the card up; a click's focus does not
  const onListFocus = (e: FocusEvent) => setFocusIn((e.target as HTMLElement).matches(":focus-visible"));
  const onListBlur = (e: FocusEvent) => {
    if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setFocusIn(false);
  };

  const onRowEnter = (id: string) => (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelHover();
    hoverTimer.current = window.setTimeout(() => setActiveId(id), 100);
  };

  return (
    <section ref={sectionRef} id="people" className="bg-(--mist) section-y">
      <div className="wrap">
        <SectionHeader
          eyebrow="PEOPLE"
          title={
            <>
              <CountUp text={F.employeesText} className="inline-block min-w-[6.5ch] tabular-nums" />
              <span className="text-(--navy)">people.</span>
              <sup className="text-(--navy)">*</sup>
            </>
          }
        >
          <p>
            Our people are the driving force behind our success. We invest in their growth, their families’ futures, and a better, healthier environment for all.
          </p>
        </SectionHeader>

        <div className="mt-section-head grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ── At a glance ── */}
          <aside aria-label="At a glance" className="lg:col-span-4">
            <div data-reveal-stagger className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <p className={LABEL}>AT A GLANCE</p>

              <dl className="m-0 mt-4 grid grid-cols-2 border-b border-(--hair) lg:grid-cols-1">
                {GLANCE.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex flex-col gap-2 border-t border-(--hair) py-4 pr-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 lg:pr-0"
                  >
                    <dt className="order-last text-xs uppercase leading-snug tracking-widest text-(--mute) sm:max-w-[18ch] sm:text-right">
                      {stat.label}
                    </dt>
                    <dd className="m-0">
                      <CountUp
                        text={stat.value}
                        delay={i * 120}
                        className="font-['Fira_Sans_Condensed'] text-[40px] font-semibold leading-none tabular-nums text-(--heading)"
                      />
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Coverage: one segment per programme, the active one filled. It
                  mirrors the index, so assistive tech gets it there instead. */}
              <div aria-hidden="true" className="mt-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className={LABEL}>COVERAGE</span>
                  <span
                    key={active.id}
                    className="text-[11px] uppercase tracking-widest tabular-nums text-(--navy) animate-[awardIn_400ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none"
                  >
                    {pad(activeIndex + 1)} · {active.tag}
                  </span>
                </div>
                <div className="relative mt-1 grid grid-cols-5 gap-1">
                  {PEOPLE_PROGRAMS.map((item, i) => (
                    <span key={item.id} className="group/seg relative py-2.5">
                      <span className="block h-1.5 rounded-xs bg-(--hair)" />
                      <span
                        className={`pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded-sm border border-(--hair) bg-white px-2 py-1 text-[11px] uppercase tracking-widest text-(--mute) opacity-0 transition-opacity duration-200 group-hover/seg:opacity-100 motion-reduce:transition-none ${
                          i === 0 ? "left-0" : i === PEOPLE_PROGRAMS.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"
                        }`}
                      >
                        {item.tag}
                      </span>
                    </span>
                  ))}
                  {/* The fill slides from segment to segment */}
                  <span
                    className={`pointer-events-none absolute left-0 top-2.5 h-1.5 w-[calc((100%-1rem)/5)] rounded-xs bg-(--navy) transition-transform duration-400 ${EASE} motion-reduce:transition-none`}
                    style={{ transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))` }}
                  />
                </div>
              </div>

              <Link
                to="/#careers"
                className="group/cta relative mt-8 inline-flex min-h-12 items-center overflow-hidden rounded-xs border border-(--ink) px-8 text-xs font-semibold tracking-widest transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none"
              >
                {/* The fill sweeps in from the left instead of switching colour */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 origin-left scale-x-0 bg-(--ink) transition-transform duration-400 ${EASE} group-hover/cta:scale-x-100 group-focus-visible/cta:scale-x-100 motion-reduce:transition-none`}
                />
                <span className="relative">WORK WITH US</span>
              </Link>
            </div>
          </aside>

          {/* ── Programme index ── */}
          <div className="lg:col-span-8">
            <div
              ref={wrapRef}
              className="@container relative"
              onPointerEnter={onListEnter}
              onPointerMove={onListMove}
              onPointerLeave={onListLeave}
              onFocus={onListFocus}
              onBlur={onListBlur}
            >
              <ul data-reveal-stagger className="group/list m-0 list-none border-t border-(--hair) p-0">
                {PEOPLE_PROGRAMS.map((item, i) => {
                  const isActive = item.id === activeId;
                  const buttonId = `people-row-${item.id}`;
                  const panelId = `people-panel-${item.id}`;
                  return (
                    <li
                      key={item.id}
                      ref={(el) => {
                        if (el) rowRefs.current.set(item.id, el);
                        else rowRefs.current.delete(item.id);
                      }}
                      data-active={isActive || undefined}
                      className={`group/row border-b border-(--hair) transition-opacity duration-300 ${EASE} motion-reduce:transition-none lg:group-hover/list:not-data-active:opacity-60`}
                    >
                      <button
                        id={buttonId}
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        onFocus={() => isDesk && setActiveId(item.id)}
                        onPointerEnter={onRowEnter(item.id)}
                        onPointerLeave={cancelHover}
                        {...(isDesk ? {} : { "aria-expanded": isActive, "aria-controls": panelId })}
                        className="grid min-h-20 w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--navy) lg:py-6"
                      >
                        <span
                          className={`text-xs tabular-nums text-(--mute) transition-colors duration-300 ${EASE} group-data-active/row:text-(--navy) motion-reduce:transition-none`}
                        >
                          {pad(i + 1)}
                        </span>
                        <span className={`min-w-0 ${isDesk ? CLEAR_CARD : ""}`}>
                          <span
                            className={`relative inline-block max-w-full font-['Fira_Sans_Condensed'] text-2xl font-semibold leading-none text-(--heading) transition-transform duration-450 ${EASE} group-data-active/row:translate-x-2 motion-reduce:transition-none md:text-[32px]`}
                          >
                            {item.title}
                            {/* Navy underline, drawn left to right under the active title */}
                            <span
                              aria-hidden="true"
                              className={`absolute inset-x-0 -bottom-2 h-0.5 origin-left scale-x-0 bg-(--navy) transition-transform duration-450 ${EASE} group-data-active/row:scale-x-100 motion-reduce:transition-none`}
                            />
                          </span>
                          {isDesk && <span className="mt-4 block truncate text-sm text-(--mute)">{item.summary}</span>}
                        </span>
                        <span
                          className={`hidden rounded-xs border border-(--hair) px-2 py-1 text-[11px] uppercase tracking-widest text-(--mute) transition-colors duration-300 ${EASE} group-data-active/row:border-(--navy)/40 group-data-active/row:text-(--navy) motion-reduce:transition-none sm:inline-block`}
                        >
                          {item.tag}
                        </span>
                      </button>

                      {isDesk ? (
                        // The floating card is hidden from assistive tech; the same details live here
                        <div id={panelId} role="region" aria-labelledby={buttonId} className="sr-only">
                          <p>{item.summary}</p>
                          <PointList points={item.points} />
                        </div>
                      ) : (
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          data-open={isActive || undefined}
                          inert={!isActive}
                          className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ${EASE} data-open:grid-rows-[1fr] motion-reduce:transition-none`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <div className="flex flex-col gap-3 pb-6 sm:pl-16">
                              <img
                                src={`${media}${item.image}`}
                                alt={item.imageAlt}
                                loading="lazy"
                                decoding="async"
                                className="aspect-video w-full rounded-sm object-cover md:max-h-72"
                              />
                              <p className="text-sm leading-relaxed text-(--mute)">{item.summary}</p>
                              <PointList points={item.points} columns />
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* ── Floating preview, wide pointer screens only ──
                  The outer box carries the eased position and tilt (set by the
                  rAF loop), the inner one the show and hide. */}
              {isDesk && (
                <div
                  ref={cardRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-6 top-0 z-10 w-[300px] will-change-transform"
                >
                  <div
                    data-shown={shown || undefined}
                    className={`scale-96 opacity-0 transition-[opacity,scale] duration-300 ${EASE} data-shown:scale-100 data-shown:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none`}
                  >
                    <div className="overflow-hidden rounded-sm border border-(--hair) bg-white shadow-[0_24px_48px_-24px_rgba(17,20,24,0.35)]">
                      <div className="relative aspect-4/3 overflow-hidden">
                        {PEOPLE_PROGRAMS.map((item, i) => (
                          <img
                            key={item.id}
                            src={`${media}${item.image}`}
                            alt=""
                            loading={i === 0 ? "eager" : "lazy"}
                            decoding="async"
                            className={`absolute inset-0 size-full object-cover transition-[opacity,scale] duration-500 ${EASE} motion-reduce:transition-none ${
                              item.id === activeId ? "scale-100 opacity-100" : "scale-105 opacity-0"
                            }`}
                          />
                        ))}
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-(--navy)" />
                      </div>
                      <div
                        key={active.id}
                        className="p-4 animate-[awardIn_400ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none"
                      >
                        <p className="font-['Fira_Sans_Condensed'] text-lg font-semibold leading-tight text-(--heading)">
                          {active.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-(--mute)">{active.summary}</p>
                        <PointList points={active.points.slice(0, 4)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PointList({ points, columns = false }: { points: readonly string[]; columns?: boolean }) {
  return (
    <ul className={`m-0 mt-3 grid list-none gap-1.5 p-0 ${columns && points.length > 3 ? "sm:grid-cols-2" : ""}`}>
      {points.map((point) => (
        <li key={point} className="flex gap-2.5 text-sm text-(--ink)/85">
          <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-(--navy)" />
          {point}
        </li>
      ))}
    </ul>
  );
}
