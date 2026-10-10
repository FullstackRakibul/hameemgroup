import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import StatGrid from "../components/StatGrid";
import FactList from "../components/FactList";
import PersonCard from "../components/PersonCard";
import AwardGrid from "../components/AwardGrid";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { BUYER_AWARDS, F, FOUNDERS, GROUP_STATS, POSITIONING } from "../data/facts";
import { MANAGEMENT, OTHER_BUSINESSES } from "../data/units";
import { COMPANY_CRUMBS } from "./crumbs";

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
        <StatGrid stats={GROUP_STATS} className="border-t border-(--hair)" />
      </Section>

      <Section tone="mist" id="leadership">
        <SectionHeader eyebrow="LEADERSHIP" title="Founders & leadership.">
          <p>The founders lead the group as Managing Director and Group Deputy Managing Director.</p>
        </SectionHeader>
        <div data-reveal-stagger className="grid gap-grid sm:grid-cols-2">
          {MANAGEMENT.map((p) => (
            <PersonCard key={p.name} person={{ name: p.name, role: p.role }} />
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
        <FactList rows={OTHER_BUSINESSES} />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="RECOGNITION" title="Awards from our buyers.">
          <p>Quality and technical awards from the retailers we make for.</p>
        </SectionHeader>
        <AwardGrid awards={BUYER_AWARDS} />
      </Section>

      <ContactCta />
    </>
  );
}
