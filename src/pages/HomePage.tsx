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
  },
  {
    cat: "SUSTAINABILITY",
    date: "2 FEB 2025",
    title: "A 4.4 MWp rooftop plant takes group solar capacity to 12.2 MWp",
    img: "biz/textiles.jpg",
  },
  {
    cat: "RECOGNITION",
    date: "NOV 2023",
    title:
      "Refat Garments receives the Bangabandhu Sheikh Mujib Export Trophy for FY2020-21",
    img: "chain-sewing.jpg",
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
          <div className="flex h-155 md:h-168 text-white bg-(--ink) overflow-x-auto">
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
            {businesses.map((b) => (
              <Link
                to={b.to}
                key={b.title}
                className="biz-card relative h-74.5 text-white overflow-hidden p-6 transition-all duration-350 block"
              >
                <img
                  src={`${media}${b.image}`}
                  alt=""
                  className="biz-img absolute inset-0 w-full h-full object-cover transition-transform duration-350"
                />
                <span className="biz-overlay absolute inset-0 bg-linear-to-b from-[#11141828] to-[#111418dc] transition-all duration-350" />
                <span className="relative z-1 flex flex-col">
                  <b className="font-['Fira_Sans_Condensed'] text-white text-[37px]">
                    {b.stat}
                  </b>
                  <small className="text-[10px] text-white tracking-[0.13em]">
                    {b.unit}
                  </small>
                </span>
                <span className="absolute left-6 right-6 bottom-6 z-1 flex flex-col">
                  <strong className="font-['Fira_Sans_Condensed'] text-white text-[25px] mb-2">
                    {b.title}
                  </strong>
                  <small className="leading-snug text-white opacity-80 text-sm">
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
          className="relative min-h-205 md:h-218.25 bg-(--ink) text-white overflow-hidden"
        >
          <img
            src={`${media}sustain-campus.jpg`}
            alt="Ha-Meem Textiles at Mawna"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay: strong opacity + subtle blur for text contrast */}
          <div className="absolute inset-0 bg-[rgba(10,14,18,0.85)] backdrop-blur-[2px]" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
            <Eyebrow className="text-white!">SUSTAINABILITY</Eyebrow>

            <h2 className="font-['Fira_Sans_Condensed'] flex flex-col gap-8 font-black text-[48px] md:text-[61px] leading-[0.95] mt-8 mb-6">
              Cleaner water.
              <br />
              Cleaner power.
              <br />
              <span className="text-[#c5c6c8]">Measured.</span>
            </h2>

            <p className="text-[#d5d6d7] text-[17px] leading-relaxed max-w-2xl mx-auto">
              Our mills treat effluent biologically, recover process chemicals
              and put solar on factory roofs, working toward net-zero by{" "}
              {F.netZeroBy}.
            </p>

            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-4xl mx-auto">
              {SUSTAINABILITY_STATS.map((s) => {
                const [num, unit] = splitUnit(s.value);
                return (
                  <div key={s.label} className="flex flex-col items-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-['Fira_Sans_Condensed'] text-[42px] font-black leading-none">
                        {num}
                      </span>
                      {unit && (
                        <span className="text-[14px] font-normal text-[#c5c6c8]">
                          {unit}
                        </span>
                      )}
                    </div>
                    <span className="text-[#c5c6c8] text-[13px] leading-relaxed mt-3 max-w-50">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PEOPLE ── */}
        <section
          id="people"
          className="grid md:grid-cols-2 min-h-150 md:h-184 bg-(--mist)"
        >
          <div className="flex flex-col justify-center py-16 md:py-0 px-8 md:px-[7vw]">
            <Eyebrow>PEOPLE</Eyebrow>
            <h2 className="font-['Fira_Sans_Condensed'] font-black text-[48px] md:text-[62px] leading-[0.94] mt-7 mb-9">
              {F.employeesText}
              <br />
              people.<sup className="text-(--red)">*</sup>
            </h2>
            <p className="text-(--mute) max-w-107.5 leading-relaxed mb-10">
              Most of our {F.employeesText} people joined as machine
              operators. The group founded three schools for their children,
              funds scholarships, and runs a higher-education pathway with the
              Asian University for Women called Dreams Beyond the Factory Floor.
            </p>
            <Link
              className="inline-block self-start px-8 py-4 border border-(--ink) rounded-full text-xs font-semibold tracking-widest hover:bg-(--ink) hover:text-white! transition-colors duration-300"
              to="/#careers"
            >
              WORK WITH US
            </Link>
          </div>
          <img
            src={`${media}people-knit.jpg`}
            alt="A knitting technician programming a Stoll machine"
            className="w-full h-100 md:h-full object-cover"
          />
        </section>

        {/* ── NEWSROOM ── */}
        <section id="news" className="bg-white">
          <div className="wrap flex flex-col md:flex-row items-start md:items-center justify-between py-16 md:py-20 gap-4">
            <div>
              <Eyebrow>NEWSROOM</Eyebrow>
              <h2 className="font-['Fira_Sans_Condensed'] font-black text-[42px] md:text-[54px] mt-5">
                Latest from the group.
              </h2>
            </div>
            <Eyebrow className="text-(--mute)!">
              LINKS OPEN THE ORIGINAL REPORT
            </Eyebrow>
          </div>
          <div className="grid md:grid-cols-3 min-h-100 md:h-123 bg-[#e9e9e6]">
            {newsItems.map((n) => (
              <a
                key={n.title}
                className="news-card relative overflow-hidden text-white p-8 flex flex-col justify-end h-100 md:h-full group cursor-pointer"
              >
                <img
                  src={`${media}${n.img}`}
                  alt=""
                  className="news-img absolute inset-0 w-full h-full object-cover brightness-[0.55] transition-all duration-400"
                />
                <span className="relative z-1 text-[#ef7898] text-[11px] tracking-widest font-semibold">
                  {n.cat} · {n.date}
                </span>
                <strong className="news-title relative z-1 font-['Fira_Sans_Condensed'] text-white text-[22px] md:text-[26px] leading-[1.05] mt-3">
                  {n.title}
                </strong>
                <span className="absolute bottom-8 right-8 z-1 text-white/70 text-xl group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── CAREERS CTA ── */}
        <ContactCta id="careers" />
      </div>
    </>
  );
}
