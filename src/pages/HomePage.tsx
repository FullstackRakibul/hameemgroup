import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import WorldRoutes from "../WorldRoutes";
import Productcarousel from "../components/Productcarousel ";
import Eyebrow from "../components/Eyebrow";
import StatGrid from "../components/StatGrid";
import BuyerGrid from "../components/BuyerGrid";
import AwardGrid from "../components/AwardGrid";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import {
  BUYER_AWARDS,
  CERTIFICATIONS,
  F,
  GROUP_STATS,
  NATIONAL_AWARDS,
  SUSTAINABILITY_STATS,
  VIRTUAL_TOUR_URL,
  splitUnit,
} from "../data/facts";

const media = "/media/";

export const HOME_TITLE = "Ha-Meem Group | Leading Wholesale Clothing Manufacturer";
export const HOME_DESCRIPTION = `Ha-Meem Group is a leading wholesale clothing manufacturer in Bangladesh. Established in ${F.established}, we make denim fabrics and apparel, and employ ${F.employeesText} people.`;

/* ── Data ── */
const heroSlides = [
  { src: "cine/looms.jpg", alt: "Long rows of looms weaving indigo denim" },
  { src: "cine/fabric.jpg", alt: "Rolls of indigo denim fabric" },
  { src: "chain-sewing.jpg", alt: "Sewing floor at Ha-Meem garment factory" },
];

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

const awards = [...NATIONAL_AWARDS, ...BUYER_AWARDS];

const newsItems = [
  {
    cat: "TEXTILES",
    date: "1 SEP 2025",
    title: "Ha-Meem opens a new yarn-dyeing plant at Sreepur, Gazipur",
    img: "news-yarn.jpg",
    // Original report not found yet: the card shows without a link until one is added.
    url: "#",
    source: "",
  },
  {
    cat: "SUSTAINABILITY",
    date: "2 FEB 2025",
    title: "A 4.4 MWp rooftop plant takes group solar capacity to 12.2 MWp",
    img: "biz/textiles.jpg",
    url: "https://www.thedailystar.net/business/news/ha-meem-group-installs-44mwp-rooftop-solar-power-plant-3814796",
    source: "The Daily Star",
  },
  {
    cat: "RECOGNITION",
    date: "NOV 2023",
    title:
      "Refat Garments receives the Bangabandhu Sheikh Mujib Export Trophy for FY2020-21",
    img: "chain-sewing.jpg",
    url: "https://www.tbsnews.net/bangladesh/73-businesses-receive-national-export-trophy-735806",
    source: "The Business Standard",
  },
];

// Built once, outside the component, so the carousel is not re-rendered on scroll.
const productSlides = products.map(([title, text, image]) => ({
  title,
  text,
  image: `${media}products/${image}`,
}));

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  usePageMeta(HOME_TITLE, HOME_DESCRIPTION, true);

  // Hero slider auto-advance
  const advanceSlide = useCallback(() => {
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (heroPaused) return;
    heroTimerRef.current = setInterval(advanceSlide, 6000);
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    };
  }, [heroPaused, advanceSlide]);

  const prevSlide = () =>
    setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () =>
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  const togglePause = () => setHeroPaused((p) => !p);

  return (
    <>
      {/* ═══ HERO with KEN BURNS SLIDER ═══ */}
      <section
        id="top"
        className="relative h-screen min-h-180 max-h-250 overflow-hidden text-white bg-(--ink)"
      >
        {heroSlides.map((slide, i) => (
          <img
            key={slide.src + i}
            src={`${media}${slide.src}`}
            alt={slide.alt}
            className={`hero-slide ${heroSlide === i ? "active" : ""}`}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-b from-[rgba(5,12,17,0.48)] via-[rgba(5,12,17,0.23)] to-[rgba(5,12,17,0.56)]" />
        <div className="absolute z-2 left-1/2 top-1/2 -translate-x-1/2 translate-y-[-43%]">
          <h1
            tabIndex={-1}
            className="font-['Fira_Sans_Condensed'] text-[clamp(52px,8vw,98px)] leading-[0.97] tracking-[-0.035em] font-semibold text-center"
          >
            Wholesale clothing
            <br />
            manufacturer in Bangladesh.
          </h1>
        </div>
        <p className="hero-caption-text absolute left-1/2 -translate-x-1/2 bottom-10 z-2 text-xs opacity-75">
          From fibre to finish — Ha-Meem Group
        </p>
        <div className="hero-controls-wrap absolute right-46.25 bottom-8 z-2 flex gap-2">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="border border-white/50 bg-[#11141826] text-white rounded-full w-10.5 h-10.5"
          >
            ←
          </button>
          <button
            onClick={togglePause}
            aria-label={heroPaused ? "Play slideshow" : "Pause slideshow"}
            className="border border-white/50 bg-[#11141826] text-white rounded-full w-10.5 h-10.5"
          >
            {heroPaused ? "▶" : "Ⅱ"}
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="border border-white/50 bg-[#11141826] text-white rounded-full w-10.5 h-10.5"
          >
            →
          </button>
        </div>
      </section>

      {/* ═══ RAISED CONTENT ═══ */}
      <div className="relative z-3 shadow-[0_-35px_70px_#00000040]">
        {/* ── FOUNDED IN 1984 ── */}
        <section id="company" className="bg-white py-24 md:py-32">
          <div className="wrap text-center flex flex-col gap-3 justify-center items-center">
            <Eyebrow>FOUNDED IN {F.established}</Eyebrow>
            <h2 className="font-['Fira_Sans_Condensed'] text-justify subpixel-antialiased font-black text-[30px] md:text-[38px] leading-[1.18]  mt-16 max-w-300 mx-auto">
              Ha-Meem Group is one of Bangladesh&apos;s largest vertically
              integrated apparel manufacturers. From our own yarn and denim to
              sewing, washing, trims and shipping, we make bottoms, tops,
              denim and sweaters for the world&apos;s leading retailers.
            </h2>
            <StatGrid stats={GROUP_STATS} className="mt-16 pt-10 border-t border-(--hair)" />
          </div>
        </section>

        {/* ── WHERE WE ARE ── */}
        <section className="bg-white border-t border-(--hair) py-24 md:py-32 relative overflow-hidden">
          <div className="wrap">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Eyebrow>WHERE WE ARE</Eyebrow>
                <h2 className="font-['Fira_Sans_Condensed'] text-[48px] md:text-[64px] leading-[0.98] font-semibold mt-20">
                  From Bangladesh
                  <br />
                  to the world.
                </h2>
              </div>
              <p className="text-(--mute) text-base leading-relaxed self-end max-w-107.5 md:justify-self-end">
                Every factory sits within an hour of Dhaka, with sourcing
                offices in Hong Kong and Shanghai. Around ninety-five percent
                of what we make ships to the United States, the rest to
                Europe, Japan and India.
              </p>
            </div>
            <WorldRoutes className="mt-16" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-12 gap-8">
              <p className="max-w-117.5 text-(--mute) text-sm leading-relaxed">
                Today the group employs {F.employeesText} people across{" "}
                {F.factories} garment factories, {F.productionLines} production
                lines and seven washing plants, making {F.garmentsYear}{" "}
                readymade garments a year. Denim production is{" "}
                {F.denimYardsMonth} yards a month.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-full text-[11px] tracking-[0.07em] font-semibold text-(--red)">
                  <span
                    className="inline-block size-2 rounded-full bg-(--red)"
                    aria-hidden="true"
                  />
                  BANGLADESH
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-full text-[11px] tracking-[0.07em] font-semibold">
                  <span
                    className="inline-block size-2 rounded-full bg-(--navy)"
                    aria-hidden="true"
                  />
                  SOURCING OFFICES
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-full text-[11px] tracking-[0.07em] font-semibold">
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
        <section className="bg-white py-24 md:py-32">
          <div className="wrap">
            <div className="text-center flex flex-col items-center justify-center">
              <Eyebrow>OUR BUYERS</Eyebrow>
              <h3 className="font-['Fira_Sans_Condensed'] mx-auto mt-4 max-w-[22ch] text-[clamp(1.9rem,3vw,2.8rem)] font-black leading-[1.02] text-balance">
                Retailers and brands we manufacture for.
                <sup className="relative top-[-0.1em] ml-[0.08em] align-top text-[0.42em] leading-none text-(--color-red)">
                  *
                </sup>
              </h3>
            </div>
            <BuyerGrid className="mt-10" />
          </div>
        </section>

        {/* ── PRODUCTS (3D carousel) ── */}
        <section
          id="products"
          className="bg-(--mist) pt-24 md:pt-28 pb-16 md:pb-20"
        >
          <div className="wrap flex flex-col md:flex-row justify-between md:items-end gap-8 pb-6 md:pb-8">
            <div>
              <Eyebrow>WHAT WE MAKE</Eyebrow>
              <h2 className="font-['Fira_Sans_Condensed'] font-black text-[42px] md:text-[58px] leading-[0.96] mt-7">
                Bottoms, tops,
                <br />
                denim and sweaters.
              </h2>
            </div>
            <p className="max-w-107.5 text-(--mute) text-base leading-relaxed">
              From fashionable denim fabrics to wholesale apparel, Ha-Meem
              makes bottoms, tops and sweaters for global fashion brands, with
              products ranging from infant to adult sizes.
            </p>
          </div>
          <Productcarousel items={productSlides} label="What we make" />
          {VIRTUAL_TOUR_URL && (
            <div className="wrap mt-10 flex justify-center">
              <a
                href={VIRTUAL_TOUR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 border border-(--ink) rounded-full text-xs font-semibold tracking-widest hover:bg-(--ink) hover:text-white! transition-colors duration-300"
              >
                TAKE A VIRTUAL TOUR OF HA-MEEM GROUP
              </a>
            </div>
          )}
        </section>

{/* ── VERTICAL INTEGRATION (Steps accordion) ── */}
<section id="chain" className="bg-white pt-24 md:pt-28">
  <div className="wrap flex flex-col md:flex-row justify-between md:items-end gap-8 pb-12">
    <div>
      <Eyebrow>VERTICAL INTEGRATION</Eyebrow>
      <h2 className="font-['Fira_Sans_Condensed'] font-black text-[42px] md:text-[58px] leading-none mt-6">
        Six steps, all ours.
      </h2>
    </div>
    <p className="max-w-97.5 text-(--mute) leading-relaxed">
      From yarn and denim fabric to finished garments, seven washing
      plants and export-ready apparel, integrated facilities connect
      each stage of production.
    </p>
  </div>
  {/* Desktop and tablet (768px and up): horizontal accordion, unchanged */}
  <div className="hidden md:flex h-155 md:h-168 text-white bg-(--ink) overflow-x-auto">
    {steps.map((item, i) => (
      <button
        key={item.title}
        className={`step-panel relative border-0 border-r-2 border-white text-white bg-transparent p-6 text-left bg-cover bg-center overflow-hidden cursor-pointer ${
          step === i ? "step-open flex-[1_1_50%]" : "flex-[0_0_10%]"
        }`}
        style={{
          backgroundImage: `url("${media}${item.image}")`,
        }}
        onClick={() => setStep(i)}
        onMouseEnter={() => setStep(i)}
      >
        {/* Overlay: Light for active (image clear), Darker for collapsed (60% opacity) */}
        <span
          className={`absolute inset-0 transition-all duration-500 ${
            step === i
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
              <em className="text-(--red) not-italic text-xs font-semibold tracking-widest">
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
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 motion-reduce:transition-none ${
                open ? "opacity-0" : "opacity-100"
              }`}
              style={{ backgroundImage: `url("${media}${item.image}")` }}
            />
            <span aria-hidden="true" className="absolute inset-0 bg-[rgba(17,20,24,0.62)]" />
            <span
              className={`relative z-1 w-6 shrink-0 text-sm font-semibold tabular-nums ${
                open ? "text-[#ef7898]" : "text-white/70"
              }`}
            >
              {num}
            </span>
            <span className="relative z-1 flex-1 font-['Fira_Sans_Condensed'] text-[22px] font-bold leading-tight text-white">
              {item.title}
            </span>
            <svg
              aria-hidden="true"
              width="14"
              height="8"
              viewBox="0 0 14 8"
              className={`relative z-1 shrink-0 text-white transition-transform duration-300 motion-reduce:transition-none ${
                open ? "rotate-180" : ""
              }`}
            >
              <path d="M1 1l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>

          {/* Grid rows 0fr → 1fr animates to the content's natural height */}
          <div
            id={`chain-panel-${i}`}
            role="region"
            aria-labelledby={`chain-step-${i}`}
            inert={!open}
            className={`grid transition-[grid-template-rows] duration-500 ease-in-out motion-reduce:transition-none ${
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
<section id="businesses" className="wrap py-24 md:py-28">
  <div className="text-center max-w-155 mx-auto">
    <Eyebrow>WHAT WE DO</Eyebrow>
    <h2 className="font-['Fira_Sans_Condensed'] font-black text-[42px] md:text-[59px] leading-[0.94] mt-7 mb-7">
      One group, from yarn
      <br />
      to shipped carton.
    </h2>
    <p className="text-(--mute) text-base leading-relaxed">
      Every unit upstream of a sewing line exists to make that line
      faster and more reliable. Around the apparel chain sit media,
      jute, tea and logistics.
    </p>
  </div>
  <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {businesses.map((b, i) => (
      <Link
        to={b.to}
        key={b.title}
        className="biz-card group relative block h-74.5 overflow-hidden p-6 text-white transition-all duration-350 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--red) motion-reduce:transition-none"
      >
        <img
          src={`${media}${b.image}`}
          alt=""
          className="biz-img absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none"
        />
        <span className="biz-overlay absolute inset-0 bg-linear-to-b from-[#11141828] to-[#111418dc] transition-all duration-350" />

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
          className="absolute right-6 top-6 z-1 flex h-11 items-center rounded-full border border-white/60 bg-[#11141833] text-white backdrop-blur-sm transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-(--ink) group-focus-visible:border-white group-focus-visible:bg-white group-focus-visible:text-(--ink) motion-reduce:transition-none"
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

        <span className="relative z-1 flex flex-col pr-14">
          <b className="font-['Fira_Sans_Condensed'] text-white text-[37px] leading-none">
            {b.stat}
          </b>
          <small className="mt-2 text-[10px] text-white tracking-[0.13em]">
            {b.unit}
          </small>
        </span>

        <span className="absolute left-6 right-6 bottom-6 z-1 flex flex-col">
          <strong className="font-['Fira_Sans_Condensed'] text-white text-[25px] leading-tight">
            {b.title}
          </strong>
          {/* A short red rule that grows on hover: the eyebrow's colour, used once */}
          <span
            aria-hidden="true"
            className="mt-2 mb-3 h-0.5 w-8 bg-(--red) transition-[width] duration-500 ease-out group-hover:w-16 group-focus-visible:w-16 motion-reduce:transition-none"
          />
          <small className="line-clamp-3 text-sm leading-snug text-white/80 transition-colors duration-300 group-hover:text-white">
            {b.text}
          </small>
        </span>
      </Link>
    ))}
  </div>
  <p className="text-center text-(--mute) text-[13px] mt-12">
    Tiles open the group&apos;s own pages for each unit.
  </p>
</section>

        {/* ── RECOGNITION & AWARDS ── */}
        <section id="recognition" className="bg-(--mist) py-24 md:py-28">
          <div className="wrap">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
              <div>
                <Eyebrow>RECOGNITION</Eyebrow>
                <h2 className="font-['Fira_Sans_Condensed'] font-black text-[42px] md:text-[54px] leading-[0.98] mt-16">
                  Judged by the people
                  <br />
                  who buy from us.
                </h2>
              </div>
              <p className="max-w-107.5 text-(--mute) leading-relaxed">
                Two national export trophies in a row, and quality and
                technical awards from the retailers whose audits we pass every
                season.
              </p>
            </div>
            <AwardGrid awards={awards} className="mt-20" />
            {/* Accreditations & certifications */}
            <div className="border-t border-(--hair) mt-9 pt-10 grid md:grid-cols-[260px_1fr] gap-6">
              <Eyebrow>
                Accreditations &amp; certifications<sup className="text-(--red)">*</sup>
              </Eyebrow>
              <div className="flex flex-wrap gap-3">
                {CERTIFICATIONS.map((c) => (
                  <span
                    key={c.abbr}
                    className="bg-white border border-(--hair) rounded-full px-4 py-2.5 text-(--mute) text-xs"
                  >
                    <b className="text-(--ink) mr-2 font-semibold">{c.abbr}</b>
                    {c.name}
                  </span>
                ))}
                <span className="bg-white border border-(--hair) rounded-full px-4 py-2.5 text-(--mute) text-xs">
                  <b className="text-(--ink) mr-2 font-semibold">LAB</b>
                  {F.laboratory}
                </span>
              </div>
            </div>
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
  {/* Overlay: darkest behind the heading, a little more photo at the edges */}
  <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(10,14,18,0.9)_0%,rgba(10,14,18,0.82)_55%,rgba(10,14,18,0.72)_100%)] backdrop-blur-[2px]" />

  <div className="wrap flex flex-col items-center pt-28 pb-24 text-center md:pt-36 md:pb-32">
    <Eyebrow className="text-white!">SUSTAINABILITY</Eyebrow>

    <h2 className="pt-6 font-['Fira_Sans_Condensed'] text-[48px] font-black leading-[0.95] md:text-[64px]">
      Cleaner water.
      <br />
      Cleaner power.
      <br />
      <span className="text-[#c5c6c8]">Measured.</span>
    </h2>

    <p className="max-w-[52ch] pt-7 text-[17px] leading-relaxed text-[#d5d6d7]">
      Our mills treat effluent biologically, recover process chemicals
      and put solar on factory roofs, working toward net-zero by{" "}
      {F.netZeroBy}.
    </p>

    {/* Four measured results. Hairline grid: the 1px gaps show the
        container's tint, so rows and columns line up on every width. */}
    <ul className="mt-16 grid w-full max-w-5xl auto-rows-fr grid-cols-2 gap-px border border-white/15 bg-white/15 md:mt-20 lg:grid-cols-4">
      {SUSTAINABILITY_STATS.map((s, i) => {
        const [num, unit] = splitUnit(s.value);
        return (
          <li
            key={s.label}
            className="group relative flex flex-col items-center justify-center bg-[rgba(10,14,18,0.55)] px-3 py-10 transition-colors duration-300 hover:bg-[rgba(255,255,255,0.06)] motion-reduce:transition-none sm:px-6 md:py-12"
          >
            {/* Stitched seam, sewn round the tile on hover; always shown on touch screens */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] overflow-visible"
            >
              <defs>
                <mask id={`eco-stitch-${i}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    pathLength={1}
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-900 motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0] [@media(hover:none)]:transition-none"
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
                strokeOpacity="0.7"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                mask={`url(#eco-stitch-${i})`}
              />
            </svg>

            <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
              <span className="font-['Fira_Sans_Condensed'] text-[40px] font-black leading-none sm:text-[52px]">
                {num}
              </span>
              {unit && (
                <span className="text-[15px] font-medium text-[#c5c6c8] transition-colors duration-300 group-hover:text-white">
                  {unit}
                </span>
              )}
            </div>
            {/* Red rule that stretches on hover, as on the business cards */}
            <span
              aria-hidden="true"
              className="mt-4 h-0.5 w-6 bg-(--red) transition-[width] duration-500 ease-out group-hover:w-12 motion-reduce:transition-none"
            />
            <span className="mt-4 max-w-[24ch] text-balance text-[13px] font-semibold uppercase leading-snug tracking-[0.12em] text-[#c5c6c8] transition-colors duration-300 group-hover:text-white">
              {s.label}
            </span>
          </li>
        );
      })}
    </ul>
  </div>
</section>

{/* ── PEOPLE ── */}
<section id="people" className="grid bg-(--mist) md:min-h-184 md:grid-cols-2">
  <div className="flex flex-col justify-center px-5 py-20 sm:px-8 md:px-[7vw] md:py-24">
    <Eyebrow>PEOPLE</Eyebrow>
    {/* index.css zeroes margins on h2 and p, so these are spaced with padding */}
    <h2 className="pt-7 font-['Fira_Sans_Condensed'] text-[48px] font-black leading-[0.94] md:text-[62px]">
      {F.employeesText}
      <br />
      people.<sup className="text-(--red)">*</sup>
    </h2>
    <p className="max-w-107.5 pt-6 leading-relaxed text-(--mute)">
      Most of our {F.employeesText} people joined as machine operators.
    </p>

    {/* The three programmes, one per row, so they can be scanned */}
    <ul className="mt-8 max-w-107.5 border-t border-(--hair)">
      {[
        { title: "Three schools", text: "Founded by the group for its workers' children." },
        { title: "Scholarships", text: "Funded by the group." },
        {
          title: "Dreams Beyond the Factory Floor",
          text: "A higher-education pathway with the Asian University for Women.",
        },
      ].map((item) => (
        <li key={item.title} className="group relative border-b border-(--hair) py-4 pl-5">
          <span
            aria-hidden="true"
            className="absolute left-0 top-4 bottom-4 w-0.5 origin-top scale-y-50 bg-(--red) transition-transform duration-300 group-hover:scale-y-100 motion-reduce:transition-none"
          />
          <b className="block font-['Fira_Sans_Condensed'] text-[20px] font-bold leading-tight text-(--ink)">
            {item.title}
          </b>
          <span className="mt-1 block text-sm leading-snug text-(--mute)">{item.text}</span>
        </li>
      ))}
    </ul>

    <Link
      to="/#careers"
      className="group/cta mt-10 inline-flex items-center gap-3 self-start rounded-full border border-(--ink) px-8 py-4 text-xs font-semibold tracking-widest transition-colors duration-300 hover:bg-(--ink) hover:text-white! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--red) motion-reduce:transition-none"
    >
      WORK WITH US
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover/cta:translate-x-1 motion-reduce:transition-none"
      >
        →
      </span>
    </Link>
  </div>

  <figure className="group relative m-0 min-h-100 overflow-hidden md:min-h-0">
    <img
      src={`${media}people-knit.jpg`}
      alt=""
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
    {/* Stitched seam, sewn round the photo on hover; always shown on touch screens */}
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-4 h-[calc(100%-32px)] w-[calc(100%-32px)] overflow-visible md:inset-6 md:h-[calc(100%-48px)] md:w-[calc(100%-48px)]"
    >
      <defs>
        <mask id="people-stitch" maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
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
        fill="none"
        stroke="white"
        strokeOpacity="0.85"
        strokeWidth="1.5"
        strokeDasharray="8 6"
        mask="url(#people-stitch)"
      />
    </svg>
    <figcaption className="absolute bottom-8 left-8 right-8 md:bottom-10 md:left-10 md:right-auto">
      <span className="inline-block bg-[rgba(17,20,24,0.78)] px-3 py-2 text-xs leading-snug text-white backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
        A knitting technician programming a Stoll machine
      </span>
    </figcaption>
  </figure>
</section>

        
{/* ── NEWSROOM ── */}
<section id="news" className="bg-white">
  <div className="wrap flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 py-16 md:py-20">
    <div>
      <Eyebrow>NEWSROOM</Eyebrow>
      {/* index.css zeroes margins on h2, so it is spaced with padding */}
      <h2 className="pt-5 font-['Fira_Sans_Condensed'] text-[42px] font-black leading-none md:text-[54px]">
        Latest from the group.
      </h2>
    </div>
    {newsItems.some((n) => n.url) && (
      <Eyebrow className="text-(--mute)!">LINKS OPEN THE ORIGINAL REPORT</Eyebrow>
    )}
  </div>
 
  <div className="grid gap-px bg-white sm:grid-cols-2 lg:h-123 lg:grid-cols-3">
    {newsItems.map((n, i) => {
      const linked = Boolean(n.url);
      const body = (
        <>
          <img
            src={`${media}${n.img}`}
            alt=""
            className="news-img absolute inset-0 h-full w-full object-cover brightness-[0.55] transition-all duration-500 ease-out motion-reduce:transition-none"
          />
          {/* Darker at the foot, where the headline sits */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-[rgba(10,14,18,0.9)] via-[rgba(10,14,18,0.2)] to-[rgba(10,14,18,0.35)]"
          />
 
          {linked && (
            /* Stitched seam, sewn round the card on hover or keyboard focus;
               always shown on touch screens. Only linked cards get it. */
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)] overflow-visible"
            >
              <defs>
                <mask id={`news-stitch-${i}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    pathLength={1}
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-1000 group-focus-visible:[stroke-dashoffset:0] motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0] [@media(hover:none)]:transition-none"
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
                strokeOpacity="0.8"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                mask={`url(#news-stitch-${i})`}
              />
            </svg>
          )}
 
          {/* Top: category chip and date */}
          <span className="relative z-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="rounded-full border border-[#ef7898]/60 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#ef7898]">
              {n.cat}
            </span>
            <span className="text-[11px] font-semibold tracking-widest text-white/75">{n.date}</span>
          </span>
 
          {/* Bottom: headline, then source and the open button */}
          <span className="relative z-1 mt-auto flex flex-col">
            <strong className="news-title font-['Fira_Sans_Condensed'] text-[24px] font-bold leading-[1.08] text-white text-balance md:text-[28px]">
              {n.title}
            </strong>
            <span
              aria-hidden={!linked || undefined}
              className={`mt-5 flex items-center justify-between gap-4 border-t pt-4 ${
                linked ? "border-white/20" : "invisible border-transparent"
              }`}
            >
                <span className="text-[11px] font-semibold tracking-[0.14em] text-white/70 transition-colors duration-300 group-hover:text-white">
                  {n.source.toUpperCase() || "\u00a0"}
                </span>
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-white/60 text-white transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-(--ink) group-focus-visible:bg-white group-focus-visible:text-(--ink) motion-reduce:transition-none"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  >
                    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
            </span>
          </span>
        </>
      );
      const cardClass = `relative flex h-100 flex-col overflow-hidden p-7 text-white lg:h-full lg:p-8 ${
        i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
      }`;
      return linked ? (
        <a
          key={n.title}
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`news-card group ${cardClass} focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white`}
        >
          {body}
          <span className="sr-only"> (opens the report on {n.source} in a new tab)</span>
        </a>
      ) : (
        <article key={n.title} className={cardClass}>
          {body}
        </article>
      );
    })}
  </div>
</section>

        {/* ── CAREERS CTA ── */}
        <ContactCta id="careers" />
      </div>
    </>
  );
}
