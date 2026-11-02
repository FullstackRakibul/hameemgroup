import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import CountUp from "./CountUp";
import { F, PEOPLE_PROGRAMS } from "../data/facts";

const media = "/media/";
const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";

// True from lg up, where the photo panel shows the details beside the list
function useIsLg() {
  const [isLg, setIsLg] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 64rem)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = () => setIsLg(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isLg;
}

/* ── PEOPLE ──
   A full-width header, then two columns: from lg a sticky photo with the active
   programme's details on the left and the programme list on the right. Pointing
   at a row (after a short hover intent), focusing it or tapping it makes it
   active; it stays active until another is chosen, so the list never shifts.
   Below lg only the list shows, as a one-at-a-time accordion. */
export default function PeopleSection() {
  const [activeId, setActiveId] = useState(PEOPLE_PROGRAMS[0].id);
  const active = PEOPLE_PROGRAMS.find((p) => p.id === activeId) ?? PEOPLE_PROGRAMS[0];
  const isLg = useIsLg();
  const hoverTimer = useRef<number | undefined>(undefined);

  const cancelHover = () => window.clearTimeout(hoverTimer.current);
  useEffect(() => cancelHover, []);

  const onPointerEnter = (id: string) => (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelHover();
    hoverTimer.current = window.setTimeout(() => setActiveId(id), 120);
  };

  return (
    <section id="people" className="relative isolate overflow-hidden bg-(--mist) section-y">
      {/* The faint giant word, drifting as the section passes. Desktop only: on a
          phone it would add height for nothing. */}
      {/* <span
        aria-hidden="true"
        className="people-drift pointer-events-none absolute -top-6 left-gutter hidden select-none font-['Fira_Sans_Condensed'] text-[200px] font-black leading-none text-(--ink)/3 lg:block"
      >
        PEOPLE
      </span> */}

      <div className="wrap relative">
        <SectionHeader
          eyebrow="PEOPLE"
          title={
            <>
              <CountUp text={F.employeesText} className="inline-block min-w-[6.5ch] tabular-nums" />
              
              <span className="text-(--red)">people.</span>
              <sup className="text-(--navy)">*</sup>
            </>
          }
        >
          <p>
            Our people are the driving force behind our success. We invest in their growth, their families’ futures, and a better, healthier environment for all.
          </p>
        </SectionHeader>

        <div className="mt-section-head grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
          {/* ── Sticky photo and details, lg and up ──
              Every image is stacked; the active programme's is the one shown. */}
          <figure className="group relative m-0 hidden aspect-4/5 max-h-[calc(100vh-var(--header-h)-48px)] overflow-hidden rounded-sm bg-(--ink) lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:block">
            {PEOPLE_PROGRAMS.map((item, i) => (
              <img
                key={item.id}
                src={`${media}${item.image}`}
                alt={item.id === activeId ? item.imageAlt : ""}
                aria-hidden={item.id === activeId ? undefined : "true"}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`absolute inset-0 size-full object-cover transition-[opacity,scale] ease-out duration-[700ms,1200ms] motion-reduce:transition-none ${
                  item.id === activeId ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              />
            ))}

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-(--ink)/40 to-transparent"
            />

            {/* Stitched seam, sewn round the photo on hover; always shown on touch screens */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-6 h-[calc(100%-48px)] w-[calc(100%-48px)] overflow-visible"
            >
              <defs>
                <mask id="people-stitch" maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
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
                    className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-700 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-1200 motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0] [@media(hover:none)]:transition-none"
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
                mask="url(#people-stitch)"
              />
            </svg>

            {/* The active programme's details, re-animating on every change */}
            <div id="people-details" aria-live="polite">
              <div
                key={activeId}
                className="absolute inset-x-5 bottom-5 rounded-xs bg-white/92 p-5 backdrop-blur-sm animate-[awardIn_450ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none"
              >
                <h3 className="m-0 font-['Fira_Sans_Condensed'] text-xl font-bold leading-tight text-(--ink)">
                  {active.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-(--mute)">{active.summary}</p>
                <PointList points={active.points} />
              </div>
            </div>
          </figure>

          {/* ── Programme list ── */}
          <div>
            <ul data-reveal-stagger className="m-0 list-none p-0" onPointerLeave={cancelHover}>
              {PEOPLE_PROGRAMS.map((item, i) => {
                const isActive = item.id === activeId;
                const panelId = `people-panel-${item.id}`;
                return (
                  <li
                    key={item.id}
                    data-active={isActive || undefined}
                    className={`group/row relative border-b border-(--hair) transition-colors duration-300 ${EASE} first:border-t data-active:bg-(--ink)/[0.05] motion-reduce:transition-none`}
                  >
                    {/* Navy rule on the left edge, growing in when the row is active */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-(--navy) transition-transform duration-300 ${EASE} group-data-active/row:scale-y-100 motion-reduce:transition-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      onFocus={() => setActiveId(item.id)}
                      onPointerEnter={onPointerEnter(item.id)}
                      onPointerLeave={cancelHover}
                      {...(isLg
                        ? { "aria-pressed": isActive, "aria-controls": "people-details" }
                        : { "aria-expanded": isActive, "aria-controls": panelId })}
                      className={`flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left transition-[padding] duration-300 ${EASE} group-data-active/row:pl-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--navy) motion-reduce:transition-none`}
                    >
                      <span className="shrink-0 text-[11px] tabular-nums text-(--mute)">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block font-['Fira_Sans_Condensed'] text-lg font-bold leading-tight text-(--ink) transition-colors duration-300 ${EASE} group-data-active/row:text-(--navy) motion-reduce:transition-none md:text-xl`}
                        >
                          {item.title}
                        </span>
                        <span className="mt-0.5 hidden truncate text-sm text-(--mute) lg:block">{item.summary}</span>
                      </span>
                    </button>

                    {/* Inline details below lg; the photo panel carries them from lg */}
                    <div
                      id={panelId}
                      role="region"
                      aria-label={item.title}
                      data-open={isActive || undefined}
                      inert={!isActive}
                      className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ${EASE} data-open:grid-rows-[1fr] motion-reduce:transition-none lg:hidden`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="flex flex-col gap-3 px-4 pb-5 pl-6">
                          <img
                            src={`${media}${item.image}`}
                            alt={item.imageAlt}
                            loading="lazy"
                            decoding="async"
                            className="aspect-video w-full rounded-sm object-cover md:max-h-64"
                          />
                          <p className="text-sm leading-relaxed text-(--mute)">{item.summary}</p>
                          <PointList points={item.points} />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              to="/#careers"
              data-reveal
              className="group/cta relative mt-cta inline-flex min-h-12 items-center overflow-hidden rounded-xs border border-(--ink) px-8 text-xs font-semibold tracking-widest transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none"
            >
              {/* The fill sweeps in from the left instead of switching colour */}
              <span
                aria-hidden="true"
                className={`absolute inset-0 origin-left scale-x-0 bg-(--ink) transition-transform duration-400 ${EASE} group-hover/cta:scale-x-100 group-focus-visible/cta:scale-x-100 motion-reduce:transition-none`}
              />
              <span className="relative">WORK WITH US</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PointList({ points }: { points: readonly string[] }) {
  return (
    <ul className={`m-0 mt-3 grid list-none gap-1.5 p-0 ${points.length > 3 ? "sm:grid-cols-2" : ""}`}>
      {points.map((point) => (
        <li key={point} className="flex gap-2.5 text-sm text-(--ink)/85">
          <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-(--navy)" />
          {point}
        </li>
      ))}
    </ul>
  );
}
