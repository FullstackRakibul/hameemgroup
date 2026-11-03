import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import CountUp from "../components/CountUp";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { BUYER_AWARDS, F, FOUNDERS, GROUP_STATS, POSITIONING } from "../data/facts";
import { MANAGEMENT, OTHER_BUSINESSES, type BusinessItem, type Person } from "../data/units";
import { COMPANY_CRUMBS } from "./crumbs";

const media = "/media/";
const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";
const LABEL = "text-[11px] font-semibold tracking-[0.2em]";
const pad = (n: number) => String(n).padStart(2, "0");

/* A dashed seam sewn round its card on hover or focus; always shown on touch screens */
function Seam({ id, tone = "ink" }: { id: string; tone?: "ink" | "white" }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] overflow-visible">
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="3"
            ry="3"
            pathLength={1}
            fill="none"
            stroke="white"
            strokeWidth="6"
            className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0] group-hover:duration-900 group-focus-within:[stroke-dashoffset:0] motion-reduce:transition-none [@media(hover:none)]:[stroke-dashoffset:0]"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="3"
        ry="3"
        fill="none"
        stroke={tone === "white" ? "white" : "var(--ink)"}
        strokeOpacity={tone === "white" ? 0.5 : 0.35}
        strokeWidth="1.5"
        strokeDasharray="8 6"
        mask={`url(#${id})`}
      />
    </svg>
  );
}

/* ── Our story: then and today ──
   The founding company on an ink panel, a stitched thread across, and the
   group as it stands now: its figures, counting up, and its other businesses. */
function ThenAndToday() {
  const today = [
    ...GROUP_STATS.filter((s) => s.value !== F.established),
    { value: String(OTHER_BUSINESSES.length), label: "OTHER BUSINESSES", sub: "From media to tea gardens" },
  ];
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,4fr)_auto_minmax(0,8fr)] lg:items-stretch">
      {/* Then */}
      <div
        data-reveal
        className="relative isolate flex min-h-80 flex-col justify-between overflow-hidden rounded-sm bg-(--ink) p-8 text-white lg:p-10"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-1 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_5px)]"
        />
        <p className={`m-0 flex items-center gap-3 text-white/70 ${LABEL}`}>
          <span aria-hidden="true" className="w-6 border-t border-dashed border-white/60" />
          THEN
        </p>
        <div>
          <p className="m-0 font-['Fira_Sans_Condensed'] text-[96px] font-semibold leading-[0.85] tracking-[-0.02em] lg:text-[128px]">
            {F.established}
          </p>
          <p className="m-0 mt-6 font-['Fira_Sans_Condensed'] text-2xl font-semibold leading-tight">One garment company</p>
          <p className="m-0 mt-2 max-w-[30ch] text-sm leading-relaxed text-white/75">
            Founded in Dhaka by {FOUNDERS[0]} and {FOUNDERS[1]}.
          </p>
        </div>
      </div>

      {/* The thread from then to now */}
      <div aria-hidden="true" className="flex items-center justify-center gap-3 py-2 lg:flex-col lg:py-0">
        <span className="h-px w-12 border-t border-dashed border-(--ink)/30 lg:h-16 lg:w-px lg:border-t-0 lg:border-l" />
        <span className="grid size-11 place-items-center rounded-full border border-(--hair) bg-white text-(--ink)">
          <ArrowRight size={18} strokeWidth={1.75} className="rotate-90 lg:rotate-0" />
        </span>
        <span className="h-px w-12 border-t border-dashed border-(--ink)/30 lg:h-16 lg:w-px lg:border-t-0 lg:border-l" />
      </div>

      {/* Today */}
      <div data-reveal className="rounded-sm border border-(--hair) bg-white p-6 sm:p-8 lg:p-10">
        <p className={`m-0 flex items-center gap-3 text-(--mute) ${LABEL}`}>
          <span aria-hidden="true" className="h-0.5 w-6 bg-(--navy)" />
          TODAY
        </p>
        <dl className="m-0 mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
          {today.map((s, i) => (
            <div key={s.label} className="group flex flex-col border-t border-(--hair) pt-4">
              <dt className="order-2 mt-3 text-[10px] font-semibold tracking-[0.14em] text-(--mute) sm:text-[11px]">{s.label}</dt>
              <dd className="order-1 m-0 font-['Fira_Sans_Condensed'] text-[40px] font-semibold leading-none tabular-nums text-(--ink) sm:text-[48px]">
                <CountUp text={s.value} delay={i * 80} />
              </dd>
              {s.sub && <dd className="order-3 m-0 mt-1.5 text-[13px] leading-snug text-(--mute)">{s.sub}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ── Leadership: one large editorial card each ── */
function LeaderCard({ person, index }: { person: Person; index: number }) {
  const founder = FOUNDERS.some((f) => person.name.includes(f));
  return (
    <article className="group relative flex min-h-60 flex-col rounded-sm border border-(--hair) bg-white p-8 lg:p-10">
      <Seam id={`leader-seam-${index}`} />
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-semibold tabular-nums tracking-widest text-(--mute)">{pad(index + 1)}</span>
        {founder && (
          <span className="rounded-xs border border-(--hair) px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-(--ink)">
            CO-FOUNDER
          </span>
        )}
      </div>
      <h3 className="mt-auto pt-10 text-balance font-['Fira_Sans_Condensed'] text-[32px] font-semibold leading-[1.05] text-(--ink) lg:text-[40px]">
        {person.name}
      </h3>
      <span
        aria-hidden="true"
        className={`mt-5 block h-0.5 w-12 origin-left scale-x-50 bg-(--navy) transition-transform duration-500 ${EASE} group-hover:scale-x-100 motion-reduce:transition-none`}
      />
      <p className="m-0 mt-4 text-sm text-(--mute)">{person.role}</p>
      {person.email && (
        <a
          href={`mailto:${person.email}`}
          className="mt-4 inline-flex min-h-11 items-center gap-2 self-start break-all rounded-xs text-sm font-medium text-(--navy) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy)"
        >
          <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
          {person.email}
        </a>
      )}
    </article>
  );
}

/* ── Other businesses: an indexed directory in two columns ──
   The units with a page of their own supply the apparel chain; the rest sit
   beyond it. */
function BusinessRow({ item, index }: { item: BusinessItem; index: number }) {
  const body = (
    <>
      <span className="pt-1 text-[11px] font-semibold tabular-nums tracking-widest text-(--mute)">{pad(index + 1)}</span>
      <span className="min-w-0">
        <span
          className={`block font-['Fira_Sans_Condensed'] text-xl font-semibold leading-tight text-(--ink) transition-transform duration-300 ${EASE} group-hover/row:translate-x-1 motion-reduce:transition-none`}
        >
          {item.label}
        </span>
        {item.value && <span className="mt-1 block text-sm leading-snug text-(--mute)">{item.value}</span>}
      </span>
      {item.to ? (
        <span className="flex items-center gap-1.5 self-center whitespace-nowrap text-xs font-medium text-(--navy)">
          <span className="hidden sm:inline">{item.linkText}</span>
          <ArrowUpRight
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className={`transition-transform duration-300 ${EASE} group-hover/row:rotate-45 motion-reduce:transition-none`}
          />
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      {/* A navy rule along the foot, drawn on hover */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-(--navy) transition-transform duration-500 ${EASE} group-hover/row:scale-x-100 motion-reduce:transition-none`}
      />
    </>
  );
  const row = `group/row relative grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-4 border-b border-(--hair) py-4`;
  return (
    <li>
      {item.to ? (
        <Link
          to={item.to}
          aria-label={`${item.label}${item.linkText ? `: ${item.linkText}` : ""}`}
          className={`${row} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--navy)`}
        >
          {body}
        </Link>
      ) : (
        <div className={row}>{body}</div>
      )}
    </li>
  );
}

function BusinessDirectory() {
  const groups = [
    { title: "Around the apparel chain", items: OTHER_BUSINESSES.filter((b) => b.to) },
    { title: "Beyond apparel", items: OTHER_BUSINESSES.filter((b) => !b.to) },
  ];
  let n = 0;
  return (
    <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
      {groups.map((g) => (
        <div key={g.title} data-reveal>
          <div className="flex items-end justify-between gap-4 border-b-2 border-(--ink) pb-4">
            <h3 className="font-['Fira_Sans_Condensed'] text-2xl font-semibold text-(--ink)">{g.title}</h3>
            <span className="font-['Fira_Sans_Condensed'] text-[32px] font-semibold leading-none tabular-nums text-(--navy)">
              <CountUp text={pad(g.items.length)} />
            </span>
          </div>
          <ul className="m-0 list-none p-0">
            {g.items.map((item) => (
              <BusinessRow key={item.label} item={item} index={n++} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── Buyer awards: a timeline along a stitched thread ── */
function AwardTimeline() {
  const years = [...new Set(BUYER_AWARDS.map((a) => a.year))].sort();
  return (
    <div className="relative">
      {/* The thread through the year markers: across from md, down the left below it */}
      <span aria-hidden="true" className="absolute inset-x-0 top-1.5 hidden border-t border-dashed border-(--ink)/30 md:block" />
      <span aria-hidden="true" className="absolute bottom-0 left-1.5 top-5 border-l border-dashed border-(--ink)/30 md:hidden" />
      <ol data-reveal-stagger className="relative m-0 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-6">
        {years.map((year) => (
          <li key={year} className="relative flex flex-col max-md:pl-8">
            <span aria-hidden="true" className="size-3 rounded-full bg-(--navy) ring-4 ring-(--mist) max-md:absolute max-md:left-0 max-md:top-4" />
            <span className="mt-5 font-['Fira_Sans_Condensed'] text-[44px] font-semibold leading-none text-(--ink) max-md:mt-0">{year}</span>
            <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
              {BUYER_AWARDS.filter((a) => a.year === year).map((a) => (
                <li
                  key={`${a.title}-${a.by}`}
                  className="group relative flex items-start gap-4 rounded-sm border border-(--hair) bg-white p-5"
                >
                  <img
                    src={`${media}${a.logo}`}
                    alt={a.by}
                    loading="lazy"
                    className="h-6 w-16 shrink-0 object-contain object-left grayscale transition-[filter] duration-300 group-hover:grayscale-0 motion-reduce:transition-none"
                  />
                  <span className="min-w-0">
                    <strong className="block text-sm font-semibold leading-snug text-(--ink)">{a.title}</strong>
                    <small className="mt-1 block text-[13px] text-(--mute)">{a.by}</small>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AboutPage() {
  usePageMeta(
    "About us",
    `Ha-Meem Group began in ${F.established} as one garment company. Today it is a leading wholesale clothing manufacturer in Bangladesh, with ${F.factories} garment factories and ${F.employeesText} people.`,
  );

  return (
    <>
      <PageHero
        image="sustain-campus.jpg"
        imageAlt="Ha-Meem Textiles building at Mawna, with planted terraces"
        eyebrow="COMPANY"
        title="About Ha-Meem Group"
        intro={`${POSITIONING}, since ${F.established}.`}
        crumbs={COMPANY_CRUMBS}
        current="About us"
      />

      <Section>
        <SectionHeader eyebrow="OUR STORY" title={`One garment company in ${F.established}.`}>
          <p>
            Ha-Meem Group is a leading wholesale clothing manufacturer in Bangladesh. We make fashionable denim
            fabrics and garments, from one of the most comprehensive manufacturing bases in the country.
          </p>
          <p>
            It began in {F.established} as one garment company, founded by {FOUNDERS[0]} and {FOUNDERS[1]}. Today we
            work with some of the world&apos;s largest fashion brands, in Europe and America, and the group has grown
            into shipping, newspapers, tea gardens and more.
          </p>
        </SectionHeader>
        <ThenAndToday />
      </Section>

      <Section tone="mist" id="leadership">
        <SectionHeader eyebrow="LEADERSHIP" title="Founders & leadership.">
          <p>The founders lead the group as Managing Director and Group Deputy Managing Director.</p>
        </SectionHeader>
        <div data-reveal-stagger className="grid gap-3 md:grid-cols-2">
          {MANAGEMENT.map((p, i) => (
            <LeaderCard key={p.name} person={p} index={i} />
          ))}
        </div>
      </Section>

      <Section id="other-businesses">
        <SectionHeader eyebrow="BEYOND APPAREL" title="Other businesses.">
          <p>
            Around the apparel chain sit the units that supply it, and businesses well beyond it: media, jute, tea
            and transport.
          </p>
        </SectionHeader>
        <BusinessDirectory />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="RECOGNITION" title="Awards from our buyers.">
          <p>Quality and technical awards from the retailers we make for.</p>
        </SectionHeader>
        <AwardTimeline />
      </Section>

      <ContactCta />
    </>
  );
}
