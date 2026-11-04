import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, Building2, ChevronDown, ChevronLeft, ChevronRight, Droplets, Newspaper, Pause, Play, Recycle, Sun, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { markHeroReady } from "../lib/heroReady";
import WorldRoutes from "../WorldRoutes";
import Productcarousel from "../components/Productcarousel ";
import Eyebrow from "../components/Eyebrow";
import SectionHeader from "../components/SectionHeader";
import BuyerGrid from "../components/BuyerGrid";
import AwardShowcase from "../components/AwardShowcase";
import SmartLink from "../components/SmartLink";
import ContactCta from "../components/ContactCta";
import CompanySection from "../components/CompanySection";
import BusinessMosaic from "../components/BusinessMosaic";
import ChainSteps from "../components/ChainSteps";
import CountUp from "../components/CountUp";
import PeopleSection from "../components/PeopleSection";
import usePageMeta from "../components/usePageMeta";
import {
  F,
  SOCIAL_LINKS,
  SUSTAINABILITY_STATS,
  VIRTUAL_TOUR_URL,
  splitUnit,
} from "../data/facts";
import { NEWS, type NewsItem } from "../data/news";
import { GALLERY_VIDEO } from "../data/gallery";
import { VIDEOS, type VideoId } from "../data/videos";
import useLoopPlayback from "../components/useLoopPlayback";

const media = "/media/";

// Sustainability cards: icon, accent (the rule under the figure only) and loop per topic
const ECO_LOOK: Record<string, { Icon: LucideIcon; accent: string; loop: VideoId }> = {
  "Solar capacity": { Icon: Sun, accent: "#f5a524", loop: "solar" },
  "Water recycling": { Icon: Droplets, accent: "#4fb3d9", loop: "water" },
  "Power co-generation": { Icon: Zap, accent: "#f2c94c", loop: "fiber" },
  "Fiber recycled a day": { Icon: Recycle, accent: "#6fbf73", loop: "recycle" },
};


export const HOME_TITLE = "Ha-Meem Group | Leading Wholesale Clothing Manufacturer";
export const HOME_DESCRIPTION = `Ha-Meem Group is a leading wholesale clothing manufacturer in Bangladesh. Established in ${F.established}, we make denim fabrics and apparel, and employ ${F.employeesText} people.`;


/* ── Data ── */
const heroSlides = [
  { src: VIDEOS.looms.src, alt: "Long rows of looms weaving indigo denim" },
  { src: "https://api.hameemgroup.com:9012/Resources/hameemGroupWebsite/mainBannerImage00051.jpeg", alt: "Long rows of looms weaving indigo denim" },
  { src: "https://api.hameemgroup.com:9012/Resources/hameemGroupWebsite/mainBannerImage00052.jpeg", alt: "Rolls of indigo denim fabric" },
  { src: VIDEOS.laser.src, alt: "Ha-Meem Group manufacturing facility" },
  { src: "https://api.hameemgroup.com:9012/Resources/hameemGroupWebsite/mainBannerImage00053.jpeg", alt: "Sewing floor at Ha-Meem garment factory" },
  { src: "https://api.hameemgroup.com:9012/Resources/hameemGroupWebsite/mainBannerImage00054.jpeg", alt: "Ha-Meem Group manufacturing facility" },
];

/* The hero mixes photos and video. A slide's type comes from its extension, and
   each type holds for its own time: a photo reads in 6s, a video needs longer,
   so it gets 10s. One duration drives both the advance timer and the stitched
   progress line, so they stay in step whatever the slide is. */
const PHOTO_MS = 6000;
const VIDEO_MS = 10000;
const isVideo = (src: string) => /\.(mp4|webm|ogv|mov)(\?|$)/i.test(src);
const slideMs = (i: number) => (isVideo(heroSlides[i].src) ? VIDEO_MS : PHOTO_MS);



const products = [
  [
    "DENIM JEANS",
    "Hi-fashion denim with critical washes, laser finish and 3D whisker",
    "jeans.jpg",
  ],
  ["BOTTOMS & CARGOS", "", "bottoms.jpg"],
  ["SHIRTS & DRESS PANTS", "", "shirts.jpg"],
  ["OUTERWEAR & JACKETS", `${F.jacketsYear} jackets a year`, "showroom.jpg"],
  ["SWEATERS", "", "sweaters.jpg"],
  ["DENIM FABRIC", "", "fabric.jpg"],
];

/* ── Newsroom bento ── */

// Figure tiles: values straight from F, labels written for the newsroom
const NEWS_FIGURES: [string, string][] = [
  [F.solar, "Solar capacity"],
  [F.waterRecycling, "Water recycled"],
  [F.powerCogeneration, "Power co-generation"],
  [F.fiberRecyclingDay, "Fibre recycled a day"],
];

// lucide has no brand logos, so the social tiles carry the name in the brand colour
const SOCIAL_COLOR: Record<(typeof SOCIAL_LINKS)[number]["label"], string> = {
  YouTube: "#ff0000",
  LinkedIn: "#0a66c2",
  Facebook: "#1877f2",
};

// Every tile: a 4px card with a hairline border
const tileClass = "rounded-sm border border-(--hair)";
// Tiles that are links lift 2px and take a navy edge on hover or keyboard focus
const liftClass =
  "transition-[translate,border-color] duration-300 hover:-translate-y-0.5 hover:border-(--navy)/30 focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0";
// Story photos rest in grey and take their colour on hover; touch screens always see colour
const photoToneClass =
  "grayscale-[85%] transition-[filter] duration-700 group-hover:grayscale-0 group-focus-visible:grayscale-0 motion-reduce:transition-none [@media(hover:none)]:grayscale-0";

/** The title with its highlight phrase wrapped in a <mark>; the plain title if the phrase is missing.
    Each line's block would paint over the descenders of the line above, so the
    words sit in relative spans, which paint after every background. Short
    phrases ("12.2 MWp") stay on one line. */
function withHighlight(title: string, phrase: string | undefined, markClass: string) {
  const at = phrase ? title.indexOf(phrase) : -1;
  if (!phrase || at < 0) return title;
  return (
    <>
      <span className="relative">{title.slice(0, at)}</span>
      <mark className={`box-decoration-clone text-inherit ${phrase.length <= 16 ? "whitespace-nowrap" : ""} ${markClass}`}>
        <span className="relative">{phrase}</span>
      </mark>
      <span className="relative">{title.slice(at + phrase.length)}</span>
    </>
  );
}

/** Category and date (or date and category) in one small row */
function StoryMeta({ story, dateFirst = false }: { story: NewsItem; dateFirst?: boolean }) {
  const cat = <span className="text-(--navy)">{story.cat}</span>;
  const date = <span className="text-(--mute)">{story.date}</span>;
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest">
      {dateFirst ? date : cat}
      <span aria-hidden="true" className="mx-2 text-(--mute)">·</span>
      {dateFirst ? cat : date}
    </p>
  );
}

/** "Report: source ↗" when the story links out, a quiet note when it doesn't yet */
function StorySource({ story }: { story: NewsItem }) {
  if (!story.url) return <span className="text-[13px] text-(--mute)">Report link coming soon</span>;
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-(--mute) transition-colors duration-300 group-hover:text-(--ink) group-focus-visible:text-(--ink) motion-reduce:transition-none">
      Report: {story.source}
      <ArrowUpRight
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </span>
  );
}

/** A story tile: one link to the original report, or an article until a link exists */
function StoryTile({ story, className, children }: { story: NewsItem; className: string; children: ReactNode }) {
  if (!story.url) return <article className={`${tileClass} ${className}`}>{children}</article>;
  return (
    <a href={story.url} target="_blank" rel="noopener noreferrer" className={`${tileClass} ${liftClass} ${className}`}>
      {children}
      <span className="sr-only"> (opens the report on {story.source} in a new tab)</span>
    </a>
  );
}

// Built once, outside the component, so the carousel is not re-rendered on scroll.
const productSlides = products.map(([title, text, image]) => ({
  title,
  text,
  image: `${media}products/${image}`,
}));

export default function HomePage() {
  // The outgoing slide is kept as `prev`: it stays opaque underneath while the
  // new one fades in on top, so the cross-fade never dips to the dark backdrop.
  const [hero, setHero] = useState({ current: 0, prev: -1 });
  const heroSlide = hero.current;
  const [heroPaused, setHeroPaused] = useState(false);
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // The sustainability cards' loops: on screen only, two at most
  const ecoLoops = useLoopPlayback(2);
  const heroFirstImgRef = useRef<HTMLImageElement>(null);

  usePageMeta(HOME_TITLE, HOME_DESCRIPTION, true);

  const setHeroSlide = useCallback((next: number | ((cur: number) => number)) => {
    setHero((h) => {
      const n = typeof next === "function" ? next(h.current) : next;
      return n === h.current ? h : { current: n, prev: h.current };
    });
  }, []);

  // Hero slider auto-advance. The timer restarts on every slide change, so a
  // manual jump gets a full 6s and the stitched progress line stays in step.
  const advanceSlide = useCallback(() => {
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  }, [setHeroSlide]);

  // Off screen the hero holds still: no slide changes (which would re-render
  // the whole page while the visitor reads further down) and no video.
  const heroSectionRef = useRef<HTMLElement>(null);
  const [heroOffscreen, setHeroOffscreen] = useState(false);
  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const heroIdle = heroPaused || heroOffscreen;

  useEffect(() => {
    if (heroIdle) return;
    const timer = setTimeout(advanceSlide, slideMs(heroSlide));
    return () => clearTimeout(timer);
  }, [heroIdle, heroSlide, advanceSlide]);

  // A cached first slide can finish loading before React attaches onLoad, so
  // the event would never fire. Check the element directly on mount and
  // release the preloader if it is already painted.
  useEffect(() => {
    if (isVideo(heroSlides[0].src)) {
      const video = heroVideoRefs.current[0];
      // HAVE_CURRENT_DATA: at least the first frame is there
      if (video && video.readyState >= 2) markHeroReady();
    } else if (heroFirstImgRef.current?.complete) {
      markHeroReady();
    }
  }, []);

  // Video slides: the element plays only while it is the slide on show, and
  // restarts from the top each time, so a revisit is never a frozen last frame.
  // Autoplay needs muted (browsers block sound without a gesture), and the
  // pause button pauses the footage along with the slideshow.
  useEffect(() => {
    heroVideoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i !== heroSlide) {
        video.pause();
        return;
      }
      if (heroIdle) {
        video.pause();
        return;
      }
      if (video.currentTime > 0.1) video.currentTime = 0;
      void video.play().catch(() => {});
    });
  }, [heroSlide, heroIdle]);

  const prevSlide = () =>
    setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () =>
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  const togglePause = () => setHeroPaused((p) => !p);

  // One slide's stitch; the current one is sewn in red over the slide's 6s.
  const renderStitch = (i: number, maskId: string) => {
    const current = heroSlide === i;
    return (
      <svg
        // Remounted on each slide change or resume, which restarts the sewing
        key={current ? `${heroSlide}-${heroIdle}` : undefined}
        aria-hidden="true"
        width="22"
        height="4"
        className="overflow-visible"
      >
        <line
          x1="0"
          y1="2"
          x2="22"
          y2="2"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeDasharray="4 3"
          className="transition-[stroke-opacity] duration-300 group-hover/seg:[stroke-opacity:1]"
        />
        {current && (
          <>
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="-4" y="-4" width="30" height="12">
                <line
                  x1="0"
                  y1="2"
                  x2="22"
                  y2="2"
                  pathLength={1}
                  stroke="white"
                  strokeWidth="6"
                  // Inline, so it overrides the duration in the animate-[…]
                  // shorthand below: the sewing lasts as long as this slide holds
                  style={{ animationDuration: `${slideMs(i)}ms` }}
                  className={`[stroke-dasharray:1] ${heroPaused
                      ? "[stroke-dashoffset:0]"
                      : "[stroke-dashoffset:1] animate-[stitchDash_6s_linear_forwards] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
                    }`}
                />
              </mask>
            </defs>
            <line
              x1="0"
              y1="2"
              x2="22"
              y2="2"
              stroke="#ef7898"
              strokeWidth="2"
              strokeDasharray="4 3"
              mask={`url(#${maskId})`}
            />
          </>
        )}
      </svg>
    );
  };

  return (
    <>
      {/* ═══ HERO with KEN BURNS SLIDER ═══ */}
      {/* Full screen (svh, so mobile browser bars cannot cut it), and taller
          if the copy needs it: the copy sits in flow at the foot. */}
      <section
        ref={heroSectionRef}
        id="top"
        data-hero
        className="relative flex min-h-svh flex-col justify-end overflow-hidden text-white bg-(--ink) [--ring:#fff]"
      >
        {/* Isolated, so the slides' z-index stays under the shade layers */}
        <div className="absolute inset-0 isolate">
          {heroSlides.map((slide, i) => {
            const state = heroSlide === i ? "active" : hero.prev === i ? "prev" : "";
            // Both types fill the frame the same way (.hero-slide covers and
            // cross-fades); only video skips the Ken Burns drift, since the
            // footage already moves.
            // The first slide is what the preloader waits for, so it loads in
            // full; the rest stay at metadata until their turn comes round.
            const first = i === 0;
            return isVideo(slide.src) ? (
              <video
                key={slide.src + i}
                ref={(el) => {
                  heroVideoRefs.current[i] = el;
                }}
                className={`hero-slide is-video ${state}`}
                muted
                loop
                playsInline
                preload={first ? "auto" : "metadata"}
                aria-label={slide.alt}
                // Decorative: the headline carries the hero's meaning
                tabIndex={-1}
                // Enough buffered to paint; onError too, so a file that never
                // arrives releases the preloader instead of holding it.
                onLoadedData={first ? markHeroReady : undefined}
                onError={first ? markHeroReady : undefined}
              >
                <source src={slide.src} type="video/mp4" />
              </video>
            ) : (
              <img
                key={slide.src + i}
                ref={first ? heroFirstImgRef : undefined}
                src={slide.src}
                alt={slide.alt}
                loading={first ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={first ? "high" : undefined}
                className={`hero-slide ${state}`}
                onLoad={first ? markHeroReady : undefined}
                onError={first ? markHeroReady : undefined}
              />
            );
          })}
        </div>
        {/* Shade: light, so the photo carries the hero. A little at the top for
            the header's white links, a little more at the foot under the copy;
            on wide screens a faint scrim from the left. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-[rgba(5,12,17,0.45)] from-0% via-[rgba(5,12,17,0.05)] via-55% to-[rgba(5,12,17,0.25)] to-100%"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden md:block bg-linear-to-r from-[rgba(5,12,17,0.2)] via-transparent via-50% to-transparent"
        />
        {/* Denim: an indigo wash and a fine diagonal twill over the photo */}
        <div aria-hidden="true" className="absolute inset-0 bg-(--navy) opacity-12 mix-blend-multiply" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_5px)]"
        />

        {/* Copy and controls: left-aligned at the foot, on the page grid */}
        <div className="relative z-2 pt-[calc(var(--header-h)+24px)] pb-8 md:pb-10">
          <div className="wrap">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] md:text-xs">
              <svg aria-hidden="true" width="32" height="2" className="shrink-0 overflow-visible">
                <line x1="0" y1="1" x2="32" y2="1" stroke="#ef7898" strokeWidth="2" strokeDasharray="5 4" />
              </svg>
              Denim &amp; apparel since {F.established}
            </p>
            {/* Two lines that rise in from a clip mask, 80ms apart */}
            <h1
              tabIndex={-1}
              className="hero-headline mt-head-eyebrow max-w-[16ch] text-balance font-['Fira_Sans_Condensed'] text-hero tracking-[-0.035em] font-semibold text-left [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
            >
              <span className="hero-line">
                <span>Wholesale clothing</span>
              </span>{" "}
              <span className="hero-line [--line:1]">
                <span>manufacturer in Bangladesh.</span>
              </span>
            </h1>
            <p className="mt-head-intro max-w-md text-intro text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.35),0_2px_24px_rgba(0,0,0,0.35)]">
              From fibre to finish — Ha-Meem Group
            </p>

            {/* Slide progress and controls, under a stitched hairline */}
            <div className="mt-8 flex flex-col gap-4 border-t border-dashed border-white/30 pt-5 sm:flex-row sm:items-center sm:justify-between md:mt-12">
              <div className="flex items-center gap-4">
                <span className="w-14 shrink-0 font-['Fira_Sans_Condensed'] text-sm tabular-nums tracking-[0.08em] text-white/70">
                  <b className="font-semibold text-white">{String(heroSlide + 1).padStart(2, "0")}</b>
                  {" / "}
                  {String(heroSlides.length).padStart(2, "0")}
                </span>
                {/* One stitch per slide; the current one is sewn in red as it
                    plays. On phones the stitches only show progress (seven
                    44px buttons do not fit): the arrows choose the slide. */}
                <div className="flex items-center sm:hidden" aria-hidden="true">
                  {heroSlides.map((slide, i) => (
                    <span key={slide.src} className="flex h-8 items-center px-1">
                      {renderStitch(i, "hero-progress-sm")}
                    </span>
                  ))}
                </div>
                <div className="hidden items-center sm:flex" role="group" aria-label="Choose a slide">
                  {heroSlides.map((slide, i) => (
                    <button
                      key={slide.src}
                      type="button"
                      onClick={() => setHeroSlide(i)}
                      aria-label={`Show slide ${i + 1} of ${heroSlides.length}`}
                      aria-current={heroSlide === i || undefined}
                      className="group/seg flex h-11 items-center px-1 focus-visible:outline-2 focus-visible:outline-white"
                    >
                      {renderStitch(i, "hero-progress")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear of the floating dock (assistant, back-to-top): where the
                  page gutter is narrower than the dock, the buttons step left */}
              <div className="flex items-center gap-3 pr-[max(0px,calc(var(--dock-safe)-var(--gutter)))]">
                {[
                  { id: "prev", label: "Previous slide", onClick: prevSlide, icon: <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform duration-300 motion-reduce:transition-none" /> },
                  {
                    id: "toggle",
                    label: heroPaused ? "Play slideshow" : "Pause slideshow",
                    onClick: togglePause,
                    icon: heroPaused ? (
                      <Play size={16} strokeWidth={1.75} fill="currentColor" aria-hidden="true" />
                    ) : (
                      <Pause size={16} strokeWidth={1.75} aria-hidden="true" />
                    ),
                  },
                  { id: "next", label: "Next slide", onClick: nextSlide, icon: <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-300 motion-reduce:transition-none" /> },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={c.onClick}
                    aria-label={c.label}
                    className="group btn-ring grid size-11 place-items-center rounded-full border border-white/50 bg-[#11141826] text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
                  >
                    {c.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RAISED CONTENT ═══ */}
      <div className="relative z-3 shadow-[0_-35px_70px_#00000040]">
        {/* ── FOUNDED IN 1984 ── */}
        <CompanySection />

        {/* ── WHERE WE ARE ── */}
        <section className="relative overflow-hidden border-t border-(--hair) bg-white section-y">
          <div className="wrap">
            <SectionHeader
              eyebrow="WHERE WE ARE"
              title={
                <>
                  From Bangladesh
                  <br />
                  to the world.
                </>
              }
            >
              {/* <p>
                Every factory sits within an hour of Dhaka, with sourcing
                offices in Hong Kong and Shanghai. Around ninety-five percent
                of what we make ships to the United States, the rest to
                Europe, Japan and India.
              </p> */}
              <p>
                Every factory sits within an hour of Dhaka, connected directly to a streamlined global supply chain. Our garments ship globally—to the United States, China, all over Europe, Japan, and India.
              </p>
            </SectionHeader>
            <WorldRoutes className="mt-section-head" />
            {/* On phones the legend chips wrap under the paragraph */}
            <div className="mt-section-head flex flex-col items-start justify-between gap-6 md:flex-row md:items-center md:gap-8">
              <p className="max-w-[60ch] text-pretty text-sm leading-relaxed text-(--mute) md:max-w-117.5">
                Today the group employs {F.employeesText} people across{" "}
                {F.factories} garment factories, {F.productionLines} production
                lines and seven washing plants, making {F.garmentsYear}{" "}
                readymade garments a year. Denim production is{" "}
                {F.denimYardsMonth} yards a month.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-xs text-[11px] tracking-[0.07em] font-semibold text-(--navy)">
                  <span
                    className="inline-block size-2 rounded-full bg-(--navy)"
                    aria-hidden="true"
                  />
                  BANGLADESH
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-xs text-[11px] tracking-[0.07em] font-semibold">
                  <span
                    className="inline-block size-2 rounded-full bg-(--navy)"
                    aria-hidden="true"
                  />
                  SOURCING OFFICES
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-xs text-[11px] tracking-[0.07em] font-semibold">
                  <span
                    className="inline-block size-2 rounded-full bg-[#8a8b90]"
                    aria-hidden="true"
                  />
                  EXPORT MARKETS
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── OUR BUYERS ── */}
        <section className="bg-white section-y">
          <div className="wrap">
            <SectionHeader
              eyebrow="OUR BUYERS"
              titleClassName="max-w-[22ch]"
              title={
                <>
                  Retailers and brands we manufacture for.
                  <sup className="relative top-[-0.1em] ml-[0.08em] align-top text-[0.42em] leading-none text-(--color-red)">
                    *
                  </sup>
                </>
              }
            />
            <BuyerGrid className="mt-section-head" />
          </div>
        </section>

        {/* ── PRODUCTS (3D carousel) ── */}
        <section id="products" className="bg-(--mist) section-y">
          <div className="wrap">
            <SectionHeader
              eyebrow="WHAT WE MAKE"
              title={
                <>
                  Bottoms, tops,
                  <br />
                  denim and sweaters.
                </>
              }
            >
              <p>
                From fashionable denim fabrics to wholesale apparel, Ha-Meem
                makes bottoms, tops and sweaters for global fashion brands, with
                products ranging from infant to adult sizes.
              </p>
            </SectionHeader>
          </div>
          {/* The stage keeps 56px of air above the cards for their 3D swing;
              it counts toward the header gap. */}
          <div className="mt-[max(0px,calc(var(--section-head)-56px))]">
            <Productcarousel items={productSlides} label="What we make" />
          </div>
          {VIRTUAL_TOUR_URL && (
            <div className="wrap mt-cta flex justify-center">
              <a
                href={VIRTUAL_TOUR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ring inline-flex min-h-12 items-center rounded-xs border border-(--ink) px-8 text-xs font-semibold tracking-widest transition-colors duration-300 hover:bg-(--ink) hover:text-white"
              >
                TAKE A VIRTUAL TOUR OF HA-MEEM GROUP
              </a>
            </div>
          )}
        </section>

        {/* ── VERTICAL INTEGRATION (Steps accordion) ── */}
        <section id="chain" className="bg-white pt-section [content-visibility:auto] [contain-intrinsic-size:auto_960px]">
          <div className="wrap pb-section-head">
            <SectionHeader eyebrow="VERTICAL INTEGRATION" title="Six steps, all ours.">
              <p>
                From yarn and denim fabric to finished garments, seven washing
                plants and export-ready apparel, integrated facilities connect
                each stage of production.
              </p>
            </SectionHeader>
          </div>
          <ChainSteps />
        </section>

        {/* ── BUSINESSES ── */}
        {/* Heavy sections below the fold skip rendering while off screen
            (content-visibility: auto); contain-intrinsic-size holds their
            space, so the page doesn't jump as they come in. */}
        <section id="businesses" className="bg-white section-y [content-visibility:auto] [contain-intrinsic-size:auto_1300px]">
          <div className="wrap">
            <SectionHeader
              eyebrow="WHAT WE DO"
              title={
                <>
                  One group, from yarn
                  <br />
                  to shipped carton.
                </>
              }
            >
              <p>
                Every unit upstream of a sewing line exists to make that line
                faster and more reliable. Around the apparel chain sit media,
                jute, tea and logistics.
              </p>
            </SectionHeader>
            <BusinessMosaic className="mt-section-head" />
          </div>
        </section>

        {/* ── RECOGNITION & AWARDS ── */}
        <section id="recognition" className="relative isolate bg-white section-y [content-visibility:auto] [contain-intrinsic-size:auto_1150px]">
          <div className="wrap">
            <SectionHeader
              eyebrow={<>RECOGNITION &amp; AWARDS</>}
              title={
                <>
                  Award-winning apparel
                  <br />
                  manufacturing in Bangladesh
                </>
              }
            >
              <p>
                <span className="text-(--ink)">National Export Trophies from the Government of Bangladesh</span>
                <span> and quality awards from global retailers including Kohl&apos;s and JCPenney recognise </span>
                <span className="text-(--ink)">Ha-Meem Group&apos;s export performance, product quality and technical excellence</span>
                <span> since 2009.</span>
              </p>
            </SectionHeader>
            <AwardShowcase className="mt-section-head" />
          </div>
        </section>

        {/* ── SUSTAINABILITY ── */}
        <section
          id="sustainability"
          className="relative isolate overflow-hidden bg-(--ink) text-white [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
        >
          <img
            src={`${media}sustain-campus.jpg`}
            loading="lazy"
            decoding="async"
            alt="Ha-Meem Textiles at Mawna"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          {/* Overlay: a lighter wash so the campus shows (no blur), and a
              top-anchored scrim that keeps the header band dark */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(10,14,18,0.23)]" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,14,18,0.65)_0%,rgba(10,14,18,0.35)_45%,rgba(10,14,18,0.15)_100%)]"
          />

          <div className="wrap section-y">
            <SectionHeader
              tone="dark"
              eyebrow="SUSTAINABILITY"
              title={<>Cleaner water, cleaner power. Measured.</>}
            >
              <p>
                Our mills treat effluent biologically, recover process chemicals
                and put solar on factory roofs, working toward net-zero by{" "}
                {F.netZeroBy}.
              </p>
            </SectionHeader>

            {/* Four measured results. On wide pointer screens the hovered or
                focused card widens (flex-grow) and reveals its detail; the
                others narrow and dim. md–lg (and touch at lg): a 2 × 2 grid
                with a one-line detail. Phones: a sideways snap row. */}
            <ul
              data-reveal-stagger
              className="group/eco mt-section-head -mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto px-gutter pb-1 text-left [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:flex lg:h-[380px] lg:[@media(hover:none)]:grid lg:[@media(hover:none)]:h-auto"
            >
              {SUSTAINABILITY_STATS.map((s, i) => {
                const [num, unit] = splitUnit(s.value);
                const look = ECO_LOOK[s.label] ?? ECO_LOOK["Solar capacity"];
                return (
                  <li
                    key={s.label}
                    tabIndex={0}
                    onPointerEnter={(e) => e.pointerType === "mouse" && ecoLoops.setActive(i)}
                    onPointerLeave={() => ecoLoops.setActive(null)}
                    onFocus={() => ecoLoops.setActive(i)}
                    onBlur={() => ecoLoops.setActive(null)}
                    style={{ "--accent": look.accent } as CSSProperties}
                    className="group relative h-65 w-[78%] shrink-0 snap-start overflow-hidden rounded-sm border border-white/15 bg-[rgba(10,14,18,.62)] text-left backdrop-blur-md transition-[flex-grow,opacity,border-color] duration-600 ease-[cubic-bezier(.22,1,.36,1)] hover:border-white/35 focus-visible:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none md:h-[300px] md:w-auto lg:h-auto lg:flex-1 lg:group-hover/eco:opacity-75 lg:hover:flex-[2.2] lg:hover:opacity-100! lg:focus:flex-[2.2] lg:focus:opacity-100! lg:[@media(hover:none)]:h-[300px]"
                  >
                    {/* a) The topic loop, clear in the top 55%, sliding up and
                        brightening on the widened card. It plays only on
                        screen, two at most (useLoopPlayback); the poster
                        stands in everywhere else. */}
                    <video
                      ref={ecoLoops.loop(i)}
                      src={VIDEOS[look.loop].src}
                      poster={`${media}${VIDEOS[look.loop].poster}`}
                      muted
                      loop
                      playsInline
                      preload="none"
                      aria-hidden="true"
                      tabIndex={-1}
                      className="pointer-events-none absolute inset-x-0 top-0 h-[calc(55%+8px)] w-full object-cover opacity-55 mask-[linear-gradient(to_bottom,black_55%,transparent)] transition-[opacity,translate] duration-600 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 group-hover:opacity-75 group-focus:-translate-y-2 group-focus:opacity-75 motion-reduce:transition-none"
                    />
                    {/* b) Fading into the dark glass below */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[rgba(10,14,18,0.55)] to-[rgba(10,14,18,0.85)]"
                    />

                    {/* Stitched seam, sewn round the card on hover or focus; always shown on touch screens */}
                    <svg
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-2 z-10 h-[calc(100%-16px)] w-[calc(100%-16px)] overflow-visible"
                    >
                      <defs>
                        <mask id={`eco-stitch-${i}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
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
                            className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-900 group-focus:[stroke-dashoffset:0] motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0] [@media(hover:none)]:transition-none"
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
                        strokeOpacity="0.7"
                        strokeWidth="1.5"
                        strokeDasharray="8 6"
                        mask={`url(#eco-stitch-${i})`}
                      />
                    </svg>

                    {/* Top to bottom: index and icon, then the figure and label, then the detail */}
                    <div className="relative z-10 flex h-full flex-col p-5 md:p-6">
                      <span className="flex items-center justify-between">
                        <span className="text-[11px] tabular-nums tracking-widest text-white/60">{String(i + 1).padStart(2, "0")}</span>
                        <span className="grid size-9 place-items-center rounded-xs border border-white/15 bg-white/5">
                          <look.Icon size={18} strokeWidth={1.5} aria-hidden="true" className="text-white/80" />
                        </span>
                      </span>

                      <div className="mt-auto">
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-['Fira_Sans_Condensed'] text-[52px] font-black leading-none tabular-nums text-white lg:text-[60px]">
                            <CountUp text={num} />
                          </span>
                          {unit && <span className="text-base font-medium text-white/70">{unit}</span>}
                        </div>
                        {/* The topic's colour, used only here */}
                        <span
                          aria-hidden="true"
                          className="mt-3 block h-0.5 w-6 origin-left bg-(--accent) transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-200 group-focus:scale-x-200 motion-reduce:transition-none"
                        />
                        <span className="mt-3 block text-xs font-semibold uppercase leading-snug tracking-[0.14em] text-white/80">
                          {s.label}
                        </span>

                        {/* Compact detail, one line: below lg and on touch screens */}
                        {s.detail && (
                          <p className="mt-2 line-clamp-1 text-sm text-white/85 lg:[@media(hover:hover)]:hidden">{s.detail}</p>
                        )}
                        {/* Full detail on the widened card: grid rows 0fr → 1fr, at a
                            fixed width, so it doesn't reflow while the card widens */}
                        {s.detail && (
                          <div className="hidden grid-rows-[0fr] transition-[grid-template-rows] duration-600 ease-[cubic-bezier(.22,1,.36,1)] group-hover:grid-rows-[1fr] group-focus:grid-rows-[1fr] motion-reduce:transition-none lg:[@media(hover:hover)]:grid">
                            <div className="min-h-0 overflow-hidden">
                              <div className="w-[34ch] translate-y-2 pt-3 opacity-0 transition-[opacity,translate] delay-150 duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none">
                                <p className="line-clamp-2 text-sm leading-relaxed text-white/85">{s.detail}</p>
                                {s.points && (
                                  <ul className="mt-2 flex flex-col gap-1 text-xs text-white/70">
                                    {s.points.slice(0, 2).map((pt) => (
                                      <li key={pt} className="flex gap-2">
                                        <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-white/60" />
                                        {pt}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>



        {/* ── PEOPLE ── */}
        <PeopleSection />


        {/* ── NEWSROOM ── */}
        {/* An editorial bento front page. From 1024px, 12 columns in three rows:
            the lead story fills the left half of rows 1-2; the photo story and
            the text story sit beside it, the press note and the figure tiles
            under them; the film (with the social tiles, once their links exist)
            and the gallery link close row 3. Two columns from 640px, one below,
            in reading order: lead, stories, figures, film, press note, links. */}
        <section id="news" className="bg-white section-y [content-visibility:auto] [contain-intrinsic-size:auto_1300px]">
          <div className="wrap">
            <SectionHeader eyebrow="NEWSROOM" title="Latest from the group.">
              <p>Plant openings, sustainability milestones and awards, with links to the original press reports.</p>
            </SectionHeader>

            {(() => {
              const [lead, photoStory, textStory] = NEWS;
              const socials = SOCIAL_LINKS.filter((s) => s.href);
              const publications = new Set(NEWS.filter((n) => n.source).map((n) => n.source)).size;
              return (
                <div data-reveal-stagger className="mt-section-head grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto]">
                  {/* A) Lead story: the photo fills the tile under a white wash */}
                  {lead && (
                    <StoryTile
                      story={lead}
                      className="group relative flex min-h-115 flex-col overflow-hidden bg-white p-6 sm:col-span-2 sm:min-h-140 md:p-8 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1"
                    >
                      <img
                        src={`${media}${lead.img}`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`absolute inset-0 size-full object-cover ${photoToneClass}`}
                      />
                      <span aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-white/92 via-white/70 to-white/95" />
                      {/* Stitched seam, sewn round the tile on hover or focus; always shown on touch screens */}
                      <svg aria-hidden="true" className="pointer-events-none absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)] overflow-visible">
                        <defs>
                          <mask id="news-stitch-0" maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
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
                              className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-1000 group-focus-visible:[stroke-dashoffset:0] motion-reduce:transition-none motion-reduce:[stroke-dashoffset:0] [@media(hover:none)]:[stroke-dashoffset:0] [@media(hover:none)]:transition-none"
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
                          stroke="var(--navy)"
                          strokeOpacity="0.45"
                          strokeWidth="1.5"
                          strokeDasharray="8 6"
                          mask="url(#news-stitch-0)"
                        />
                      </svg>

                      <div className="relative flex flex-1 flex-col">
                        <StoryMeta story={lead} />
                        <div className="mt-auto pt-12">
                          <h3 className="max-w-[16ch] font-['Fira_Sans_Condensed'] text-[40px] font-semibold leading-[1.02] text-(--heading) md:text-[56px] lg:text-[64px]">
                            {withHighlight(lead.title, lead.highlight, "bg-(--red) px-1.5 text-white")}
                          </h3>
                          {lead.dek && <p className="mt-4 max-w-[56ch] text-intro text-(--mute)">{lead.dek}</p>}
                          <div className="mt-6">
                            <StorySource story={lead} />
                          </div>
                        </div>
                      </div>
                    </StoryTile>
                  )}

                  {/* B) Photo story: a contained photo between its date and headline */}
                  {photoStory && (
                    <StoryTile
                      story={photoStory}
                      className="group flex flex-col bg-(--mist) p-6 lg:col-span-3 lg:col-start-7 lg:row-start-1"
                    >
                      <StoryMeta story={photoStory} dateFirst />
                      <span className="mt-4 block aspect-4/3 overflow-hidden rounded-xs bg-white">
                        <img
                          src={`${media}${photoStory.img}`}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className={`size-full object-cover ${photoToneClass}`}
                        />
                      </span>
                      <div className="mt-auto pt-6">
                        {/* The highlight is marked at rest; on hover the marker sweeps
                            across the whole headline, cloned onto every wrapped line. */}
                        <h3 className="font-['Fira_Sans_Condensed'] text-card font-semibold text-(--heading)">
                          <span className="box-decoration-clone bg-[linear-gradient(var(--marker),var(--marker))] bg-size-[0%_100%] bg-no-repeat transition-[background-size] duration-450 ease-out group-hover:bg-size-[100%_100%] group-focus-visible:bg-size-[100%_100%] motion-reduce:transition-none">
                            {withHighlight(photoStory.title, photoStory.highlight, "bg-(--marker) px-0.5")}
                          </span>
                        </h3>
                        <div className="mt-4">
                          <StorySource story={photoStory} />
                        </div>
                      </div>
                    </StoryTile>
                  )}

                  {/* C) Text story: type only, with a round arrow that turns on hover */}
                  {textStory && (
                    <StoryTile
                      story={textStory}
                      className="group flex flex-col bg-white p-6 lg:col-span-3 lg:col-start-10 lg:row-start-1"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <StoryMeta story={textStory} />
                        {textStory.url && (
                          <span
                            aria-hidden="true"
                            className="-mt-2 grid size-9 shrink-0 place-items-center rounded-full border border-(--hair) text-(--ink) transition-[rotate,border-color] duration-300 group-hover:rotate-45 group-hover:border-(--navy)/30 group-focus-visible:rotate-45 motion-reduce:transition-none"
                          >
                            <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <h3 className="mt-6 font-['Fira_Sans_Condensed'] text-[28px] font-semibold leading-tight text-(--heading) lg:text-[34px]">
                        {withHighlight(textStory.title, textStory.highlight, "bg-[color-mix(in_srgb,var(--heading)_14%,white)] px-1")}
                      </h3>
                      {textStory.dek && <p className="mt-4 text-sm text-(--mute)">{textStory.dek}</p>}
                      <div className="mt-auto pt-6">
                        <StorySource story={textStory} />
                      </div>
                    </StoryTile>
                  )}

                  {/* E) Figure tiles: four results from F, one link to the sustainability section */}
                  <Link
                    to="/#sustainability"
                    aria-label="Sustainability figures"
                    className={`group grid grid-cols-2 gap-3 rounded-sm sm:col-span-2 sm:grid-cols-4 lg:col-span-3 lg:col-start-10 lg:row-start-2 lg:grid-cols-2 ${liftClass}`}
                  >
                    {NEWS_FIGURES.map(([value, label]) => {
                      const [num, unit] = splitUnit(value);
                      return (
                        <span
                          key={label}
                          className={`flex min-h-36 flex-col bg-(--mist) p-4 transition-colors duration-300 group-hover:border-(--navy)/30 group-focus-visible:border-(--navy)/30 motion-reduce:transition-none ${tileClass}`}
                        >
                          {/* A stitched wave: decoration, not a trend line */}
                          <svg width="72" height="12" viewBox="0 0 72 12" aria-hidden="true" className="text-(--navy)/50">
                            <path d="M0 6 Q 9 0 18 6 T 36 6 T 54 6 T 72 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                          </svg>
                          <span className="mt-auto flex items-baseline gap-1 pt-4 font-['Fira_Sans_Condensed'] text-[32px] font-semibold leading-none text-(--heading)">
                            {num}
                            {unit && <span className="text-sm font-medium text-(--mute)">{unit}</span>}
                          </span>
                          <span className="mt-2 text-balance text-[11px] font-semibold uppercase leading-snug tracking-widest text-(--mute)">{label}</span>
                        </span>
                      );
                    })}
                  </Link>

                  {/* F) Film: the gallery's RFID film, poster behind a play button */}
                  <Link
                    to="/gallery#film"
                    className={`group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-sm border border-white/15 bg-(--ink) p-6 text-white transition-[translate,border-color] duration-300 hover:-translate-y-0.5 hover:border-white/40 focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0 lg:col-start-1 lg:row-start-3 ${
                      socials.length ? "lg:col-span-3" : "lg:col-span-6"
                    }`}
                  >
                    <img
                      src={`${media}${GALLERY_VIDEO.poster}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 size-full object-cover opacity-40 transition-opacity duration-700 group-hover:opacity-55 group-focus-visible:opacity-55 motion-reduce:transition-none"
                    />
                    <span className="relative grid size-11 place-items-center rounded-full bg-white text-(--ink) transition-[scale] duration-300 group-hover:scale-105 motion-reduce:transition-none">
                      <Play size={18} strokeWidth={1.75} fill="currentColor" aria-hidden="true" />
                    </span>
                    <span className="relative mt-6 block">
                      <span className="block text-sm font-semibold">{GALLERY_VIDEO.title}</span>
                      <span className="mt-1 block text-[13px] text-white/80">Watch on the Gallery page</span>
                    </span>
                  </Link>

                  {/* D) About the newsroom: counts taken from NEWS itself */}
                  <div className={`flex flex-col bg-[color-mix(in_srgb,var(--heading)_6%,white)] p-6 lg:col-span-3 lg:col-start-7 lg:row-start-2 ${tileClass}`}>
                    <h3 className="font-['Fira_Sans_Condensed'] text-xl font-semibold text-(--heading)">Ha-Meem in the press</h3>
                    <p className="mt-2 text-sm text-(--ink)">Original reports from Bangladesh's business press, linked at the source.</p>
                    <ul className="mt-auto flex flex-col gap-2 pt-6 text-sm text-(--ink)">
                      <li className="flex items-center gap-2">
                        <Newspaper size={16} strokeWidth={1.75} aria-hidden="true" className="text-(--navy)" />
                        {NEWS.length} stories
                      </li>
                      <li className="flex items-center gap-2">
                        <Building2 size={16} strokeWidth={1.75} aria-hidden="true" className="text-(--navy)" />
                        {publications} publications
                      </li>
                    </ul>
                  </div>

                  {/* G) Social tiles: only the channels with a link; none, no tile */}
                  {socials.length > 0 && (
                    <ul className="grid grid-cols-3 gap-3 sm:col-span-2 lg:col-span-3 lg:col-start-4 lg:row-start-3">
                      {socials.map((s) => (
                        <li key={s.label}>
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ "--brand": SOCIAL_COLOR[s.label] } as CSSProperties}
                            className={`flex aspect-square size-full min-h-11 items-center justify-center bg-[color-mix(in_srgb,var(--brand)_6%,white)] text-sm font-semibold text-(--brand) ${tileClass} ${liftClass}`}
                          >
                            {s.label}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* H) Gallery link: a slim row with a round arrow */}
                  <Link
                    to="/gallery"
                    className={`group flex items-center justify-between gap-6 bg-white p-6 sm:col-span-2 lg:col-span-6 lg:col-start-7 lg:row-start-3 ${tileClass} ${liftClass}`}
                  >
                    <span>
                      <span className="block font-['Fira_Sans_Condensed'] text-xl font-semibold text-(--heading)">Explore the gallery</span>
                      <span className="mt-1 block text-sm text-(--mute)">Factories, people and 360° tours</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-(--ink) text-white transition-[rotate] duration-300 group-hover:rotate-45 group-focus-visible:rotate-45 motion-reduce:transition-none"
                    >
                      <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  </Link>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── CAREERS CTA ── */}
        <ContactCta id="careers" />
      </div>
    </>
  );
}
