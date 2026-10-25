import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import usePageMeta from "../components/usePageMeta";
import { GALLERY, GALLERY_CATEGORIES, GALLERY_VIDEO, type GalleryCategory, type GalleryItem } from "../data/gallery";

const media = "/media/";
const remote = (src: string) => src.startsWith("http");

/** src, srcSet, sizes and dimensions for one gallery image */
function imgProps(item: GalleryItem, sizes: string, large = false) {
  const width = item.width ?? 1600;
  const height = item.height ?? 1200;
  if (remote(item.src)) return { src: item.src, width, height };
  const base = `${media}${item.src}`;
  return {
    src: `${base}-${large ? 1600 : 800}.webp`,
    srcSet: `${base}-800.webp 800w, ${base}-1600.webp 1600w`,
    sizes,
    width,
    height,
  };
}
//image
const pad = (n: number) => String(n).padStart(2, "0");
const countOf = (c: GalleryCategory) => GALLERY.filter((g) => g.category === c).length;
const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth");

/* A photo card: image, and a caption that fades in on hover (always shown on touch) */
function Card({ item, tall, eager = false, sizes, onOpen }: { item: GalleryItem; tall: boolean; eager?: boolean; sizes: string; onOpen: (el: HTMLButtonElement) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`Open ${item.title}`}
      className={`group relative block w-full overflow-hidden rounded-sm bg-(--hair) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--red) ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
    >
      <img
        {...imgProps(item, sizes)}
        alt={item.title}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-(--ink)/70 to-transparent px-4 pb-3 pt-12 text-left text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
        <span className="font-semibold">{item.title}</span>
        <span className="text-white/80">{item.category}</span>
      </span>
    </button>
  );
}

export default function GalleryPage() {
  usePageMeta(
    "Gallery",
    "Photos and film from inside Ha-Meem Group: denim mills, garment factories, virtual tours and the people behind the group.",
  );

  const [category, setCategory] = useState<GalleryCategory | "All">("All");
  const [box, setBox] = useState<{ list: GalleryItem[]; index: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const wallRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const swipeX = useRef<number | null>(null);

  const filtered = category === "All" ? GALLERY : GALLERY.filter((g) => g.category === category);
  const intro = GALLERY.slice(0, 6);

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

  const pickCategory = (c: GalleryCategory) => {
    setCategory(c);
    wallRef.current?.scrollIntoView({ behavior: smooth(), block: "start" });
  };

  const current = box ? box.list[box.index] : null;
  const cols = [filtered.filter((_, i) => i % 2 === 0), filtered.filter((_, i) => i % 2 === 1)];

  const marqueeRow = (copy: boolean) =>
    GALLERY_CATEGORIES.map((c, i) => {
      const thumb = GALLERY.find((g) => g.category === c)!;
      return (
        <button
          key={`${c}-${copy}`}
          type="button"
          onClick={() => pickCategory(c)}
          tabIndex={copy ? -1 : undefined}
          className="group flex shrink-0 items-center gap-4 px-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--red) md:gap-6 md:px-10"
        >
          <span className="font-['Fira_Sans_Condensed'] text-[64px] font-light leading-none text-(--ink) transition-colors duration-300 group-hover:text-(--red) motion-reduce:transition-none md:text-[110px]">
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
      {/* ── A. INTRO ── */}
      <section className="relative isolate overflow-hidden bg-white pb-section pt-[calc(var(--header-h)+48px)]">
        {/* Glow, top right */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[480px] rounded-full bg-[radial-gradient(var(--red)_0%,transparent_70%)] opacity-[0.08] blur-3xl" />

        <div className="wrap grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div data-reveal className="self-start lg:sticky lg:top-28">
            <Eyebrow className="flex items-center gap-3">
              <svg aria-hidden="true" width="28" height="2" className="shrink-0 overflow-visible">
                <line x1="0" y1="1" x2="28" y2="1" className="stroke-(--red)" strokeWidth="2" strokeDasharray="5 4" />
              </svg>
              GALLERY
            </Eyebrow>
            <h1 tabIndex={-1} className="mt-head-eyebrow font-['Fira_Sans_Condensed'] text-[56px] font-black leading-[0.95] outline-none md:text-[88px]">
              Inside
              <br />
              <span className="text-(--red)">Ha-Meem.</span>
            </h1>
            <p className="mt-head-intro max-w-[42ch] text-pretty text-(--mute)">
              From yarn and denim to sewing, washing and shipping: a look inside the factories, mills and people behind Ha-Meem Group.
            </p>
            <a
              href="#film"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("film")?.scrollIntoView({ behavior: smooth() });
              }}
              className="group mt-8 inline-flex items-center gap-4 text-xs font-semibold tracking-widest text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--red)"
            >
              WATCH THE FILM
              <span aria-hidden="true" className="flex items-center text-(--red)">
                <span className="h-px w-16 bg-current transition-[width] duration-500 ease-out group-hover:w-22 motion-reduce:transition-none" />
                <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" className="-ml-2" />
              </span>
            </a>
            <ul className="mt-10 grid max-w-xs grid-cols-2 gap-x-6 gap-y-2 text-xs tracking-[0.14em] text-(--mute)">
              {GALLERY_CATEGORIES.map((c) => (
                <li key={c} className="flex justify-between border-b border-(--hair) pb-2">
                  <span className="uppercase">{c}</span>
                  <span className="tabular-nums text-(--ink)">{pad(countOf(c))}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* Thin red arc across the bottom-left corner */}
            <svg aria-hidden="true" viewBox="0 0 400 300" fill="none" className="pointer-events-none absolute -bottom-16 -left-20 -z-10 w-[420px]">
              <path d="M10 290 C 40 120, 220 20, 390 60" className="stroke-(--red)/50" strokeWidth="1" />
            </svg>
            <div data-reveal-stagger className="grid grid-cols-2 gap-4 md:gap-6">
              {[0, 1].map((col) => (
                <div key={col} className={`flex flex-col gap-4 md:gap-6 ${col ? "mt-24" : ""}`}>
                  {intro
                    .map((item, i) => ({ item, i }))
                    .filter(({ i }) => i % 2 === col)
                    .map(({ item, i }) => (
                      <Card
                        key={item.src}
                        item={item}
                        tall={Math.floor(i / 2) % 2 === col}
                        eager={i < 2}
                        sizes="(min-width: 1024px) 30vw, 50vw"
                        onOpen={(el) => openBox(GALLERY, i, el)}
                      />
                    ))}
                </div>
              ))}
            </div>
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

      {/* ── C. PHOTO WALL ── */}
      <section ref={wallRef} id="photos" className="scroll-mt-24 overflow-hidden bg-white section-y">
        <div className="wrap grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div data-reveal className="self-start lg:sticky lg:top-28">
            <p className="flex items-start gap-3">
              <span className="font-['Fira_Sans_Condensed'] text-[64px] font-black leading-none md:text-[96px]">{category}</span>
              <span className="pt-2 text-xs tabular-nums text-(--mute)">{pad(filtered.length)}</span>
            </p>
            <div role="group" aria-label="Filter photos" className="mt-8 flex flex-wrap gap-2">
              {(["All", ...GALLERY_CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`min-h-10 rounded-full px-4 text-xs font-semibold tracking-widest transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--red) motion-reduce:transition-none ${
                    category === c ? "bg-(--ink) text-white" : "border border-(--hair) text-(--ink) hover:border-(--ink)"
                  }`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div key={category} className="gallery-in grid grid-cols-2 gap-4 md:gap-6 lg:py-10">
            {cols.map((list, col) => (
              <div key={col} className={`flex flex-col gap-4 md:gap-6 ${col ? "gallery-wall-down mt-12" : "gallery-wall-up"}`}>
                {list.map((item, k) => {
                  const index = k * 2 + col;
                  return (
                    <Card
                      key={item.src}
                      item={item}
                      tall={(k + col) % 2 === 0}
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      onOpen={(el) => openBox(filtered, index, el)}
                    />
                  );
                })}
              </div>
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
                  {...imgProps({ src: GALLERY_VIDEO.poster, title: "", category: "Denim", width: 1600, height: 900 }, "(min-width: 1024px) 58vw, 100vw")}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover opacity-80"
                />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play film: ${GALLERY_VIDEO.title}`}
                  className="absolute left-1/2 top-1/2 grid size-18 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-(--red) text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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
              {...imgProps(current, "90vw", true)}
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
