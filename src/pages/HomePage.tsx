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
import { VIDEOS } from "../data/videos";

const media = "/media/";

// Sustainability cards: icon, accent, photo and watermark motion per topic
const ECO_LOOK: Record<string, { Icon: LucideIcon; accent: string; image: string; motion: string }> = {
  "Solar capacity": { Icon: Sun, accent: "#f5a524", image: "sustain/solar.gif", motion: "animate-[ecoSpin_40s_linear_infinite]" },
  "Water recycling": { Icon: Droplets, accent: "#4fb3d9", image: "sustain/water.gif", motion: "animate-[ecoBob_6s_ease-in-out_infinite]" },
  "Power co-generation": { Icon: Zap, accent: "#f2c94c", image: "sustain/fiber.gif", motion: "animate-[ecoFlicker_4s_ease-in-out_infinite]" },
  "Fiber recycled a day": { Icon: Recycle, accent: "#6fbf73", image: "sustain/recycle.gif", motion: "animate-[ecoSpin_30s_linear_infinite]" },
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

const steps = [
  {
    title: "Spinning",
    text: "Cotton becomes yarn in our own spinning mills at Mawna, with rotor spinning and yarn dyeing added since.",
    stat: F.spinningDay,
    unit: "YARN SPUN A DAY",
    image: "chain-spinning.jpg",
  },
  {
    title: "Weaving & dyeing",
    text: `Ha-Meem Denim produces rope-dyed and slasher-dyed denim fabric: ${F.denimYardsMonth} yards of denim and ${F.nonDenimYardsMonth} yards of non-denim fabric a month.`,
    stat: `${F.denimYardsMonth} yds`,
    unit: "DENIM A MONTH",
    image: "chain-fabric.jpg",
  },
  {
    title: "Cutting & sewing",
    text: `Automatic spreading and cutting across ${F.factories} garment factories and ${F.productionLines} production lines, making ${F.garmentsYear} garments a year.`,
    stat: F.garmentsYear,
    unit: "GARMENTS A YEAR",
    image: "chain-sewing.jpg",
  },
  {
    title: "Washing & finishing",
    text: `Seven washing plants with ${F.laserMachines} laser machines and ${F.ozoneMachines} ozone machines support garment finishing, with processes including ozone, laser, over-dye, dip-dye and 3D whisker.`,
    stat: F.washingPlants,
    unit: "WASHING PLANTS",
    image: "chain-wash.jpg",
  },
  {
    title: "Trims & packaging",
    text: `Accessories are ${F.inHouseAccessories} in-house: labels, elastic, twill tape, buttons, zips and hangers, then export cartons and poly bags from our own plants.`,
    stat: F.labelsMonth,
    unit: "LABELS A MONTH",
    image: "chain-trims.jpg",
  },
  {
    title: "Shipping",
    text: "Our own transport fleet and clearing and forwarding offices at every Bangladeshi port move goods from factory gate to vessel.",
    stat: "EVERY",
    unit: "PORT, OWN C&F",
    image: "biz/label.jpg",
  },
];

const businesses = [
  {
    stat: F.productionLines,
    unit: "PRODUCTION LINES",
    title: "Woven garments",
    text: `${F.factories} garment factories make ${F.garmentsYear} readymade garments a year, part of a group of ${F.employeesText} people.`,
    image: "biz/woven.jpg",
    to: "/businesses/woven",
  },
  {
    stat: F.denimYardsMonth,
    unit: "YARDS A MONTH",
    title: "Denim mill",
    text: "Rope-dyed and slasher-dyed denim fabric made for fashion brands at Ha-Meem Denim.",
    image: "biz/denim.jpg",
    to: "/businesses/denim-mill",
  },
  {
    stat: F.spinningDay,
    unit: "YARN A DAY",
    title: "Spinning & textiles",
    text: "Ring and rotor yarn, woven non-denim fabric and, since 2025, yarn dyeing at Sreepur.",
    image: "biz/spinning.jpg",
    to: "/businesses/denim-mill#spinning",
  },
  {
    stat: F.washingPlants,
    unit: "WASHING PLANTS",
    title: "Washing & finishing",
    text: "Seven plants support garment finishing across the group's integrated manufacturing operations.",
    image: "biz/laundry.jpg",
    to: "/businesses/laundry",
  },
  {
    stat: F.sweatersYear,
    unit: "SWEATERS A YEAR",
    title: "Sweaters",
    text: `Computerised flat-knitting at Kashimpur and Ashulia, on ${F.stollMachines} Stoll machines.`,
    image: "biz/sweater.jpg",
    to: "/businesses/sweater",
  },
  {
    stat: F.samplesDay,
    unit: "SAMPLES A DAY",
    title: "Design & sampling",
    text: `In-house designers, CAD and a ${F.sampleMachines}-machine sample room turn a brief into a counter sample.`,
    image: "biz/design.jpg",
    to: "/businesses/design-studio",
  },
  {
    stat: F.embroideryMachines,
    unit: "EMBROIDERY MACHINES",
    title: "Embroidery, printing & trims",
    text: "Forty embroidery heads, screen and digital print, labels, elastic, belts and narrow fabric.",
    image: "biz/embroidery.jpg",
    to: "/businesses/embroidery-printing-accessories",
  },
  {
    stat: F.cartonExport,
    unit: "EXPORT-ORIENTED",
    title: "Packaging",
    text: "Export cartons, poly bags and printed paper trims so every order ships complete.",
    image: "biz/packaging.jpg",
    to: "/businesses/ancillary",
  },
  {
    stat: F.samakalFounded,
    unit: "SAMAKAL FOUNDED",
    title: "Beyond apparel",
    text: "A national daily, a 24-hour news channel, jute, tea, transport and port clearing.",
    image: "biz/gate.jpg",
    to: "/about#other-businesses",
  },
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
  const [step, setStep] = useState(1);
  // The outgoing slide is kept as `prev`: it stays opaque underneath while the
  // new one fades in on top, so the cross-fade never dips to the dark backdrop.
  const [hero, setHero] = useState({ current: 0, prev: -1 });
  const heroSlide = hero.current;
  const [heroPaused, setHeroPaused] = useState(false);
  const heroVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
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

  useEffect(() => {
    if (heroPaused) return;
    const timer = setTimeout(advanceSlide, slideMs(heroSlide));
    return () => clearTimeout(timer);
  }, [heroPaused, heroSlide, advanceSlide]);

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
      if (video.currentTime > 0.1) video.currentTime = 0;
      if (heroPaused) video.pause();
      else void video.play().catch(() => {});
    });
  }, [heroSlide, heroPaused]);

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
        key={current ? `${heroSlide}-${heroPaused}` : undefined}
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
        <section id="chain" className="bg-white pt-section">
          <div className="wrap pb-section-head">
            <SectionHeader eyebrow="VERTICAL INTEGRATION" title="Six steps, all ours.">
              <p>
                From yarn and denim fabric to finished garments, seven washing
                plants and export-ready apparel, integrated facilities connect
                each stage of production.
              </p>
            </SectionHeader>
          </div>
          {/* Desktop and tablet (768px and up): horizontal accordion, unchanged */}
          <div className="hidden md:flex h-155 md:h-168 text-white bg-(--ink) overflow-x-auto">
            {steps.map((item, i) => (
              <button
                key={item.title}
                className={`step-panel relative border-0 border-r-2 border-white text-white bg-transparent p-6 text-left overflow-hidden cursor-pointer ${step === i ? "step-open flex-[1_1_50%]" : "flex-[0_0_10%]"
                  }`}
                onClick={() => setStep(i)}
                onMouseEnter={() => setStep(i)}
              >
                {/* Real image with object-cover: narrow collapsed panels crop the
            centre of the photo instead of squashing the whole frame */}
                <img
                  src={`${media}${item.image}`}
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 h-full w-full max-w-none object-cover object-center transition-transform duration-700 ease-out ${step === i ? "scale-105" : "scale-100"
                    }`}
                />

                {/* Overlay: Light for active (image clear), Darker for collapsed (60% opacity) */}
                <span
                  className={`absolute inset-0 transition-all duration-500 ${step === i
                      ? "bg-linear-to-r from-[rgba(17,20,24,0.55)] to-[rgba(17,20,24,0.35)]"
                      : "bg-[rgba(17,20,24,0.6)]"
                    }`}
                  aria-hidden="true"
                />

                {/* Content wrapper - z-10 to sit above the overlay */}
                <span className="relative z-10 block h-full">
                  <span className="step-num-text absolute left-1/2 top-0 -translate-x-1/2 font-semibold transition-opacity duration-300">
                    0{i + 1}
                  </span>

                  {step === i ? (
                    <span className="step-body absolute left-10 right-12 bottom-4 flex flex-col">
                      <em className="text-(--navy) not-italic text-xs font-semibold tracking-widest">
                        STEP {String(i + 1).padStart(2, "0")} OF 6
                      </em>
                      <strong className="font-['Fira_Sans_Condensed'] text-[32px] md:text-[40px] my-4">
                        {item.title}
                      </strong>
                      <span className="max-w-117.5 text-(--hair) leading-relaxed">
                        {item.text}
                      </span>
                      <b className="font-['Fira_Sans_Condensed'] text-[28px] mt-6">
                        {item.stat}{" "}
                        <small className="font-['Fira_Sans'] text-[10px] tracking-[0.15em] font-medium">
                          {item.unit}
                        </small>
                      </b>
                    </span>
                  ) : (
                    <strong className="step-vertical absolute bottom-10 left-1/2 [writing-mode:vertical-rl] -translate-x-1/2 rotate-180 font-['Fira_Sans_Condensed'] text-[19px] whitespace-nowrap transition-all duration-300">
                      {item.title}
                    </strong>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Phones (below 768px): the same six steps as a vertical accordion.
      Closed steps are image strips; the open step shows its photo
      uncropped above the text, so neither competes with the other. */}
          <ol className="md:hidden bg-(--ink) text-white">
            {steps.map((item, i) => {
              const open = step === i;
              const num = String(i + 1).padStart(2, "0");
              return (
                <li
                  key={item.title}
                  className="scroll-mt-24 border-b-2 border-white last:border-b-0"
                >
                  <button
                    type="button"
                    id={`chain-step-${i}`}
                    aria-expanded={open}
                    aria-controls={`chain-panel-${i}`}
                    className="relative flex w-full min-h-18 items-center gap-4 overflow-hidden px-5 py-4 text-left"
                    onClick={(e) => {
                      const row = e.currentTarget.parentElement;
                      setStep(i);
                      // Without the height animation there is no transitionend to wait for.
                      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                        requestAnimationFrame(() =>
                          row?.scrollIntoView({ block: "nearest", behavior: "instant" }),
                        );
                      }
                    }}
                  >
                    {/* The strip photo fades out once the step is open: the full photo sits below */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 motion-reduce:transition-none ${open ? "opacity-0" : "opacity-100"
                        }`}
                      style={{ backgroundImage: `url("${media}${item.image}")` }}
                    />
                    <span aria-hidden="true" className="absolute inset-0 bg-[rgba(17,20,24,0.62)]" />
                    <span
                      className={`relative z-1 w-6 shrink-0 text-sm font-semibold tabular-nums ${open ? "text-[#ef7898]" : "text-white/70"
                        }`}
                    >
                      {num}
                    </span>
                    <span className="relative z-1 flex-1 font-['Fira_Sans_Condensed'] text-[22px] font-bold leading-tight text-white">
                      {item.title}
                    </span>
                    <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className={`relative z-1 shrink-0 text-white transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""
                      }`} />
                  </button>

                  {/* Grid rows 0fr → 1fr animates to the content's natural height */}
                  <div
                    id={`chain-panel-${i}`}
                    role="region"
                    aria-labelledby={`chain-step-${i}`}
                    inert={!open}
                    className={`grid transition-[grid-template-rows] duration-500 ease-in-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    onTransitionEnd={(e) => {
                      // Once open, bring the whole step into view: the step that
                      // closed above it may have pulled it off-screen.
                      if (open && e.target === e.currentTarget && e.propertyName === "grid-template-rows") {
                        e.currentTarget.parentElement?.scrollIntoView({ block: "nearest" });
                      }
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <img
                        src={`${media}${item.image}`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="block w-full aspect-16/10 object-cover"
                      />
                      <div className="flex flex-col gap-3 px-5 pt-5 pb-7">
                        <span className="text-[#ef7898] text-[11px] font-semibold tracking-widest">
                          STEP {num} OF {steps.length}
                        </span>
                        <p className="max-w-117.5 text-(--hair) text-[15px] leading-relaxed">
                          {item.text}
                        </p>
                        <b className="font-['Fira_Sans_Condensed'] text-[28px] leading-none mt-2">
                          {item.stat}{" "}
                          <small className="font-['Fira_Sans'] text-[10px] tracking-[0.15em] font-medium">
                            {item.unit}
                          </small>
                        </b>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── BUSINESSES ── */}
        <section id="businesses" className="bg-white section-y">
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
            <div data-reveal-stagger className="mt-section-head grid grid-cols-1 gap-grid sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((b, i) => (
                <Link
                  to={b.to}
                  key={b.title}
                  className="biz-card group relative block h-74.5 overflow-hidden p-4 text-white transition-all duration-350 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none"
                >
                  <img
                    src={`${media}${b.image}`}
                    alt=""
                    className="biz-img absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none"
                  />
                  {/* Light at rest so the photo leads; darkens on hover (the .biz-card
                      rule in index.css), and on focus or touch, where the
                      details are shown and need the contrast. */}
                  <span className="biz-overlay absolute inset-0 bg-linear-to-b from-[#1114181a] to-[#1114188c] transition-all duration-350 group-focus-visible:from-[#11141859] group-focus-visible:to-[#111418d9] [@media(hover:none)]:from-[#11141859] [@media(hover:none)]:to-[#111418d9]" />

                  {/* Stitched seam: on hover (or keyboard focus) a dashed line is
            sewn around the card, like topstitching on a denim hem.
            The mask reveals the 8/6 dash pattern along the path, so the
            dashes keep their size whatever the card's width. Touch
            screens have no hover, so there it is always shown. */}
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-2.5 h-[calc(100%-20px)] w-[calc(100%-20px)] overflow-visible"
                  >
                    <defs>
                      <mask id={`biz-stitch-${i}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          pathLength={1}
                          fill="none"
                          stroke="white"
                          strokeWidth="6"
                          className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-900 group-focus-visible:[stroke-dashoffset:0] motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0]"
                        />
                      </mask>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill="none"
                      stroke="white"
                      strokeOpacity="0.85"
                      strokeWidth="1.5"
                      strokeDasharray="8 6"
                      mask={`url(#biz-stitch-${i})`}
                    />
                  </svg>

                  {/* Open button: a round arrow that grows into a labelled pill on
            hover. A visual cue only; the whole card is the link. */}
                  <span
                    aria-hidden="true"
                    className="absolute right-6 top-6 z-1 flex h-11 items-center rounded-xs border border-white/60 bg-[#11141833] text-white backdrop-blur-sm transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-(--ink) group-focus-visible:border-white group-focus-visible:bg-white group-focus-visible:text-(--ink) motion-reduce:transition-none"
                  >
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold tracking-[0.14em] opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:pl-4 group-hover:opacity-100 group-focus-visible:max-w-24 group-focus-visible:pl-4 group-focus-visible:opacity-100 motion-reduce:transition-none">
                      OPEN
                    </span>
                    <span className="grid size-11 shrink-0 place-items-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        className="transition-transform duration-300 group-hover:rotate-45 group-focus-visible:rotate-45 motion-reduce:transition-none"
                      >
                        <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </span>
                  </span>

                  {/* Figure and unit: out of sight at rest, sliding down into
                      place on hover. Opacity and transform only, so the text
                      stays in the link's accessible name. */}
                  <span className="relative z-1 flex -translate-y-2 flex-col pr-28 opacity-0 transition-[opacity,translate] duration-250 group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-60 group-hover:duration-300 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:delay-60 group-focus-visible:duration-300 motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                    <b className="font-['Fira_Sans_Condensed'] text-white text-[37px] leading-none">
                      {b.stat}
                    </b>
                    <small className="mt-2 text-[10px] text-white tracking-[0.13em]">
                      {b.unit}
                    </small>
                  </span>

                  <span className="absolute left-6 right-6 bottom-6 z-1 flex flex-col">
                    <strong className="font-['Fira_Sans_Condensed'] text-white text-card">
                      {b.title}
                    </strong>
                    {/* The rule and description open under the title: the row
                        goes 0fr → 1fr, which the card's fixed height absorbs,
                        so the title rises and the grid never reflows. */}
                    <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-250 ease-out group-hover:grid-rows-[1fr] group-hover:duration-350 group-focus-visible:grid-rows-[1fr] group-focus-visible:duration-350 motion-reduce:transition-none [@media(hover:none)]:grid-rows-[1fr]">
                      <span className="min-h-0 overflow-hidden">
                        {/* A short red rule that grows on hover: the eyebrow's colour, used once */}
                        <span
                          aria-hidden="true"
                          className="mt-2 mb-3 block h-0.5 w-0 bg-(--navy) transition-[width] duration-250 ease-out group-hover:w-16 group-hover:duration-500 group-focus-visible:w-16 group-focus-visible:duration-500 motion-reduce:transition-none [@media(hover:none)]:w-16"
                        />
                        <small className="line-clamp-3 block translate-y-2 text-sm leading-snug text-white opacity-0 transition-[opacity,translate] duration-250 group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-120 group-hover:duration-300 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:delay-120 group-focus-visible:duration-300 motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                          {b.text}
                        </small>
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECOGNITION & AWARDS ── */}
        <section id="recognition" className="relative isolate bg-white section-y">
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
          className="relative isolate overflow-hidden bg-(--ink) text-white"
        >
          <img
            src={`${media}sustain-campus.jpg`}
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

            {/* Four measured results. On wide screens the hovered or focused tile
                widens (flex-grow transitions) and reveals its detail; the others
                narrow and dim. Touch screens keep a grid with details open. */}
            <ul
              data-reveal-stagger
              className="group/eco mt-section-head grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:flex lg:h-105 lg:gap-3 lg:[@media(hover:none)]:grid lg:[@media(hover:none)]:h-auto"
            >
              {SUSTAINABILITY_STATS.map((s, i) => {
                const [num, unit] = splitUnit(s.value);
                const look = ECO_LOOK[s.label] ?? ECO_LOOK["Solar capacity"];
                return (
                  <li
                    key={s.label}
                    tabIndex={0}
                    style={{ "--accent": look.accent } as CSSProperties}
                    className="group relative min-h-75 overflow-hidden rounded-sm border border-white/15 text-left backdrop-blur-md bg-[rgba(10,14,18,.62)] transition-[flex-grow,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none lg:min-h-0 lg:flex-1 lg:group-hover/eco:opacity-70 lg:hover:flex-[2.4] lg:hover:opacity-100! lg:focus:flex-[2.4] lg:focus-within:flex-[2.4]"
                  >
                    {/* a) Topic photo; hidden if the file is missing */}
                    <img
                      src={`${media}${look.image}`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="pointer-events-none absolute inset-0 size-full scale-105 object-cover opacity-[0.14] mix-blend-luminosity grayscale-30 transition-[opacity,scale] duration-1000 ease-out group-hover:scale-100 group-hover:opacity-[0.28] group-focus:scale-100 group-focus:opacity-[0.28] motion-reduce:transition-none"
                    />
                    {/* b) Accent glow */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -bottom-16 size-65 rounded-full bg-[radial-gradient(var(--accent),transparent_70%)] opacity-[0.18] blur-2xl transition-opacity duration-700 group-hover:opacity-[0.32] group-focus:opacity-[0.32] motion-reduce:transition-none"
                    />
                    {/* c) Watermark icon with a slow per-topic motion */}
                    <look.Icon
                      size={160}
                      strokeWidth={1}
                      aria-hidden="true"
                      className={`eco-motion pointer-events-none absolute -right-6 -bottom-6 text-white opacity-[0.06] motion-reduce:animate-none ${look.motion}`}
                    />
                    {/* d) Top sheen */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.06),transparent_40%)]"
                    />

                    {/* Stitched seam, sewn round the tile on hover or focus; always shown on touch screens */}
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

                    {/* Content grows upward from the bottom, never past it */}
                    <div data-reveal className="relative z-10 flex h-full flex-col p-6 md:p-7">
                      <span className="flex items-center justify-between">
                        <span className="text-[11px] tabular-nums tracking-widest text-white/50">{String(i + 1).padStart(2, "0")}</span>
                        <span className="grid size-9 place-items-center rounded-xs border border-white/15 bg-white/5 transition-colors duration-300 group-hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] group-focus:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] motion-reduce:transition-none">
                          <look.Icon size={18} strokeWidth={1.5} aria-hidden="true" style={{ color: look.accent }} />
                        </span>
                      </span>

                      <div className="mt-auto pt-8">
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="font-['Fira_Sans_Condensed'] text-[48px] font-black leading-none text-white transition-[text-shadow] duration-500 group-hover:[text-shadow:0_0_24px_color-mix(in_srgb,var(--accent)_35%,transparent)] group-focus:[text-shadow:0_0_24px_color-mix(in_srgb,var(--accent)_35%,transparent)] motion-reduce:transition-none sm:text-[60px]">
                            {num}
                          </span>
                          {unit && <span className="text-[15px] font-medium text-white/70">{unit}</span>}
                        </div>
                        <span
                          aria-hidden="true"
                          className="mt-4 block h-0.5 w-6 bg-(--accent) transition-[width] duration-500 ease-out group-hover:w-12 group-focus:w-12 motion-reduce:transition-none"
                        />
                        <span className="mt-4 block text-[12px] font-semibold uppercase leading-snug tracking-[0.14em] text-white/75 transition-colors duration-300 group-hover:text-white group-focus:text-white motion-reduce:transition-none">
                          {s.label}
                        </span>

                        {/* Detail: grid rows 0fr → 1fr. The content has a fixed width on
                            lg, so it doesn't reflow while the tile widens. */}
                        {s.detail && (
                          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:grid-rows-[1fr] group-focus:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] motion-reduce:grid-rows-[1fr] motion-reduce:transition-none [@media(hover:none)]:grid-rows-[1fr]">
                            <div className="min-h-0 overflow-hidden">
                              <div className="translate-y-2 pt-4 opacity-0 transition-[opacity,translate] delay-150 duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none lg:w-[34ch] [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 lg:[@media(hover:none)]:w-auto">
                                <p className="line-clamp-3 text-sm leading-relaxed text-white/85">{s.detail}</p>
                                {s.points && (
                                  <ul className="mt-3 flex flex-col gap-1.5 text-xs text-white/70">
                                    {s.points.slice(0, 2).map((pt) => (
                                      <li key={pt} className="flex gap-2">
                                        <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-(--accent)" />
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
        <section id="news" className="bg-white section-y">
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
