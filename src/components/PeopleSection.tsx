import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Handshake, Leaf, Plus, School, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Eyebrow from "./Eyebrow";
import CountUp from "./CountUp";
import { F, PEOPLE_PROGRAMS } from "../data/facts";

const media = "/media/";

/* One icon per programme, keyed by its id, so the data file stays free of components */
const PROGRAM_ICON: Record<string, LucideIcon> = {
  schools: School,
  scholarships: GraduationCap,
  "higher-ed": Sparkles,
  careers: Handshake,
  environment: Leaf,
};

/* ── PEOPLE ──
   A vertical accordion in the Sustainability cards' idiom, one card open at a
   time. On a phone the open card carries its own photo; from lg a sticky panel
   beside the list cross-fades to whichever card is pointed at, or the open one
   when nothing is. Colour is ink, white and navy only. */
export default function PeopleSection() {
  const [openId, setOpenId] = useState(PEOPLE_PROGRAMS[0].id);
  // Pointing at a card previews its photo in the panel without opening it, so
  // the list never shifts under the cursor. Touch and keyboard fall back to the
  // open card, which a tap or Enter sets.
  const [hoverId, setHoverId] = useState<string | null>(null);
  const shownId = hoverId ?? openId;
  const shown = PEOPLE_PROGRAMS.find((p) => p.id === shownId) ?? PEOPLE_PROGRAMS[0];

  return (
    <section id="people" className="relative isolate overflow-hidden bg-(--mist) section-y">
      {/* The faint giant word, drifting as the section passes. Desktop only: on a
          phone it would add height for nothing. */}
      <span
        aria-hidden="true"
        className="people-drift pointer-events-none absolute -top-6 left-gutter hidden select-none font-['Fira_Sans_Condensed'] text-[200px] font-black leading-none text-(--ink)/3 lg:block"
      >
        PEOPLE
      </span>

      <div className="wrap relative grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ── Text and accordion ── */}
        <div>
          <div data-reveal>
            <Eyebrow>PEOPLE</Eyebrow>
            <h2 className="mt-head-eyebrow text-balance font-['Fira_Sans_Condensed'] text-h2 font-black">
              <CountUp text={F.employeesText} className="inline-block min-w-[6.5ch] tabular-nums" />
              <br />
              <span className="text-(--red)">people.</span>
              <sup className="text-(--navy)">*</sup>
            </h2>
            <p className="mt-head-intro max-w-[52ch] text-pretty text-intro text-(--mute)">
              Our people are the engine of a vertically integrated group. We invest in them and their families through
              schools, scholarships, higher education and a cleaner place to work and live.
            </p>
          </div>

          <ul data-reveal-stagger className="mt-section-head flex list-none flex-col gap-2.5 p-0">
            {PEOPLE_PROGRAMS.map((item, i) => {
              const Icon = PROGRAM_ICON[item.id] ?? Sparkles;
              const isOpen = item.id === openId;
              const panelId = `people-panel-${item.id}`;
              const headerId = `people-header-${item.id}`;
              return (
                <li key={item.id}>
                  <div
                    data-open={isOpen || undefined}
                    className="people-card relative overflow-hidden rounded-sm border transition-[background-color,color,box-shadow] duration-400 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
                  >
                    {/* A soft navy glow, bottom-right; stronger while open */}
                    <span
                      aria-hidden="true"
                      className="people-glow pointer-events-none absolute -bottom-16 -right-16 size-56 rounded-full bg-[radial-gradient(var(--navy),transparent_70%)] blur-2xl transition-opacity duration-400 motion-reduce:transition-none"
                    />
                    {/* Watermark icon; it turns slowly while the card is open */}
                    <Icon
                      size={96}
                      strokeWidth={1}
                      aria-hidden="true"
                      className="people-watermark pointer-events-none absolute -bottom-5 -right-4 transition-colors duration-400 motion-reduce:animate-none motion-reduce:transition-none"
                    />

                    <h3 className="relative m-0">
                      <button
                        type="button"
                        id={headerId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? "" : item.id)}
                        onMouseEnter={() => setHoverId(item.id)}
                        onMouseLeave={() => setHoverId((id) => (id === item.id ? null : id))}
                        onFocus={() => setHoverId(item.id)}
                        onBlur={() => setHoverId((id) => (id === item.id ? null : id))}
                        className="flex min-h-14 w-full items-center gap-3 p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) md:gap-4 md:p-5"
                      >
                        <span className="people-index shrink-0 text-[11px] tabular-nums text-(--mute) transition-colors duration-400 motion-reduce:transition-none">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="people-chip grid size-10 shrink-0 place-items-center rounded-xs bg-(--mist) transition-colors duration-400 motion-reduce:transition-none">
                          <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="people-chip-icon" />
                        </span>
                        <span className="people-title min-w-0 flex-1 font-['Fira_Sans_Condensed'] text-lg font-bold leading-tight transition-colors duration-400 motion-reduce:transition-none md:text-xl">
                          {item.title}
                        </span>
                        <Plus
                          size={18}
                          strokeWidth={1.75}
                          aria-hidden="true"
                          className="people-plus shrink-0 transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
                        />
                      </button>
                    </h3>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      data-open={isOpen || undefined}
                      inert={!isOpen}
                      className="relative grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)] data-open:grid-rows-[1fr] motion-reduce:transition-none"
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="people-details flex flex-col gap-3 px-4 pb-5 transition-[opacity,translate] delay-150 duration-400 motion-reduce:transition-none md:px-5">
                          {/* On a phone the card carries its own photo; the sticky panel does it from lg */}
                          <img
                            src={`${media}${item.image}`}
                            alt={item.imageAlt}
                            loading="lazy"
                            decoding="async"
                            className="aspect-video w-full rounded-sm object-cover md:max-h-64 lg:hidden"
                          />
                          <p className="text-sm leading-relaxed text-white/85">{item.summary}</p>
                          <ul
                            className={`m-0 grid list-none gap-1.5 p-0 ${
                              item.points.length > 3 ? "sm:grid-cols-2" : ""
                            }`}
                          >
                            {item.points.map((point) => (
                              <li key={point} className="flex gap-2.5 text-sm text-white/75">
                                <span
                                  aria-hidden="true"
                                  className="people-dot mt-[0.45em] size-1.5 shrink-0 rounded-full"
                                />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
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
            className="group/cta relative mt-cta inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-xs border border-(--ink) px-8 text-xs font-semibold tracking-widest transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none"
          >
            {/* The fill sweeps in from the left instead of switching colour */}
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-left scale-x-0 bg-(--ink) transition-transform duration-400 ease-[cubic-bezier(.22,1,.36,1)] group-hover/cta:scale-x-100 group-focus-visible/cta:scale-x-100 motion-reduce:transition-none"
            />
            <span className="relative">WORK WITH US</span>
            <ArrowRight
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
              className="relative transition-transform duration-300 group-hover/cta:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>

        {/* ── Sticky photo panel, lg and up ──
            Every image is stacked here; the pointed-at card's is the one shown,
            falling back to the open one. */}
        <figure
          className="group relative m-0 hidden aspect-4/5 max-h-[calc(100vh-var(--header-h)-48px)] overflow-hidden rounded-sm bg-(--ink) lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:block"
        >
          {PEOPLE_PROGRAMS.map((item, i) => (
            <img
              key={item.id}
              src={`${media}${item.image}`}
              alt={item.id === shownId ? item.imageAlt : ""}
              aria-hidden={item.id === shownId ? undefined : "true"}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className={`absolute inset-0 size-full object-cover transition-[opacity,scale] ease-out duration-[700ms,1200ms] motion-reduce:transition-none ${
                item.id === shownId ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}

          {/* Legible foot for the caption */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-(--ink)/70 to-transparent"
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

          {/* The open card's title and first point, re-animating on every change */}
          <figcaption key={shownId} className="absolute bottom-7 left-7 right-7 flex flex-col items-start gap-2">
            <span className="people-caption inline-block rounded-xs bg-(--ink)/70 px-4 py-2 font-['Fira_Sans_Condensed'] text-sm font-bold text-white backdrop-blur-sm">
              {shown.title}
            </span>
            <span className="people-caption people-caption-late text-xs leading-snug text-white/80">
              {shown.points[0]}
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
