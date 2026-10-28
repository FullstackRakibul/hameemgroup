/* ── Facts: the one place every figure on the site is typed ──
   The homepage, the inner pages and the chat assistant all read from here.
   Order of authority: current company figures win; 2018-site details fill
   gaps; anything else is not written. Change a figure here, nowhere else. */

export const POSITIONING = "Leading wholesale clothing manufacturer in Bangladesh";

export const F = {
  /* Current figures (authoritative) */
  established: "1984",
  factories: "26",
  employees: "75K+",
  employeesText: "75,000+",
  revenue: "$1B",
  garmentsYear: "120M",
  sweatersYear: "6M",
  jacketsYear: "0.5M",
  denimYardsMonth: "5.5M",
  nonDenimYardsMonth: "2.5M",
  spinningDay: "100 MT",
  washYear: "142M",
  fiberRecyclingDay: "1,560 MT",
  waterRecycling: "63%",
  solar: "29.1 MW",
  inHouseAccessories: "100%",
  laserMachines: "120",
  powerCogeneration: "80%",
  ozoneMachines: "26",
  laboratory: "In-house accredited laboratory",

  /* From the 2018 site, unconfirmed */
  productionLines: "400",
  locations: "six",
  merchandisers: "250",
  washingPlants: "7",
  washingPlantsWord: "seven",
  bottomsShare: "70%",
  topsShare: "30%",
  denimShare: "50%",
  nonDenimShare: "50%",
  aql: "2.5",
  denimSiteAcres: "100",
  sweaterUnits: "2",
  stollMachines: "400",
  sampleMachines: "500",
  samplesDay: "800",
  embroideryMachines: "40",
  embroiderySince: "2012",
  printsMonth: "1.4M",
  narrowFabricMonth: "8M",
  labelsMonth: "3.5M",
  cartonExport: "100%",

  /* Homepage claims outside the brief's sources: kept as they were, unconfirmed */
  samakalFounded: "2005",
  netZeroBy: "2050",
} as const;

/** "29.1 MW" → ["29.1", "MW"], for stats that set the unit smaller. */
export const splitUnit = (figure: string): [string, string] => {
  const i = figure.indexOf(" ");
  return i < 0 ? [figure, ""] : [figure.slice(0, i), figure.slice(i + 1)];
};

/* Links that exist only once the company supplies them. Empty hides them. */
/* The Tongi zone tour, the entry point for the nav and footer links. The full
   set of four tours lives in VR_TOURS in ./gallery. */
export const VIRTUAL_TOUR_URL = "https://hameemgroup.net/360vr.html";
export const DENIM_SITE_URL = "";

/* ── Head office and enquiries ── */
export const HEAD_OFFICE = {
  name: "Ha-Meem Group",
  lines: ["387 (South), Tejgaon Industrial Area", "Dhaka-1208, Bangladesh"],
  phones: ["+880-2-8170592", "+880-2-8170593"],
  map: {
    lat: 23.759894,
    lng: 90.39669,
    embed: "https://www.google.com/maps?q=23.759894,90.39669&z=16&output=embed",
  },
};

export const EMAIL = {
  sales: "sales@hameemdenim.com",
  careers: "career@hameemgroup.com",
};

/** "+880-2-8170592" → "tel:+88028170592" */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const FOUNDERS = ["A. K. Azad", "Md. Delwar Hossain"];

/* ── Recognition ── */
export type Award = { year: string; title: string; by: string; logo: string };

/** Buyer awards, from the 2018 site. */
export const BUYER_AWARDS: Award[] = [
  { year: "2011", title: "Technical Design Certification", by: "Kohl's", logo: "buyers/kohls.png" },
  { year: "2010", title: "Strategic Quality Assurance, Annual Winner", by: "Kohl's", logo: "buyers/kohls.png" },
  { year: "2009", title: "Strategic Quality Assurance, Annual Winner", by: "Kohl's", logo: "buyers/kohls.png" },
  { year: "2009", title: "Technical Performance Award", by: "JCPenney", logo: "buyers/jcpenney.png" },
];

/** National awards shown on the homepage (homepage claim, unconfirmed). */
export const NATIONAL_AWARDS: Award[] = [
  {
    year: "2023",
    title: "National Export Trophy",
    by: "Government of Bangladesh · Refat Garments, FY2020-21",
    logo: "flags/bd.svg",
  },
  { year: "2022", title: "National Export Trophy", by: "Government of Bangladesh · Refat Garments", logo: "flags/bd.svg" },
];

/* ── Award timeline (home page gallery) ── */
export type TimelineAward = {
  years: string;
  title: string;
  text?: string;
  by?: string;
  image?: string; // award photo; when missing, show the fallback frame
  logo?: string; // issuer logo, shown in the fallback frame
  tint: string;
};

const PHOTO_AWARDS: TimelineAward[] = [
  { years: "2017", title: "Kohl's Greatness Award 2017", text: "Recognized for exceptional product excellence and global collaboration.", by: "Kohl's", image: "awards/awards-2017.webp", logo: "buyers/kohls.png", tint: "#f3ece6" },
  { years: "2018 – 2019", title: "National Export Trophy", text: "A testament to persistent growth and global trust.", image: "awards/awards-2018-2019.webp", logo: "flags/bd.svg", tint: "#eef0ec" },
  { years: "2019 – 2020", title: "National Export Trophy", text: "Recognized for highest export earnings in the apparel sector.", image: "awards/awards-2019-2020.webp", logo: "flags/bd.svg", tint: "#ebeff2" },
  { years: "2020 – 2021", title: "National Export Trophy (Gold)", text: "Honored for outstanding contribution to the national export economy.", image: "awards/awards-2020-2021.webp", logo: "flags/bd.svg", tint: "#f4efe2" },
  { years: "2021 – 2022", title: "Bangabandhu Sheikh Mujib Export Trophy", text: "The winning exporters received Gold, Silver and Bronze awards: 28 firms Gold, 27 Silver and 21 Bronze.", by: "State Minister for Commerce", image: "awards/awards-2021-2022.webp", logo: "flags/bd.svg", tint: "#f5eaec" },
];

// Awards without photos come from the existing lists, so the data lives in one place.
const toTimeline = (a: Award, tint: string): TimelineAward => ({ years: a.year, title: a.title, by: a.by, logo: a.logo, tint });

/** Every award, oldest first. Ties keep source order. */
export const AWARD_TIMELINE: TimelineAward[] = [
  ...PHOTO_AWARDS,
  ...NATIONAL_AWARDS.map((a) => toTimeline(a, "#eef0ec")),
  ...BUYER_AWARDS.map((a) => toTimeline(a, "#f1efec")),
].sort((a, b) => parseInt(a.years) - parseInt(b.years));

export const CERTIFICATIONS = [
  { abbr: "GOTS", name: "Global Organic Textile Standard" },
  { abbr: "OCS", name: "Organic Content Standard" },
  { abbr: "GRS", name: "Global Recycled Standard" },
  { abbr: "RCS", name: "Recycled Claim Standard" },
  { abbr: "OEKO-TEX", name: "Standard 100" },
];

/* ── Stat rows ── */
export type Stat = { value: string; label: string; sub?: string; detail?: string; points?: string[] };

/** The group at a glance: homepage stats row and the About page. */
export const GROUP_STATS: Stat[] = [
  { value: F.established, label: "ESTABLISHED", sub: "Founded as one garment factory in Dhaka" },
  { value: F.factories, label: "FACTORIES", sub: `Garment factories in ${F.locations} locations` },
  { value: F.employees, label: "EMPLOYEES", sub: "Working across the group" },
  { value: F.revenue, label: "YEARLY REVENUE", sub: "Across the group" },
  { value: F.garmentsYear, label: "GARMENTS A YEAR", sub: "Readymade garments, infant to adult" },
  {
    value: F.washYear,
    label: "WASH CAPACITY A YEAR",
    sub: `Across ${F.washingPlantsWord} washing plants, ${F.laserMachines} laser machines`,
  },
];

export const SUSTAINABILITY_STATS: Stat[] = [
  {
    value: F.solar,
    label: "Solar capacity",
    detail: "Rooftop solar plants across our factories feed clean power straight into production.",
    points: ["Rooftop plants on group factories", "Power used on site, cutting grid demand"],
  },
  {
    value: F.waterRecycling,
    label: "Water recycling",
    detail: "Biological effluent treatment lets our mills clean and reuse most of their process water.",
    points: ["Biological effluent treatment plants", "Treated water reused in production"],
  },
  {
    value: F.powerCogeneration,
    label: "Power co-generation",
    detail: "Waste heat from our power plants is recovered and reused to run dyeing and finishing.",
    points: ["Heat recovered from generation", "Less fuel per metre of fabric"],
  },
  {
    value: F.fiberRecyclingDay,
    label: "Fiber recycled a day",
    detail: "Our recycling plant turns cutting waste and used fibre back into yarn.",
    points: ["Post-industrial waste back into yarn", "Less virgin cotton per garment"],
  },
];

/* ── People programmes ──
   One card each in the home page's PEOPLE accordion. `image` is a path under
   public/media; swap that one field to change a card's photo. */
export type PeopleProgram = {
  id: string;
  title: string;
  summary: string;
  points: string[];
  image: string;
  imageAlt: string;
};

export const PEOPLE_PROGRAMS: PeopleProgram[] = [
  {
    id: "schools",
    title: "Schools we founded",
    summary: "The group has established schools for its workers' children and the wider community.",
    points: ["M. A. Aziz High School", "M. A. Aziz Primary School", "Nurul Islam High School", "Refat Kowmi Madrasa"],
    image: "biz/gate.jpg",
    imageAlt: "Entrance to a Ha-Meem campus",
  },
  {
    id: "scholarships",
    title: "Scholarships",
    summary: "Ha-Meem Group funds scholarships for its workers' children.",
    points: ["For workers' children", "Funded by the group"],
    image: "people-knit.jpg",
    imageAlt: "A knitting technician programming a Stoll machine",
  },
  {
    id: "higher-ed",
    title: "Dreams Beyond the Factory Floor",
    summary: "A higher-education pathway with the Asian University for Women.",
    points: ["Partnership with the Asian University for Women"],
    image: "chain-sewing.jpg",
    imageAlt: "Sewing line at a Ha-Meem factory",
  },
  {
    id: "careers",
    title: "Careers & universities",
    summary: "We take part in career fairs and work with clubs at universities across Bangladesh.",
    points: ["University career fairs", "Student clubs and programmes"],
    image: "cine/sewing.jpg",
    imageAlt: "Workers on a production floor",
  },
  {
    id: "environment",
    title: "Environment",
    summary: "Saving power, cleaning water and choosing cleaner materials across our sites.",
    points: [
      "LED lighting and solar panels to save electricity",
      "Our own effluent treatment plant (ETP) to cut water waste",
      "Organic raw materials: fewer pesticides, less water",
      "Tree plantation drives across the country",
    ],
    image: "sustain-campus.jpg",
    imageAlt: "Green campus of Ha-Meem Textiles at Mawna, Bangladesh",
  },
];
