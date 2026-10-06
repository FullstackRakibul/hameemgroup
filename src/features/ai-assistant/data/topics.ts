import type { Topic, TopicId } from "../types";

/* Canned replies. Every figure here must also appear in src/App.tsx;
   scripts/check-assistant-facts.mjs enforces that. */
export const topics: Topic[] = [
  {
    id: "products",
    label: "Our products",
    question: "What products do you make?",
    welcome: true,
    keywords: ["product", "make", "jeans", "denim", "shirt", "pant", "cargo", "jacket", "outerwear", "sweater", "fabric", "garment", "kids", "infant"],
    reply: [
      "We make readymade garments from infant to adult, about 120 million pieces a year. The main categories are denim jeans, bottoms and cargos, shirts and dress pants, outerwear and jackets, and sweaters.",
      "Our denim is hi-fashion, with critical washes, laser finish and 3D whisker. We also supply denim fabric from our own mill, Ha-Meem Denim.",
    ],
    links: [{ label: "See products →", href: "#products" }],
    followUps: ["capacity", "sustainability", "visit"],
  },
  {
    id: "capacity",
    label: "Production capacity",
    question: "How much can you produce?",
    welcome: true,
    keywords: ["capacity", "produce", "production", "volume", "factory", "factories", "lines", "month", "scale", "how many", "output"],
    reply: [
      "We're vertically integrated, from yarn to shipped carton. Our spinning mills produce 100 MT of yarn a day, Ha-Meem Denim weaves around four million metres of denim a month, and our 26 garment factories in six locations make about seven million pieces a month.",
      "Seven washing plants with 120 laser machines handle 142 million pieces a year, and sweaters are knitted on 400 Stoll machines, about 400,000 pieces a month. Some figures come from public sources and are pending confirmation by Ha-Meem Group.",
    ],
    links: [{ label: "How we make it →", href: "#chain" }],
    followUps: ["products", "visit", "contact"],
  },
  {
    id: "sustainability",
    label: "Sustainability",
    question: "Tell me about your sustainability and certifications.",
    welcome: true,
    keywords: ["sustainab", "green", "solar", "water", "effluent", "etp", "carbon", "net-zero", "environment", "certif", "gots", "oeko", "grs", "ocs", "rcs", "compliance", "audit"],
    reply: [
      "Our mills treat effluent biologically, recover process chemicals and put solar on factory roofs, working toward net-zero by 2050.",
      "So far that means 12.2 MWp of rooftop solar across our factories, 100% of process water recycled, and 60–80% of caustic soda recovered and reused in fabric processing.",
      "Certifications listed on this site include GOTS, OCS, GRS, RCS and OEKO-TEX Standard 100.",
    ],
    links: [{ label: "Sustainability →", href: "#sustainability" }],
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
      "If you'd like a look first, our 360° virtual tour lets you walk four facilities online. We also have sourcing offices in Hong Kong and Shanghai.",
    ],
    links: [{ label: "Email sales →", href: "mailto:sales@hameemdenim.com" }],
    followUps: ["capacity", "contact"],
  },
  {
    id: "careers",
    label: "Careers",
    question: "How can I work at Ha-Meem?",
    welcome: true,
    keywords: ["career", "job", "work", "hiring", "vacancy", "apply", "cv", "resume", "employ", "intern"],
    reply: [
      "We'd love to hear from you. Send your CV to career@hameemgroup.com.",
      "Most of our people joined as machine operators. The group runs three schools for their children, funds scholarships, and offers a higher-education pathway with the Asian University for Women called Dreams Beyond the Factory Floor.",
    ],
    links: [{ label: "Email careers →", href: "mailto:career@hameemgroup.com" }],
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
      "For sourcing enquiries, email sales@hameemdenim.com. Tell us what you make and we'll tell you where it fits.",
      "Head office: 387 (South), Tejgaon Industrial Area, Dhaka-1208, Bangladesh. Phone: +880 2 8170592 or +880 2 8170593.",
    ],
    links: [
      { label: "Email sales →", href: "mailto:sales@hameemdenim.com" },
      { label: "Contact details →", href: "#contact" },
    ],
    followUps: ["visit", "products"],
  },
  {
    id: "about",
    label: "About Ha-Meem",
    question: "Tell me about Ha-Meem.",
    keywords: ["about", "who", "history", "founded", "company", "group", "1984", "export", "market"],
    reply: [
      "Ha-Meem Group started in 1984 as one garment factory in Dhaka and is now one of Bangladesh's largest vertically integrated apparel manufacturers, making bottoms, tops, denim and sweaters for leading retailers.",
      "Around ninety-five percent of what we make ships to the United States, and the rest goes to Europe, Japan and India.",
    ],
    links: [{ label: "About us →", href: "#company" }],
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
      "I don't have a ready answer for that yet. Our sales team can help directly at sales@hameemdenim.com, or pick one of these topics.",
    ],
    links: [{ label: "Email sales →", href: "mailto:sales@hameemdenim.com" }],
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
