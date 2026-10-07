/* Factories, plants and contacts, as listed on the 2018 site (unconfirmed). */
import { F } from "./facts";

export type Unit = {
  name: string;
  address: string[];
  /** Production lines, shown as a large numeral. */
  lines?: string;
  note?: string;
};

export const WOVEN_UNITS: Unit[] = [
  { name: "Artistic Design Ltd.", address: ["232-233 East Narashinshapur, Ashulia, Dhaka"], lines: "34" },
  { name: "Explore Garments Ltd.", address: ["Gorai, Mirzapur, Tangail"], lines: "10" },
  { name: "That's It Garments Ltd.", address: ["Nishat Nagar, Tongi, Gazipur"], lines: "10" },
  { name: "That's It Sports Wear Ltd.", address: ["147, 148 East Narashinghapur, Ashulia, Dhaka"], lines: "68" },
  { name: "Apparels Gallery Ltd.", address: ["144, 147, 148 Narashinghapur, Ashulia, Dhaka"], lines: "24" },
  { name: "Refat Garments Ltd.", address: ["144, 147, 148 Narashinghapur, Ashulia, Dhaka"], lines: "26" },
  { name: "Creative Collections Ltd.", address: ["69 & 107, Nishat Nagar, Tongi, Gazipur"], lines: "66" },
  { name: "Next Collections Ltd.", address: ["1323-1325, Beron, Ashulia, Savar, Dhaka"], lines: "34" },
  { name: "Ha-Meem Design Ltd.", address: ["Kaliganj, Bangladesh"], lines: "30" },
];

const DRY_PROCESS = "Dry process and over-dyeing";

/** Four of the seven washing plants are named on the 2018 site. */
export const WASHING_PLANTS: Unit[] = [
  { name: "Modern Washing Plant", address: ["Nishat Nagar, Tongi, Gazipur"], note: DRY_PROCESS },
  { name: "Sajid Washing Plant", address: ["Nishat Nagar, Tongi, Gazipur"], note: DRY_PROCESS },
  { name: "Creative Washing Plant", address: ["Nishat Nagar, Tongi, Gazipur"], note: DRY_PROCESS },
  { name: "Express Washing Plant", address: ["East Narashinshapur, Ashulia, Dhaka"], note: DRY_PROCESS },
];

export const SWEATER_UNITS: Unit[] = [
  { name: "That's It Knit Ltd.", address: ["59 South Parishail, Zirani Bazar", "Kashimpur, Gazipur Sadar"] },
  { name: "That's It Sweater Ltd.", address: ["145 Narasinghpur Road", "Ashulia, Dhaka-1341"] },
];

export const DENIM_UNIT: Unit = {
  name: "Ha-Meem Denim Mills Ltd.",
  address: ["Sreepur, Mawna, Gazipur, Bangladesh"],
};

export const CARTON_UNIT = {
  name: "Refat Packaging & Printing Ind. Ltd.",
  address: "Vadarti, Kaliganj, Gazipur",
};

/* ── People ── */
export type Person = { name: string; role: string; email?: string };

export const MANAGEMENT: Person[] = [
  { name: "A. K. Azad", role: "Managing Director" },
  {
    name: "Lt. Col. Md. Delwar Hossain PSC (retd.)",
    role: "Group Deputy Managing Director",
    email: "delwar@hameemgroup.com",
  },
];

export const MERCHANDISING_CONTACTS: Person[] = [
  { name: "Ms. Shahnaj Rojee", role: "Executive Director", email: "rojee@hameemgroup.com" },
  { name: "Mr. Enayet Hossain", role: "Executive Director", email: "enayet@hameemgroup.com" },
  { name: "Mr. Syed Abu Md Saleh", role: "Executive Director", email: "saleh@hameemgroup.com" },
  { name: "Mr. Md. Omar Ali Mollah", role: "Deputy General Manager", email: "omar@hameemgroup.com" },
  { name: "Mr. Nazmul Huda", role: "Deputy General Manager", email: "nazmul@hameemgroup.com" },
  { name: "Mr. Mizanur Rahman", role: "Manager (H&M)", email: "mizanur@hameemgroup.com" },
  { name: "Mr. Tarik Aziz Rubel", role: "General Manager", email: "rubel@hameemgroup.com" },
  { name: "Mr. Saiful Islam Shahin", role: "Assistant General Manager", email: "shahin@hameemgroup.com" },
];

/* ── Business lists ── */
export type BusinessItem = { label: string; value?: string; to?: string; linkText?: string };

const EMBROIDERY_PAGE = "/businesses/embroidery-printing-accessories";

/** About page: the group's other businesses. */
export const OTHER_BUSINESSES: BusinessItem[] = [
  { label: "Sweater factory", to: "/businesses/sweater", linkText: "Sweaters" },
  { label: "Embroidery and printing factory", to: EMBROIDERY_PAGE, linkText: "Embroidery & printing" },
  { label: "Carton factory", value: CARTON_UNIT.name, to: "/businesses/ancillary", linkText: "Ancillary industries" },
  { label: "Poly bag factory", to: "/businesses/ancillary", linkText: "Ancillary industries" },
  { label: "Label factory", to: EMBROIDERY_PAGE, linkText: "Labels" },
  { label: "Jute mill", value: "M.H. Jute Mills Ltd." },
  { label: "Chemical formulation plant", to: "/businesses/ancillary", linkText: "Ancillary industries" },
  { label: "Tea garden" },
  { label: "Transport company" },
  { label: "Clearing & forwarding", value: "Own C&F office at every Bangladeshi port" },
  { label: "News channel", value: "Channel 24" },
  { label: "National daily newspaper", value: "Samakal" },
];

/** Ancillary page: the seven supporting units. */
export const ANCILLARY_UNITS: BusinessItem[] = [
  {
    label: "Embroidery factory",
    value: `${F.embroideryMachines} machines, Japanese Tajima and Chinese.`,
    to: EMBROIDERY_PAGE,
    linkText: "Embroidery",
  },
  {
    label: "Printing factory",
    value: `Screen, digital and sublimation printing, ${F.printsMonth} pieces a month.`,
    to: EMBROIDERY_PAGE,
    linkText: "Printing",
  },
  {
    label: "Carton factory",
    value: `${CARTON_UNIT.name}, ${F.cartonExport} export-oriented. ${CARTON_UNIT.address}.`,
  },
  { label: "Poly bag industry" },
  {
    label: "Label factory",
    value: `Swiss Müller machines, ${F.labelsMonth} labels a month.`,
    to: EMBROIDERY_PAGE,
    linkText: "Labels",
  },
  { label: "Jute mill", value: "M.H. Jute Mills Ltd." },
  { label: "Chemical formulation plant" },
];
