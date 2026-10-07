import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import StatGrid from "../components/StatGrid";
import UnitCard from "../components/UnitCard";
import Gallery from "../components/Gallery";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { F } from "../data/facts";
import { SWEATER_UNITS } from "../data/units";
import { BUSINESS_CRUMBS } from "./crumbs";

export default function SweaterPage() {
  usePageMeta(
    "Sweaters",
    `Ha-Meem knits ${F.sweatersYear} sweaters a year on ${F.stollMachines} Stoll computerised flat-knitting machines, at Ashulia and Zirani.`,
  );

  return (
    <>
      <PageHero
        image="biz/sweater.jpg"
        imageAlt="Rows of computerised flat-knitting machines in a Ha-Meem sweater factory"
        eyebrow="BUSINESSES"
        title="Sweaters"
        intro={`${F.sweatersYear} sweaters a year, knitted on ${F.stollMachines} Stoll machines.`}
        crumbs={BUSINESS_CRUMBS}
        current="Sweaters"
      />

      <Section>
        <SectionHeader eyebrow="KNITWEAR" title="Knitted on Stoll machines.">
          <p>
            Two units at Ashulia and Zirani knit on {F.stollMachines} Stoll computerised flat-knitting machines,
            making {F.sweatersYear} sweaters a year for brands including GAP, Aeon, Mango, NewYorker and H&amp;M.
          </p>
        </SectionHeader>
        <StatGrid
          className="border-t border-(--hair)"
          stats={[
            { value: F.sweatersYear, label: "SWEATERS A YEAR" },
            { value: F.stollMachines, label: "STOLL MACHINES", sub: "Computerised flat-knitting" },
            { value: F.sweaterUnits, label: "UNITS", sub: "Ashulia and Zirani" },
          ]}
        />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="UNITS" title="Our sweater units." />
        <ul className="grid gap-5 sm:grid-cols-2">
          {SWEATER_UNITS.map((u) => (
            <li key={u.name}>
              <UnitCard unit={u} />
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeader eyebrow="GALLERY" title="On the knitting floor." />
        <Gallery
          label="Sweater photos"
          images={[
            { src: "people-knit.jpg", alt: "A knitting technician programming a Stoll machine" },
            { src: "products/sweaters.jpg", alt: "Operators finishing sweaters on a factory floor" },
          ]}
        />
      </Section>

      <ContactCta />
    </>
  );
}
