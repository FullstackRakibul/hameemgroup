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
  productionLines: "300",
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
export const VIRTUAL_TOUR_URL = "";
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

export const CERTIFICATIONS = [
  { abbr: "GOTS", name: "Global Organic Textile Standard" },
  { abbr: "OCS", name: "Organic Content Standard" },
  { abbr: "GRS", name: "Global Recycled Standard" },
  { abbr: "RCS", name: "Recycled Claim Standard" },
  { abbr: "OEKO-TEX", name: "Standard 100" },
];

/* ── Stat rows ── */
export type Stat = { value: string; label: string; sub?: string };

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
  { value: F.solar, label: "Solar capacity" },
  { value: F.waterRecycling, label: "Water recycling" },
  { value: F.powerCogeneration, label: "Power co-generation" },
  { value: F.fiberRecyclingDay, label: "Fiber recycled a day" },
];
