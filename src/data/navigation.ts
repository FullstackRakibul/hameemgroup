/* Navigation: header mega menus, plain header links, business pages and the
   footer. Internal destinations are router paths ("/about") or homepage
   sections ("/#sustainability"); anything else is an external URL. */
import { EMAIL, F, VIRTUAL_TOUR_URL } from "./facts";

export type MegaLink = { title: string; sub: string; href: string };
export type MegaMenu = {
  eyebrow: string;
  headline: string;
  cta?: { text: string; href: string };
  gridCols: number;
  links: MegaLink[];
};
export type MenuKey = "company" | "businesses" | "products";

/** The seven business pages, in menu order. */
export const BUSINESS_PAGES: MegaLink[] = [
  { title: "Woven garments", sub: `${F.productionLines} production lines`, href: "/businesses/woven" },
  { title: "Denim mill", sub: `${F.denimYardsMonth} yards a month`, href: "/businesses/denim-mill" },
  { title: "Washing & finishing", sub: `${F.washYear} wash capacity a year`, href: "/businesses/laundry" },
  { title: "Sweaters", sub: `${F.sweatersYear} sweaters a year`, href: "/businesses/sweater" },
  { title: "Design & sampling", sub: `${F.samplesDay} samples a day`, href: "/businesses/design-studio" },
  {
    title: "Embroidery, printing & trims",
    sub: `${F.embroideryMachines} embroidery machines`,
    href: "/businesses/embroidery-printing-accessories",
  },
  { title: "Packaging", sub: `${F.cartonExport} export-oriented`, href: "/businesses/ancillary" },
];

const page = (title: string) => BUSINESS_PAGES.find((p) => p.title === title)!;

export const megaMenuData: Record<MenuKey, MegaMenu> = {
  company: {
    eyebrow: "COMPANY",
    headline: `One group from yarn to shipped carton, built in Dhaka since ${F.established}.`,
    gridCols: 2,
    links: [
      { title: "About us", sub: "The group at a glance", href: "/about" },
      { title: "Founders & leadership", sub: "A. K. Azad · Md. Delwar Hossain", href: "/about#leadership" },
      { title: "Merchandising", sub: `${F.merchandisers} merchandisers`, href: "/merchandising" },
      { title: "Our customers", sub: "Retailers and brands we make for", href: "/customers" },
      { title: "Recognition & awards", sub: "National export trophies, buyer awards", href: "/#recognition" },
      { title: "People & community", sub: `${F.employeesText} people, schools, scholarships`, href: "/#people" },
      { title: "Contact", sub: "Head office, Tejgaon, Dhaka", href: "/contact" },
    ],
  },
  businesses: {
    eyebrow: "BUSINESSES",
    headline: "Nine units, one chain.",
    cta: { text: "View all businesses", href: "/#businesses" },
    gridCols: 3,
    links: [
      page("Woven garments"),
      page("Denim mill"),
      { title: "Spinning & textiles", sub: `${F.spinningDay} yarn a day`, href: "/businesses/denim-mill#spinning" },
      page("Washing & finishing"),
      page("Sweaters"),
      page("Design & sampling"),
      page("Embroidery, printing & trims"),
      page("Packaging"),
      { title: "Beyond apparel", sub: "Newspaper, news channel, jute, tea", href: "/about#other-businesses" },
    ],
  },
  products: {
    eyebrow: "PRODUCTS",
    headline: "What leaves the looms and lines — and how to spec it.",
    gridCols: 2,
    links: [
      { title: "Fabric library", sub: "18 denim and woven families", href: "/#products" },
      { title: "How we make it", sub: "Six steps, fibre to vessel", href: "/#chain" },
      ...(VIRTUAL_TOUR_URL
        ? [{ title: "360° virtual tour", sub: "Take a virtual tour of Ha-Meem Group", href: VIRTUAL_TOUR_URL }]
        : []),
      { title: "Washing & finishing", sub: `${F.washYear} wash capacity a year`, href: "/businesses/laundry" },
    ],
  },
};

export const PLAIN_LINKS = [
  { title: "Sustainability", href: "/#sustainability" },
  { title: "Contact", href: "/contact" },
  { title: "Careers", href: "https://jobs.hameemgroup.com/" },
];

/* ── Footer ── An item without href is plain text: it has no real destination yet. */
export type FooterItem = { label: string; href?: string };
export type FooterColumn = { heading: string; items: FooterItem[] };

export const footerColumns: FooterColumn[] = [
  {
    heading: "GROUP",
    items: [
      { label: "About Ha-Meem", href: "/about" },
      { label: "How we make it", href: "/#chain" },
      { label: "Merchandising", href: "/merchandising" },
      { label: "Our customers", href: "/customers" },
      { label: "Recognition & awards", href: "/#recognition" },
      { label: "Sustainability", href: "/#sustainability" },
      { label: "People & community", href: "/#people" },
      { label: "Newsroom", href: "/#news" },
      { label: "Careers", href: "https://jobs.hameemgroup.com/" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "BUSINESSES",
    items: [
      { label: "Woven apparel", href: "/businesses/woven" },
      { label: "Denim fabric", href: "/businesses/denim-mill" },
      { label: "Textiles & spinning", href: "/businesses/denim-mill#spinning" },
      { label: "Sweaters", href: "/businesses/sweater" },
      { label: "Washing & finishing", href: "/businesses/laundry" },
      { label: "Embroidery & trims", href: "/businesses/embroidery-printing-accessories" },
      { label: "Packaging", href: "/businesses/ancillary" },
      { label: "Design & sampling", href: "/businesses/design-studio" },
      { label: "Media · jute · tea", href: "/about#other-businesses" },
    ],
  },
  {
    heading: "FOR BUYERS",
    items: [
      { label: "Fabric library", href: "/#products" },
      ...(VIRTUAL_TOUR_URL ? [{ label: "360° virtual tour", href: VIRTUAL_TOUR_URL }] : []),
      { label: "Certifications", href: "/#recognition" },
      { label: "Request swatch cards" },
      { label: "Book a factory visit", href: `mailto:${EMAIL.sales}` },
      { label: "Company profile" },
    ],
  },
  {
    heading: "GROUP COMPANIES",
    items: [
      { label: "Ha-Meem Group (official)" },
      { label: "Ha-Meem Denim" },
      { label: "Ha-Meem Textiles" },
      ...(VIRTUAL_TOUR_URL ? [{ label: "360° tour platform", href: VIRTUAL_TOUR_URL }] : []),
      { label: "Samakal" },
      { label: "Channel 24" },
    ],
  },
  { heading: "FOLLOW", items: [{ label: "YouTube" }, { label: "LinkedIn" }, { label: "Facebook" }] },
];

/** A link names the current page only when it has no #section part. */
export const isCurrentPage = (href: string, pathname: string) => !href.includes("#") && href === pathname;

export const isInternal = (href: string) => href.startsWith("/");
