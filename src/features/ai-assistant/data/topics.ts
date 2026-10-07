import type { Topic, TopicId } from "../types";
import { EMAIL, F, HEAD_OFFICE, VIRTUAL_TOUR_URL } from "../../../data/facts";

/* Canned replies. Figures come from src/data/facts.ts; any number typed
   here directly must also appear in the site copy (src/pages, src/data):
   scripts/check-assistant-facts.mjs enforces that. Links are site paths, so
   they work from every page. */
const phones = HEAD_OFFICE.phones.map((p) => p.replaceAll("-", " ")).join(" or ");

export const topics: Topic[] = [
  {
    id: "products",
    label: "Our products",
    question: "What products do you make?",
    welcome: true,
    keywords: ["product", "make", "jeans", "denim", "shirt", "pant", "cargo", "jacket", "outerwear", "sweater", "fabric", "garment", "kids", "infant"],
    reply: [
      `We make readymade garments from infant to adult, ${F.garmentsYear} pieces a year, including ${F.jacketsYear} jackets and ${F.sweatersYear} sweaters. The main categories are denim jeans, bottoms and cargos, shirts and dress pants, outerwear and jackets, and sweaters.`,
      "Our denim is hi-fashion, with critical washes, laser finish and 3D whisker. We also supply denim fabric from our own mill, Ha-Meem Denim.",
    ],
    links: [{ label: "See products →", href: "/#products" }],
    followUps: ["capacity", "sustainability", "visit"],
  },
  {
    id: "capacity",
    label: "Production capacity",
    question: "How much can you produce?",
    welcome: true,
    keywords: ["capacity", "produce", "production", "volume", "factory", "factories", "lines", "month", "scale", "how many", "output"],
    reply: [
      `We're vertically integrated, from yarn to shipped carton. Our spinning mills produce ${F.spinningDay} of yarn a day, Ha-Meem Denim weaves ${F.denimYardsMonth} yards of denim and ${F.nonDenimYardsMonth} yards of non-denim fabric a month, and our ${F.factories} garment factories make ${F.garmentsYear} garments a year on ${F.productionLines} production lines.`,
      `Seven washing plants with ${F.laserMachines} laser machines and ${F.ozoneMachines} ozone machines have a wash capacity of ${F.washYear} pieces a year, and sweaters are knitted on ${F.stollMachines} Stoll machines, ${F.sweatersYear} a year. Some figures are pending confirmation by Ha-Meem Group.`,
    ],
    links: [{ label: "How we make it →", href: "/#chain" }],
    followUps: ["products", "visit", "contact"],
  },
  {
    id: "sustainability",
    label: "Sustainability",
    question: "Tell me about your sustainability and certifications.",
    welcome: true,
    keywords: ["sustainab", "green", "solar", "water", "effluent", "etp", "carbon", "net-zero", "environment", "certif", "gots", "oeko", "grs", "ocs", "rcs", "compliance", "audit"],
    reply: [
      `Our mills treat effluent biologically, recover process chemicals and put solar on factory roofs, working toward net-zero by ${F.netZeroBy}.`,
      `So far that means ${F.solar} of solar capacity, ${F.waterRecycling} water recycling, ${F.powerCogeneration} power co-generation and ${F.fiberRecyclingDay} of fiber recycled a day.`,
      "Certifications listed on this site include GOTS, OCS, GRS, RCS and OEKO-TEX Standard 100. We also run an in-house accredited laboratory.",
    ],
    links: [{ label: "Sustainability →", href: "/#sustainability" }],
    followUps: ["products", "contact"],
  },
  {
    id: "visit",
    label: "Factory visit",
    question: "Can I visit your factories?",
    welcome: true,
    keywords: ["visit", "tour", "factory visit", "see", "audit visit", "location", "where", "dhaka", "360", "virtual"],
    reply: [
      "Yes. Every factory sits within an hour of Dhaka, and you can book a factory visit through our sales team.",
      VIRTUAL_TOUR_URL
        ? "If you'd like a look first, take a virtual tour of Ha-Meem Group online. We also have sourcing offices in Hong Kong and Shanghai."
        : "We also have sourcing offices in Hong Kong and Shanghai.",
    ],
    links: [
      { label: "Email sales →", href: `mailto:${EMAIL.sales}` },
      ...(VIRTUAL_TOUR_URL ? [{ label: "Virtual tour →", href: VIRTUAL_TOUR_URL }] : []),
    ],
    followUps: ["capacity", "contact"],
  },
  {
    id: "careers",
    label: "Careers",
    question: "How can I work at Ha-Meem?",
    welcome: true,
    keywords: ["career", "job", "work", "hiring", "vacancy", "apply", "cv", "resume", "employ", "intern"],
    reply: [
      `We'd love to hear from you. Send your CV to ${EMAIL.careers}.`,
      `Most of our ${F.employeesText} people joined as machine operators. The group runs three schools for their children, funds scholarships, and offers a higher-education pathway with the Asian University for Women called Dreams Beyond the Factory Floor.`,
    ],
    links: [{ label: "Email careers →", href: `mailto:${EMAIL.careers}` }],
    followUps: ["about", "contact"],
  },
  {
    id: "contact",
    label: "Talk to sales",
    question: "How do I contact your sales team?",
    welcome: true,
    keywords: ["contact", "sales", "email", "phone", "call", "quote", "price", "buy", "order", "sourcing", "moq", "office", "address"],
    priority: 2,
    reply: [
      `For sourcing enquiries, email ${EMAIL.sales}. Tell us what you make and we'll tell you where it fits.`,
      `Head office: ${HEAD_OFFICE.lines.join(", ")}. Phone: ${phones}.`,
    ],
    links: [
      { label: "Email sales →", href: `mailto:${EMAIL.sales}` },
      { label: "Contact details →", href: "/contact" },
    ],
    followUps: ["visit", "products"],
  },
  {
    id: "about",
    label: "About Ha-Meem",
    question: "Tell me about Ha-Meem.",
    keywords: ["about", "who", "history", "founded", "company", "group", "1984", "export", "market"],
    reply: [
      `Ha-Meem Group started in ${F.established} as one garment company and is now a leading wholesale clothing manufacturer in Bangladesh, with ${F.factories} garment factories and ${F.employeesText} people making bottoms, tops, denim and sweaters for leading retailers.`,
      "Around ninety-five percent of what we make ships to the United States, and the rest goes to Europe, Japan and India.",
    ],
    links: [{ label: "About us →", href: "/about" }],
    followUps: ["products", "capacity"],
  },
  {
    id: "greeting",
    keywords: [],
    reply: [
      "Hello! I can help with products, capacity, sustainability, factory visits, careers or getting in touch with sales. What would you like to know?",
    ],
    links: [],
    followUps: ["products", "capacity", "contact"],
  },
  {
    id: "fallback",
    keywords: [],
    reply: [
      `I don't have a ready answer for that yet. Our sales team can help directly at ${EMAIL.sales}, or pick one of these topics.`,
    ],
    links: [{ label: "Email sales →", href: `mailto:${EMAIL.sales}` }],
    followUps: ["products", "capacity", "visit"],
  },
];

export const topicById = (id: TopicId) => topics.find((t) => t.id === id)!;
export const welcomeTopics = topics.filter((t) => t.welcome);

// Word boundary so "history…" is not read as "hi".
const GREETING = /^(hi|hello|hey|salam|assalamu)\b/i;

/** Lookup order: exact chip question → greeting → keyword score → fallback. */
export function findTopic(text: string): Topic {
  const normalised = text.trim().toLowerCase();
  const exact = topics.find((t) => t.question && t.question.toLowerCase() === normalised);
  if (exact) return exact;
  if (GREETING.test(normalised)) return topicById("greeting");

  let best: Topic | null = null;
  let bestScore = 0;
  for (const topic of topics) {
    const score = topic.keywords.filter((k) => normalised.includes(k)).length;
    const wins = score > bestScore || (score === bestScore && score > 0 && (topic.priority ?? 1) > (best?.priority ?? 1));
    if (wins) {
      best = topic;
      bestScore = score;
    }
  }
  return best ?? topicById("fallback");
}
