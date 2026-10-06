import { useState, useEffect, useRef, useCallback } from "react";
import Preloader from "./Preloader";
import WorldRoutes from "./WorldRoutes";
import SiteHeader from "./SiteHeader";
import { AiAssistant } from "./features/ai-assistant";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const media = "/media/";

/* ── Data ── */
const heroSlides = [
  { src: "cine/looms.jpg", alt: "Long rows of looms weaving indigo denim" },
  { src: "cine/fabric.jpg", alt: "Rolls of indigo denim fabric" },
  { src: "chain-sewing.jpg", alt: "Sewing floor at Ha-Meem garment factory" },
];

const stats = [
  {
    value: "1984",
    label: "FOUNDED",
    sub: "Founded as one garment factory in Dhaka",
  },
  {
    value: "26*",
    label: "FACTORIES",
    sub: "Garment factories in six locations",
  },
  { value: "400", label: "LINES", sub: "Woven production lines" },
  {
    value: "120M",
    label: "GARMENTS / YEAR",
    sub: "Readymade garments, infant to adult",
  },
  {
    value: "142M",
    label: "PCS WASHED / YEAR",
    sub: "Across seven laundries, 120 laser machines",
  },
  { value: "75,000+", label: "PEOPLE", sub: "Working across the group" },
];

const buyers = [
  "gap",
  "hm",
  "zara",
  "pvh",
  "kohls",
  "jcpenney",
  "next",
  "mango",
  "american-eagle",
  "abercrombie",
  "tommy",
  "esprit",
  "lindex",
  "vf",
  "napapijri",
  "tom-tailor",
  "reitmans",
  "oshkosh",
  "levis",
  "calvin-klein",
  "lee",
  "carters",
  "dickies",
  "banana-republic",
  "muji",
  "vans",
  "s-oliver",
  "aeon",
  "timberland",
  "wrangler",
];

const products = [
  [
    "DENIM JEANS",
    "Hi-fashion denim with critical washes, laser finish and 3D whisker",
    "jeans.jpg",
  ],
  ["BOTTOMS & CARGOS", "", "bottoms.jpg"],
  ["SHIRTS & DRESS PANTS", "", "shirts.jpg"],
  ["OUTERWEAR & JACKETS", "", "showroom.jpg"],
  ["SWEATERS", "", "sweaters.jpg"],
  ["DENIM FABRIC", "", "fabric.jpg"],
];

const steps = [
  {
    title: "Spinning",
    text: "Cotton becomes yarn in our own spinning mills at Mawna, with rotor spinning and yarn dyeing added since.",
    stat: "100 MT",
    unit: "YARN SPUN A DAY",
    image: "chain-spinning.jpg",
  },
  {
    title: "Weaving & dyeing",
    text: "Ha-Meem Denim produces rope-dyed and slasher-dyed denim fabric, with monthly production of around four million metres.",
    stat: "4M m",
    unit: "DENIM A MONTH",
    image: "chain-fabric.jpg",
  },
  {
    title: "Cutting & sewing",
    text: "Automatic spreading and cutting across 26 garment factories, supported by 300 production lines.",
    stat: "7M pcs",
    unit: "GARMENTS A MONTH",
    image: "chain-sewing.jpg",
  },
  {
    title: "Washing & finishing",
    text: "Seven washing plants support garment finishing, with processes including ozone, laser, over-dye, dip-dye and 3D whisker.",
    stat: "7",
    unit: "WASHING PLANTS",
    image: "chain-wash.jpg",
  },
  {
    title: "Trims & packaging",
    text: "Labels, elastic, twill tape, buttons, zips and hangers made in-house, then export cartons and poly bags from our own plants.",
    stat: "3.5M",
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
  [
    "300",
    "PRODUCTION LINES",
    "Woven garments",
    "Around 50,000 people make apparel across 26 garment factories, with capacity of about seven million pieces each month.",
    "biz/woven.jpg",
  ],
  [
    "4M",
    "METRES A MONTH",
    "Denim mill",
    "Rope-dyed and slasher-dyed denim fabric made for fashion brands at Ha-Meem Denim.",
    "biz/denim.jpg",
  ],
  [
    "100 MT",
    "YARN A DAY",
    "Spinning & textiles",
    "Ring and rotor yarn, woven non-denim fabric and, since 2025, yarn dyeing at Sreepur.",
    "biz/spinning.jpg",
  ],
  [
    "7",
    "WASHING PLANTS",
    "Washing & finishing",
    "Seven plants support garment finishing across the group's integrated manufacturing operations.",
    "biz/laundry.jpg",
  ],
  [
    "400",
    "STOLL MACHINES",
    "Sweaters",
    "Computerised flat-knitting at Kashimpur and Ashulia, about 400,000 pieces a month.",
    "biz/sweater.jpg",
  ],
  [
    "800",
    "SAMPLES A DAY",
    "Design & sampling",
    "In-house designers, CAD and a 500-machine sample room turn a brief into a counter sample.",
    "biz/design.jpg",
  ],
  [
    "40",
    "EMBROIDERY MACHINES",
    "Embroidery, printing & trims",
    "Forty embroidery heads, screen and digital print, labels, elastic, belts and narrow fabric.",
    "biz/embroidery.jpg",
  ],
  [
    "100%",
    "EXPORT-ORIENTED",
    "Packaging",
    "Export cartons, poly bags and printed paper trims so every order ships complete.",
    "biz/packaging.jpg",
  ],
  [
    "2005",
    "SAMAKAL FOUNDED",
    "Beyond apparel",
    "A national daily, a 24-hour news channel, jute, tea, transport and port clearing.",
    "biz/gate.jpg",
  ],
];

const awards = [
  [
    "2023",
    "National Export Trophy",
    "Government of Bangladesh · Refat Garments, FY2020-21",
    "flags/bd.svg",
  ],
  [
    "2022",
    "National Export Trophy",
    "Government of Bangladesh · Refat Garments",
    "flags/bd.svg",
  ],
  ["2011", "Technical Design Certification", "Kohl's", "buyers/kohls.png"],
  [
    "2010",
    "Strategic Quality Assurance, Annual Winner",
    "Kohl's",
    "buyers/kohls.png",
  ],
  ["2009", "Technical Performance Award", "JCPenney", "buyers/jcpenney.png"],
];

const certifications = [
  { abbr: "GOTS", name: "Global Organic Textile Standard" },
  { abbr: "OCS", name: "Organic Content Standard" },
  { abbr: "GRS", name: "Global Recycled Standard" },
  { abbr: "RCS", name: "Recycled Claim Standard" },
  { abbr: "OEKO-TEX", name: "Standard 100" },
];

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

const megaMenuData: Record<string, any> = {
  company: {
    eyebrow: "COMPANY",
    headline:
      "One group from yarn to shipped carton, built in Dhaka since 1984.",
    gridCols: 2,
    links: [
      { title: "About us", sub: "The group at a glance", href: "#company" },
      {
        title: "Founders & leadership",
        sub: "A. K. Azad · Md. Delwar Hossain",
        href: "#company",
      },
      {
        title: "Recognition & awards",
        sub: "National export trophies, buyer awards",
        href: "#recognition",
      },
      {
        title: "People & community",
        sub: "75,000+ people, schools, scholarships",
        href: "#people",
      },
      {
        title: "Contact",
        sub: "Head office, Tejgaon, Dhaka",
        href: "#contact",
      },
    ],
  },
  businesses: {
    eyebrow: "BUSINESSES",
    headline: "Nine units, one chain.",
    cta: { text: "View all businesses", href: "#businesses" },
    gridCols: 3,
    links: [
      {
        title: "Woven garments",
        sub: "400 production lines",
        href: "#businesses",
      },
      { title: "Denim mill", sub: "5.5M yards a month", href: "#businesses" },
      {
        title: "Spinning & textiles",
        sub: "100 MT yarn a day",
        href: "#businesses",
      },
      {
        title: "Washing & finishing",
        sub: "142M pieces a year",
        href: "#businesses",
      },
      { title: "Sweaters", sub: "400 Stoll machines", href: "#businesses" },
      {
        title: "Design & sampling",
        sub: "800 samples a day",
        href: "#businesses",
      },
      {
        title: "Embroidery, printing & trims",
        sub: "40 embroidery machines",
        href: "#businesses",
      },
      { title: "Packaging", sub: "100% export-oriented", href: "#businesses" },
      {
        title: "Beyond apparel",
        sub: "2005 Samakal founded",
        href: "#businesses",
      },
    ],
  },
  products: {
    eyebrow: "PRODUCTS",
    headline: "What leaves the looms and lines — and how to spec it.",
    gridCols: 2,
    links: [
      {
        title: "Fabric library",
        sub: "18 denim and woven families",
        href: "#products",
      },
      {
        title: "How we make it",
        sub: "Six steps, fibre to vessel",
        href: "#chain",
      },
      {
        title: "360° virtual tour",
        sub: "Walk four facilities",
        href: "#products",
      },
      {
        title: "Washing & finishing",
        sub: "142M pieces a year",
        href: "#businesses",
      },
    ],
  },
};

const footerColumns = [
  [
    "GROUP",
    "About Ha-Meem",
    "How we make it",
    "Recognition & awards",
    "Sustainability",
    "People & community",
    "Newsroom",
    "Careers",
    "Contact",
  ],
  [
    "BUSINESSES",
    "Woven apparel",
    "Denim fabric",
    "Textiles & spinning",
    "Sweaters",
    "Washing & finishing",
    "Trims & packaging",
    "Design & sampling",
    "Media · jute · tea",
  ],
  [
    "FOR BUYERS",
    "Fabric library",
    "360° virtual tour",
    "Certifications",
    "Request swatch cards",
    "Book a factory visit",
    "Company profile",
  ],
  [
    "GROUP COMPANIES",
    "Ha-Meem Group (official)",
    "Ha-Meem Denim",
    "Ha-Meem Textiles",
    "360° tour platform",
    "Samakal",
    "Channel 24",
  ],
  ["FOLLOW", "YouTube", "LinkedIn", "Facebook"],
];

/* ── Sub-components ── */
function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-(--red) text-xs font-semibold tracking-[0.12em] leading-tight uppercase ${className}`}
    >
      {children}
    </p>
  );
}

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <a
      className={`flex items-center gap-3 ${dark ? "text-(--red)" : ""}`}
      href="#top"
      aria-label="Ha-Meem Group"
    >
      <span className="brand-pill flex items-center h-12 px-1 rounded-lg backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/30 transition-all duration-300 hover:bg-white hover:-translate-y-px">
        <img
          src="./group-logo.png"
          alt="Ha-Meem Group"
          className="h-10 rounded-sm w-auto object-contain"
        />
      </span>
    </a>
  );
}

/* ── Stitch Scrollbar ── */
function StitchScrollbar({ progress }: { progress: number }) {
  const totalLength = 800;
  const offset = totalLength - totalLength * progress;
  return (
    <div className="stitch-track hidden md:block">
      <svg
        width="3"
        height="100%"
        viewBox="0 0 3 800"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <line
          x1="1.5"
          y1="0"
          x2="1.5"
          y2="800"
          className="stitch-bg"
          fill="none"
          strokeWidth="2"
        />
        <line
          x1="1.5"
          y1="0"
          x2="1.5"
          y2="800"
          className="stitch-progress"
          fill="none"
          strokeWidth="2"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [product, setProduct] = useState(0);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preloader dismiss
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  // Scroll handler: back-to-top + scroll progress (header state lives in SiteHeader)
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {loading && <Preloader />}

      {/* Stitch Scrollbar */}
      <StitchScrollbar progress={scrollProgress} />

      {/* Back to Top */}
      <button
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        ↑
      </button>
      {!loading && <AiAssistant />}

      <main
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.6s ease-in-out",
        }}
      >
        {/* ═══ FIXED HEADER ═══ */}
        <SiteHeader menus={megaMenuData} />

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
            <h1 className="font-['Fira_Sans_Condensed'] text-[clamp(52px,8vw,98px)] leading-[0.97] tracking-[-0.035em] font-semibold text-center">
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
              className="border border-white/50 bg-[#11141826] text-white rounded-full w-10.5 h-10.5"
            >
              ←
            </button>
            <button
              onClick={togglePause}
              className="border border-white/50 bg-[#11141826] text-white rounded-full w-10.5 h-10.5"
            >
              {heroPaused ? "▶" : "Ⅱ"}
            </button>
            <button
              onClick={nextSlide}
              className="border border-white/50 bg-[#11141826] text-white rounded-full w-10.5 h-10.5"
            >
              →
            </button>
          </div>
          {/* <img
            className="absolute right-8 bottom-6 z-2 w-16 h-16 p-2.5 rounded-full bg-white invert"
            src={`${media}brand/mark-white.png`}
            alt=""
          /> */}
        </section>

        {/* ═══ RAISED CONTENT ═══ */}
        <div className="relative z-3 shadow-[0_-35px_70px_#00000040]">
          {/* ── FOUNDED IN 1984 ── */}
          <section id="company" className="bg-white py-24 md:py-32">
            <div className="wrap text-center flex flex-col gap-3 justify-center items-center">
              <Eyebrow>FOUNDED IN 1984</Eyebrow>
              <h2 className="font-['Fira_Sans_Condensed'] subpixel-antialiased font-black text-[30px] md:text-[38px] leading-[1.18]  mt-16 max-w-300 mx-auto">
                Ha-Meem Group is one of Bangladesh&apos;s largest vertically
                integrated apparel manufacturers. From our own yarn and denim to
                sewing, washing, trims and shipping, we make bottoms, tops,
                denim and sweaters for the world&apos;s leading retailers.
              </h2>
              {/* Stats grid */}
              <div className="mt-16 pt-10 border-t border-(--hair) grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
                {stats.map((s) => (
                  <div
                    key={s.value}
                    className="py-8 px-4 text-center border-r border-(--hair) last:border-r-0"
                  >
                    <b className="font-['Fira_Sans_Condensed'] text-[42px] md:text-[52px] font-semibold block leading-none">
                      {s.value}
                    </b>
                    <span className="text-(--red) text-[10px] font-semibold tracking-[0.12em] block mt-3">
                      {s.label}
                    </span>
                    <span className="text-(--mute) text-[13px] block mt-2 leading-snug">
                      {s.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── WHERE WE ARE ── */}
          <section className="bg-white border-t border-(--hair) py-24 md:py-32 relative overflow-hidden">
            <div className="wrap">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Eyebrow>WHERE WE ARE</Eyebrow>
                  <h2 className="font-['Fira_Sans_Condensed'] text-[48px] md:text-[58px] leading-[0.98] font-semibold mt-20">
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
                  Today the group employs around 50,000 people and operates 26
                  garment factories, 300 production lines and seven washing
                  plants, producing about seven million pieces each month. Denim
                  production is around four million metres monthly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-full text-[11px] tracking-[0.07em] font-semibold text-(--red)">
                    <span className="inline-block size-2 rounded-full bg-(--red)" aria-hidden="true" />
                    BANGLADESH
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-full text-[11px] tracking-[0.07em] font-semibold">
                    <span className="inline-block size-2 rounded-full bg-(--navy)" aria-hidden="true" />
                    SOURCING OFFICES
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-3 border border-(--hair) rounded-full text-[11px] tracking-[0.07em] font-semibold">
                    <span className="inline-block size-2 rounded-full bg-[#8a8b90]" aria-hidden="true" />
                    EXPORT MARKETS
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── OUR BUYERS ── */}
          <section className="bg-white py-24 md:py-32">
            <div className="wrap">
              {/* Header Update: constrained width and centered */}
              <div className="text-center flex flex-col items-center justify-center">
                <Eyebrow>OUR BUYERS</Eyebrow>
                <h3 className="font-['Fira_Sans_Condensed'] mx-auto mt-4 max-w-[22ch] text-[clamp(1.9rem,3vw,2.8rem)] font-bold leading-[1.02] text-balance">
                  Retailers and brands we manufacture for.
                  <sup className="relative top-[-0.1em] ml-[0.08em] align-top text-[0.42em] leading-none text-(--color-red)">
                    *
                  </sup>
                </h3>
              </div>

              {/* Grid Update: gap-px for perfect 1px borders */}
              <ul className="mx-auto mt-10 grid max-w-272 grid-cols-3 gap-px border border-[#e4e4e0] bg-[#e4e4e0] sm:grid-cols-6">
                {buyers.map((name) => (
                  <li
                    key={name}
                    className="group grid h-20 place-items-center bg-white px-4 sm:h-24 sm:px-6"
                  >
                    <img
                      src={`${media}buyers/${name}.png`}
                      alt={name.replaceAll("-", " ")}
                      loading="lazy"
                      className="w-auto max-w-full object-contain opacity-80 grayscale transition-[filter,opacity] duration-500 group-hover:opacity-100 group-hover:grayscale-0 max-h-9 sm:max-h-11 sm:max-w-[min(100%,7.5rem)]"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── PRODUCTS (hover to switch) ── */}
          <section
            id="products"
            className="grid md:grid-cols-2 min-h-175 md:h-221.75"
          >
            <div className="product-image-wrap bg-(--mist) overflow-hidden relative h-100 md:h-full">
              {products.map((item, i) => (
                <img
                  key={item[0]}
                  src={`${media}products/${item[2]}`}
                  alt={item[0]}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: product === i ? 1 : 0,
                    transform: product === i ? "scale(1)" : "scale(1.04)",
                  }}
                />
              ))}
            </div>
            <div className="py-16 md:py-28 px-8 md:pl-24 md:pr-16">
              <Eyebrow>WHAT WE MAKE</Eyebrow>
              <h2 className="font-['Fira_Sans_Condensed'] text-[42px] md:text-[58px] leading-[0.96] mt-7 mb-10">
                Bottoms, tops,
                <br />
                denim and sweaters.
              </h2>
              <p className="text-(--mute) text-base leading-relaxed pb-9 border-b border-(--hair)">
                From fashionable denim fabrics to wholesale apparel, Ha-Meem
                makes bottoms, tops and sweaters for global fashion brands, with
                products ranging from infant to adult sizes.
              </p>
              <div>
                {products.map((item, i) => (
                  <button
                    key={item[0]}
                    className={`product-btn block w-full text-left bg-transparent border-0 border-b border-(--hair) py-5 text-(--mute) ${product === i ? "active" : ""}`}
                    onMouseEnter={() => setProduct(i)}
                  >
                    <b className="tracking-widest text-[13px]">{item[0]}</b>
                    {product === i && item[1] && (
                      <span className="block pt-2 leading-relaxed text-sm">
                        {item[1]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
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
                  className={`step-panel relative border-0 border-r-2 border-white text-white bg-(--ink) p-6 text-left bg-cover bg-center overflow-hidden cursor-pointer ${step === i ? "step-open flex-[1_1_50%]" : "flex-[0_0_10%]"}`}
                  style={
                    step === i
                      ? {
                          backgroundImage: `linear-gradient(90deg,rgba(95, 108, 124, 0.56),rgba(46, 54, 65, 0.57)),url("${media}${item.image}")`,
                        }
                      : undefined
                  }
                  onClick={() => setStep(i)}
                  onMouseEnter={() => setStep(i)}
                >
                  <span className="step-num-text absolute left-1/2 top-6 -translate-x-1/2 font-semibold transition-opacity duration-300">
                    0{i + 1}
                  </span>
                  {step === i ? (
                    <span className="step-body absolute left-10 right-12 bottom-10 flex flex-col">
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
                <a
                  href="#contact"
                  key={b[2]}
                  className="biz-card relative h-74.5 text-white overflow-hidden p-6 transition-all duration-350 block"
                >
                  <img
                    src={`${media}${b[4]}`}
                    alt=""
                    className="biz-img absolute inset-0 w-full h-full object-cover transition-transform duration-350"
                  />
                  <span className="biz-overlay absolute inset-0 bg-linear-to-b from-[#11141828] to-[#111418dc] transition-all duration-350" />
                  <span className="relative z-1 flex flex-col">
                    <b className="font-['Fira_Sans_Condensed'] text-white text-[37px]">
                      {b[0]}
                    </b>
                    <small className="text-[10px] text-white tracking-[0.13em]">
                      {b[1]}
                    </small>
                  </span>
                  <span className="absolute left-6 right-6 bottom-6 z-1 flex flex-col">
                    <strong className="font-['Fira_Sans_Condensed'] text-white text-[25px] mb-2">
                      {b[2]}
                    </strong>
                    <small className="leading-snug text-white opacity-80 text-sm">
                      {b[3]}
                    </small>
                  </span>
                </a>
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
              {/* Awards row */}
              <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-(--hair)">
                {awards.map((a) => (
                  <div
                    key={a[0]}
                    className="min-h-43.75 p-5 pr-7 border-r border-(--hair) last:border-r-0 grid grid-cols-[1fr_60px] gap-y-0"
                  >
                    <b className="font-['Fira_Sans_Condensed'] text-(--red) text-[40px]">
                      {a[0]}
                    </b>
                    <img
                      src={`${media}${a[3]}`}
                      alt=""
                      className="justify-self-end w-15 h-6.25 object-contain"
                    />
                    <strong className="col-span-2 mt-7 text-sm font-semibold">
                      {a[1]}
                    </strong>
                    <small className="col-span-2 text-(--mute) leading-snug mt-2 text-sm">
                      {a[2]}
                    </small>
                  </div>
                ))}
              </div>
              {/* Certifications */}
              <div className="border-t border-(--hair) mt-9 pt-10 grid md:grid-cols-[260px_1fr] gap-6">
                <Eyebrow>
                  CERTIFIED<sup className="text-(--red)">*</sup>
                </Eyebrow>
                <div className="flex flex-wrap gap-3">
                  {certifications.map((c) => (
                    <span
                      key={c.abbr}
                      className="bg-white border border-(--hair) rounded-full px-4 py-2.5 text-(--mute) text-xs"
                    >
                      <b className="text-(--ink) mr-2 font-semibold">
                        {c.abbr}
                      </b>
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── SUSTAINABILITY ── */}
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

            {/* FIXED OVERLAY: Stronger opacity + subtle blur for perfect text contrast */}
            <div className="absolute inset-0 bg-[rgba(10,14,18,0.85)] backdrop-blur-[2px]" />

            {/* MAIN CONTAINER: Constrained width, centered, and padded properly */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
              <Eyebrow className="text-white!">SUSTAINABILITY</Eyebrow>

              {/* HEADING: Removed ml-36, tightened line-height */}
              <h2 className="font-['Fira_Sans_Condensed'] flex flex-col gap-8 font-black text-[48px] md:text-[61px] leading-[0.95] mt-8 mb-6">
                Cleaner water.
                <br />
                Cleaner power.
                <br />
                <span className="text-[#c5c6c8]">Measured.</span>
              </h2>

              {/* PARAGRAPH: Constrained width for optimal readability */}
              <p className="text-[#d5d6d7] text-[17px] leading-relaxed max-w-2xl mx-auto">
                Our mills treat effluent biologically, recover process chemicals
                and put solar on factory roofs, working toward net-zero by 2050.
              </p>

              {/* STATS GRID: Properly spaced, vertically aligned */}
              <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-12 w-full max-w-4xl mx-auto">
                {/* Stat 1 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-['Fira_Sans_Condensed'] text-[42px] font-black leading-none">
                      12.2
                    </span>
                    <span className="text-[14px] font-normal text-[#c5c6c8]">
                      MWp
                    </span>
                  </div>
                  <span className="text-[#c5c6c8] text-[13px] leading-relaxed mt-3 max-w-[200px]">
                    Rooftop solar installed across factories
                  </span>
                </div>

                {/* Stat 2 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-['Fira_Sans_Condensed'] text-[42px] font-black leading-none">
                      100%
                    </span>
                  </div>
                  <span className="text-[#c5c6c8] text-[13px] leading-relaxed mt-3 max-w-[200px]">
                    Of process water recycled
                  </span>
                </div>

                {/* Stat 3 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-['Fira_Sans_Condensed'] text-[42px] font-black leading-none">
                      60–80%
                    </span>
                  </div>
                  <span className="text-[#c5c6c8] text-[13px] leading-relaxed mt-3 max-w-[200px]">
                    Caustic soda recovered and reused in fabric processing
                  </span>
                </div>
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
                More than
                <br />
                50,000 people.<sup className="text-(--red)">*</sup>
              </h2>
              <p className="text-(--mute) max-w-107.5 leading-relaxed mb-10">
                Most joined as machine operators. The group founded three
                schools for their children, funds scholarships, and runs a
                higher-education pathway with the Asian University for Women
                called Dreams Beyond the Factory Floor.
              </p>
              <a
                className="inline-block self-start px-8 py-4 border border-(--ink) rounded-full text-xs font-semibold tracking-widest hover:bg-(--ink) hover:text-white transition-colors duration-300"
                href="#contact"
              >
                WORK WITH US
              </a>
            </div>
            <img
              src={`${media}people-knit.jpg`}
              alt="A knitting technician programming a Stoll machine"
              className="w-full h-[400px] md:h-full object-cover"
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
                  <strong className="news-title relative z-1 font-['Fira_Sans_Condensed'] text-[22px] md:text-[26px] leading-[1.05] mt-3">
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
          <section
            id="careers"
            className="relative min-h-137.5 md:h-160.5 overflow-hidden text-white bg-(--ink)"
          >
            <img
              src={`${media}cine/fabric.jpg`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[rgba(10,14,18,0.88)]" />
            <div className="relative z-1 flex flex-col gap-8 text-center pt-28 md:pt-32 px-5">
              <Eyebrow className="text-white!">WORK WITH US</Eyebrow>
              <h2 className="font-['Fira_Sans_Condensed'] font-black text-[50px] md:text-[68px] leading-[0.84] mt-14 mb-4">
                Sourcing from
                <br />
                Bangladesh?
              </h2>
              <p className="text-[#d9dadb] leading-relaxed mb-9">
                One partner from yarn to vessel. Tell us what you make
                <br />
                and we will tell you where it fits.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  className="inline-block px-8 py-4 bg-white text-black border border-white rounded-full text-[11px] font-semibold tracking-widest hover:bg-transparent hover:text-white transition-colors duration-300"
                  href="mailto:sales@hameemdenim.com"
                >
                  TALK TO SALES
                </a>
                <a
                  className="inline-block px-8 py-4 border border-white rounded-full text-[11px] font-semibold tracking-widest hover:bg-white hover:text-(--ink) transition-colors duration-300"
                  href="mailto:career@hameemgroup.com"
                >
                  CAREERS
                </a>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer id="contact" className="bg-(--mist) text-(--mute)">
            <div className="wrap grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(5,1fr)] gap-10 pt-18 pb-16">
              <div className="flex flex-col gap-4 text-sm leading-relaxed lg:col-span-1 sm:col-span-2">
                <Brand dark />
                <p>
                  387 (South), Tejgaon Industrial Area
                  <br />
                  Dhaka-1208, Bangladesh
                </p>
                <p>+880 2 8170592 · +880 2 8170593</p>
                <b className="text-(--ink) text-xs tracking-[0.08em]">
                  SOURCING ENQUIRIES
                </b>
                <a className="text-(--red)">sales@hameemdenim.com</a>
                <b className="text-(--ink) text-xs tracking-[0.08em]">
                  CAREERS
                </b>
                <a className="text-(--red)">career@hameemgroup.com</a>
              </div>
              {footerColumns.map((c) => (
                <div key={c[0]} className="flex flex-col gap-4 text-sm">
                  <b className="text-(--ink) text-xs tracking-widest mb-4">
                    {c[0]}
                  </b>
                  {c.slice(1).map((x) => (
                    <a
                      key={x}
                      className="hover:text-(--ink) transition-colors duration-200 cursor-pointer"
                    >
                      {x}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-(--hair)">
              <div className="wrap flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-3 text-xs">
                <span>
                  © 2026 Ha-Meem Group. Concept homepage — not the official
                  site.
                </span>
                <span>
                  Privacy notice　　Terms of use　　Supplier code of conduct
                </span>
                <span>
                  <b className="text-(--red)">*</b> Figure from public sources,
                  pending confirmation by Ha-Meem Group.
                </span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
