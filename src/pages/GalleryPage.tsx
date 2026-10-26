import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import useLightHero from "../components/useLightHero";
import usePageMeta from "../components/usePageMeta";
import { GALLERY, GALLERY_CATEGORIES, GALLERY_VIDEO, VR_TOURS, type GalleryCategory, type GalleryItem, type VrTour } from "../data/gallery";

const media = "/media/";

/** src, sizes and dimensions for one gallery or tour image */
function imgProps(item: { src: string; width?: number; height?: number }, sizes: string) {
  return {
    src: `${media}${item.src}`,
    sizes,
    width: item.width ?? 1600,
    height: item.height ?? 1200,
  };
}
const pad = (n: number) => String(n).padStart(2, "0");
const countOf = (c: GalleryCategory) => GALLERY.filter((g) => g.category === c).length;
const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth");

/* A photo card: image, and a caption that fades in on hover (always shown on
   touch). Size, shape and motion come from the caller. */
function Card({
  item,
  className = "",
  eager = false,
  sizes,
  style,
  onOpen,
}: {
  item: GalleryItem;
  className?: string;
  eager?: boolean;
  sizes: string;
  style?: CSSProperties;
  onOpen: (el: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`Open ${item.title}`}
      style={style}
      className={`group relative block w-full overflow-hidden bg-(--hair) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) ${className}`}
    >
      <img
        {...imgProps(item, sizes)}
        alt={item.title}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-(--ink)/70 to-transparent px-4 pb-3 pt-12 text-left text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
        <span className="font-semibold">{item.title}</span>
        <span className="text-white/80">{item.category}</span>
      </span>
    </button>
  );
}

const TOURS: GalleryCategory = "Virtual tours";
const PHOTOS = GALLERY.filter((g) => g.category !== TOURS);
// Intro: the first four photos, scattered round the headline
const INTRO = PHOTOS.slice(0, 4);
const INTRO_SPOTS = [
  { pos: "left-[6%] top-[14%] w-[150px] aspect-[3/4]", dur: 9, delay: 0 },
  { pos: "left-[2%] bottom-[8%] w-[230px] aspect-[3/4]", dur: 12, delay: -3 },
  { pos: "right-[4%] top-[10%] w-[240px] aspect-[4/5]", dur: 11, delay: -6 },
  { pos: "right-[16%] bottom-[6%] w-[140px] aspect-square", dur: 13, delay: -2 },
];
// Bento: a repeating 5-item pattern (wide, narrow, then three equal)
const BENTO = [
  "md:col-span-2 lg:col-span-4 lg:h-[440px]",
  "lg:col-span-2 lg:h-[440px]",
  "lg:col-span-2 lg:h-[320px]",
  "lg:col-span-2 lg:h-[320px]",
  "lg:col-span-2 lg:h-[320px]",
];

/* One 360° tour card. The link opens the tour in a new tab on the click itself
   (no preventDefault, so popup blockers stay quiet); `data-opening` runs a short
   confirmation animation alongside it. */
function TourCard({ tour }: { tour: VrTour }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <a
      href={tour.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open the ${tour.name} 360° tour in a new tab`}
      data-opening={opening ? "" : undefined}
      onClick={() => {
        setOpening(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpening(false), 900);
      }}
      className="group block"
    >
      <div className="tour-frame relative aspect-[16/9] overflow-hidden rounded-[24px] bg-white ring-1 ring-(--hair) group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-(--navy)">
        <img
          {...imgProps({ src: tour.image, width: tour.width, height: tour.height }, "(min-width: 768px) 46vw, 100vw")}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover [object-position:50%_50%] transition-[transform,object-position] duration-[1200ms] ease-out group-hover:scale-[1.06] group-hover:[object-position:60%_50%] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {/* Red wash on hover, plus a permanent bottom gradient so the text reads */}
        <span aria-hidden="true" className="absolute inset-0 bg-(--navy)/0 transition-colors duration-500 group-hover:bg-(--navy)/15 motion-reduce:transition-none" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-(--ink)/80 to-transparent" />

        {/* The 360 mark, centred */}
        <span
          aria-hidden="true"
          className="tour-badge absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform duration-500 group-hover:scale-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          <span className="font-['Fira_Sans_Condensed'] text-4xl font-black text-white drop-shadow-[0_2px_12px_rgba(17,20,24,0.55)] md:text-5xl">360°</span>
          <svg viewBox="0 0 120 40" width="96" height="32" fill="none" className="mt-1 overflow-visible">
            <path
              d="M60 6C88 6 112 13 112 22s-24 16-52 16S8 31 8 22 32 6 60 6"
              pathLength={1}
              className="tour-draw stroke-white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path d="M16 13l-8 9 11 4" className="stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {/* Ripple out of the centre while the tab opens */}
        {opening && (
          <span
            aria-hidden="true"
            className="tour-ripple pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          />
        )}

        {/* Top-right chip: on hover, and always on touch */}
        <span className="absolute right-4 top-4 inline-flex -translate-y-1.5 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-(--ink) opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          Enter tour
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
        </span>

        {/* Bottom-left caption */}
        <span className="absolute inset-x-0 bottom-0 flex flex-col items-start p-5 transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 md:p-6">
          {tour.company && <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">[ {tour.company} ]</span>}
          <span className="mt-1 max-w-[34ch] text-xs font-semibold uppercase tracking-[0.12em] text-white md:text-sm">{tour.units}</span>
        </span>
      </div>

      <p className="mt-4 text-center font-['Fira_Sans_Condensed'] text-xl font-black uppercase tracking-[0.04em] text-(--ink) transition-colors duration-300 group-hover:text-(--navy) motion-reduce:transition-none md:text-2xl">
        {tour.name}
      </p>
      <span aria-hidden="true" className="mx-auto mt-1 block h-0.5 w-0 bg-(--navy) transition-[width] duration-500 group-hover:w-12 motion-reduce:transition-none" />
    </a>
  );
}

export default function GalleryPage() {
  usePageMeta(
    "Gallery",
    "Photos and film from inside Ha-Meem Group: denim mills, garment factories, virtual tours and the people behind the group.",
  );
  // This page opens white, so the header starts in ink rather than white
  useLightHero();

  const [category, setCategory] = useState<GalleryCategory | "All">("All");
  const [box, setBox] = useState<{ list: GalleryItem[]; index: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const wallRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const swipeX = useRef<number | null>(null);

  const filtered = category === "All" ? PHOTOS : PHOTOS.filter((g) => g.category === category);

  const openBox = (list: GalleryItem[], index: number, el: HTMLElement) => {
    openerRef.current = el;
    setBox({ list, index });
  };
  const step = (d: number) => setBox((b) => (b ? { ...b, index: (b.index + d + b.list.length) % b.list.length } : b));

  // Open the native dialog once there is something to show
  useEffect(() => {
    const d = dialogRef.current;
    if (box && d && !d.open) d.showModal();
  }, [box]);

  // Arrow keys while the lightbox is open (Escape is the dialog's own)
  useEffect(() => {
    if (!box) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [box === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: smooth(), block: "start" });
  const pickCategory = (c: GalleryCategory) => {
    // Virtual tours have their own section
    if (c === TOURS) return scrollToId("tours");
    setCategory(c);
    wallRef.current?.scrollIntoView({ behavior: smooth(), block: "start" });
  };

  const current = box ? box.list[box.index] : null;

  const marqueeRow = (copy: boolean) =>
    GALLERY_CATEGORIES.map((c, i) => {
      const thumb = GALLERY.find((g) => g.category === c)!;
      return (
        <button
          key={`${c}-${copy}`}
          type="button"
          onClick={() => pickCategory(c)}
          tabIndex={copy ? -1 : undefined}
          className="group flex shrink-0 items-center gap-4 px-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) md:gap-6 md:px-10"
        >
          <span className="font-['Fira_Sans_Condensed'] text-[64px] font-light leading-none text-(--ink) transition-colors duration-300 group-hover:text-(--navy) motion-reduce:transition-none md:text-[110px]">
            {c}
          </span>
          <span className="text-xs tabular-nums text-(--mute)">{pad(countOf(c))}</span>
          <img
            {...imgProps(thumb, "64px")}
            alt=""
            loading="lazy"
            decoding="async"
            className={`h-20 w-16 rounded-sm object-cover shadow-md ring-1 ring-white transition-transform duration-500 group-hover:rotate-0 group-hover:scale-115 motion-reduce:transition-none ${i % 2 ? "-rotate-6" : "rotate-6"}`}
          />
        </button>
      );
    });

  return (
    <>
      {/* ── A. INTRO: centred headline, photos scattered round it ── */}
      <section className="relative isolate overflow-hidden bg-white pb-section pt-[calc(var(--header-h)+48px)] lg:min-h-190">
        {/* Glow, top right */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 size-120 rounded-full bg-[radial-gradient(var(--navy)_0%,transparent_70%)] opacity-[0.08] blur-3xl" />

        {/* Scattered photos, lg and up */}
        {INTRO.map((item, i) => (
          <div
            key={item.src}
            className={`garment-float absolute hidden lg:block motion-reduce:animate-none ${INTRO_SPOTS[i].pos}`}
            style={{ animationDuration: `${INTRO_SPOTS[i].dur}s`, animationDelay: `${INTRO_SPOTS[i].delay}s` }}
          >
            <Card
              item={item}
              eager={i < 2}
              sizes="240px"
              className="size-full rounded-xl ring-1 ring-(--hair) transition-transform duration-500 hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              onOpen={(el) => openBox(INTRO, i, el)}
            />
          </div>
        ))}

        <div className="wrap">
          <div data-reveal className="relative z-10 mx-auto max-w-xl text-center lg:pt-16">
            <Eyebrow className="flex items-center justify-center gap-3">
              <svg aria-hidden="true" width="28" height="2" className="shrink-0 overflow-visible">
                <line x1="0" y1="1" x2="28" y2="1" className="stroke-(--navy)" strokeWidth="2" strokeDasharray="5 4" />
              </svg>
              GALLERY
            </Eyebrow>
            <h1 tabIndex={-1} className="mt-head-eyebrow font-['Fira_Sans_Condensed'] text-[56px] font-black leading-[0.95] outline-none md:text-[88px]">
              Inside
              <br />
              <span className="text-(--navy)">Ha-Meem.</span>
            </h1>
            <p className="mx-auto mt-head-intro max-w-[42ch] text-pretty text-(--mute)">
              From yarn and denim to sewing, washing and shipping: a look inside the factories, mills and people behind Ha-Meem Group.
            </p>
            <a
              href="#film"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("film");
              }}
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-(--ink) px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-(--navy) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) motion-reduce:transition-none"
            >
              <Play size={14} strokeWidth={1.75} fill="currentColor" aria-hidden="true" />
              Watch the film
            </a>
            <p className="mt-8 text-xs uppercase tracking-[0.14em] text-(--mute)">
              {GALLERY_CATEGORIES.map((c, i) => (
                <span key={c}>
                  {i > 0 && <span aria-hidden="true" className="mx-2">·</span>}
                  {c} <span className="tabular-nums text-(--ink)">{pad(countOf(c))}</span>
                </span>
              ))}
            </p>
          </div>

          {/* Below lg: the same four photos as a 2×2 grid */}
          <div className="mt-12 grid grid-cols-2 gap-4 lg:hidden">
            {INTRO.map((item, i) => (
              <Card
                key={item.src}
                item={item}
                eager={i < 2}
                sizes="50vw"
                className="aspect-[4/5] rounded-xl"
                onOpen={(el) => openBox(INTRO, i, el)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── B. CATEGORY MARQUEE ── */}
      <section aria-label="Categories" className="overflow-hidden border-y border-(--hair) bg-(--mist) py-14">
        <div className="gallery-marquee flex w-max items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8">
          {marqueeRow(false)}
          <div aria-hidden="true" className="flex items-center motion-reduce:hidden">
            {marqueeRow(true)}
          </div>
        </div>
      </section>

      {/* ── C. PHOTO WALL: bento grid ── */}
      <section ref={wallRef} id="photos" className="scroll-mt-24 bg-white section-y">
        <div className="wrap">
          <div data-reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-block rounded-full border border-(--hair) px-3 py-1 text-[11px] uppercase tracking-widest text-(--mute)">
                Browse our image collection
              </span>
              <h2 className="mt-4 font-['Fira_Sans_Condensed'] text-h2 font-black">{category === "All" ? "All photos" : category}</h2>
              <span key={category} aria-hidden="true" className="mt-4 block h-0.5 w-24 origin-left bg-(--navy) animate-[autoFill_600ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none" />
            </div>
            <div role="group" aria-label="Filter photos" className="flex flex-wrap gap-2">
              {(["All", ...GALLERY_CATEGORIES.filter((c) => c !== TOURS)] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`min-h-10 rounded-full px-4 text-xs font-semibold tracking-widest transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) motion-reduce:transition-none ${
                    category === c ? "bg-(--ink) text-white" : "border border-(--hair) text-(--ink) hover:border-(--ink)"
                  }`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => scrollToId("tours")}
                className="min-h-10 rounded-full border border-(--hair) px-4 text-xs font-semibold tracking-widest text-(--ink) transition-colors duration-300 hover:border-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) motion-reduce:transition-none"
              >
                360° TOURS ↓
              </button>
            </div>
          </div>

          <div key={category} className="mt-section-head grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
            {filtered.map((item, i) => (
              <Card
                key={item.src}
                item={item}
                sizes={i % 5 === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
                className={`gallery-in aspect-[4/3] rounded-[24px] lg:aspect-auto ${BENTO[i % 5]}`}
                style={{ animationDelay: `${i * 60}ms` }}
                onOpen={(el) => openBox(filtered, i, el)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 360° VIRTUAL TOURS ── */}
      <section id="tours" className="scroll-mt-24 bg-(--mist) section-y">
        <div className="wrap">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow className="flex items-center justify-center gap-3">
              <svg aria-hidden="true" width="28" height="2" className="shrink-0 overflow-visible">
                <line x1="0" y1="1" x2="28" y2="1" className="stroke-(--navy)" strokeWidth="2" strokeDasharray="5 4" />
              </svg>
              360° VIRTUAL TOURS
            </Eyebrow>
            <h2 className="mt-head-eyebrow font-['Fira_Sans_Condensed'] text-h2 font-black uppercase">
              Ha-Meem Group <span className="text-(--navy)">360°</span> VR tour
            </h2>
            <p className="mt-head-intro text-pretty text-(--mute)">
              Walk through our factories from anywhere: sewing, denim, knitwear and outerwear units, filmed in 360°.
            </p>
          </div>

          <div data-reveal-stagger className="mx-auto mt-section-head grid max-w-6xl gap-6 md:grid-cols-2 md:gap-8">
            {VR_TOURS.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      {/* ── D. FILM ── */}
      <section id="film" className="scroll-mt-24 bg-(--ink) text-white section-y">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div data-reveal>
            <Eyebrow>FILM</Eyebrow>
            <h2 className="mt-head-eyebrow text-balance font-['Fira_Sans_Condensed'] text-h2 font-black">{GALLERY_VIDEO.title}</h2>
            <p className="mt-head-intro max-w-[42ch] text-white/70">How RFID tags follow every bundle from cutting to the shipped carton.</p>
          </div>
          <div data-reveal className="relative aspect-video overflow-hidden rounded-sm bg-black">
            {playing ? (
              <video src={GALLERY_VIDEO.src} controls autoPlay playsInline preload="none" className="size-full object-cover">
                <track kind="captions" />
              </video>
            ) : (
              <>
                <img
                  {...imgProps({ src: GALLERY_VIDEO.poster, width: 2200, height: 1200 }, "(min-width: 1024px) 58vw, 100vw")}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover opacity-80"
                />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play film: ${GALLERY_VIDEO.title}`}
                  className="absolute left-1/2 top-1/2 grid size-18 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-(--navy) text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span aria-hidden="true" className="gallery-ring absolute inset-0 rounded-full border-2 border-white" />
                  <Play size={24} strokeWidth={1.75} fill="currentColor" aria-hidden="true" className="ml-1" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── E. LIGHTBOX ── */}
      <dialog
        ref={dialogRef}
        aria-label={current ? current.title : "Photo"}
        onClose={() => {
          setBox(null);
          openerRef.current?.focus({ preventScroll: true });
        }}
        onPointerDown={(e) => (swipeX.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeX.current === null) return;
          const dx = e.clientX - swipeX.current;
          swipeX.current = null;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        }}
        className="gallery-lightbox fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-(--ink)/96 p-0 text-white"
      >
        {box && current && (
          <div className="relative flex h-full items-center justify-center px-16 py-20 md:px-24">
            <p className="absolute left-6 top-6 text-xs tabular-nums tracking-widest text-white/80">
              {pad(box.index + 1)} / {pad(box.list.length)}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="absolute right-6 top-6 grid size-12 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
            >
              <span aria-hidden="true" className="gallery-spin absolute inset-0 rounded-full border border-dashed border-white/40" />
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>

            <img
              key={box.index}
              {...imgProps(current, "90vw")}
              alt={current.title}
              decoding="async"
              className="gallery-in max-h-[80vh] w-auto max-w-full rounded-md object-contain"
            />

            <p className="absolute bottom-6 left-6">
              <span className="block font-['Fira_Sans_Condensed'] text-2xl font-bold">{current.title}</span>
              <span className="text-xs tracking-[0.14em] text-white/70">{current.category.toUpperCase()}</span>
            </p>

            {[
              { d: -1, label: "Previous photo", Icon: ChevronLeft, side: "left-3 md:left-6" },
              { d: 1, label: "Next photo", Icon: ChevronRight, side: "right-3 md:right-6" },
            ].map(({ d, label, Icon, side }) => (
              <button
                key={d}
                type="button"
                onClick={() => step(d)}
                aria-label={label}
                className={`absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 transition-colors duration-300 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white motion-reduce:transition-none ${side}`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </dialog>
    </>
  );
}
