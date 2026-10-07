import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import StatGrid from "../components/StatGrid";
import FactList from "../components/FactList";
import UnitCard from "../components/UnitCard";
import Gallery from "../components/Gallery";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { F } from "../data/facts";
import { WOVEN_UNITS } from "../data/units";
import { BUSINESS_CRUMBS } from "./crumbs";

export default function WovenPage() {
  usePageMeta(
    "Woven garments",
    `${F.factories} Ha-Meem garment factories with ${F.productionLines} production lines make ${F.garmentsYear} readymade garments a year: trousers, jeans, cargos, shirts, jackets and dresses.`,
  );

  return (
    <>
      <PageHero
        image="biz/woven.jpg"
        imageAlt="Long rows of sewing lines on a Ha-Meem woven garment floor"
        eyebrow="BUSINESSES"
        title="Woven garments"
        intro={`${F.factories} garment factories and ${F.productionLines} production lines, in ${F.locations} locations.`}
        crumbs={BUSINESS_CRUMBS}
        current="Woven garments"
      />

      <Section>
        <SectionHeader eyebrow="AT A GLANCE" title="Tops and bottoms, line by line.">
          <p>
            Lines are balanced with auto trimmers and switch between complicated tops and bottoms. Cutting is
            automatic. {F.employeesText} people work across the group.
          </p>
        </SectionHeader>
        <StatGrid
          className="border-t border-(--hair)"
          stats={[
            { value: F.factories, label: "GARMENT FACTORIES", sub: `In ${F.locations} locations` },
            { value: F.productionLines, label: "PRODUCTION LINES", sub: "Balanced with auto trimmers" },
            { value: F.garmentsYear, label: "GARMENTS A YEAR", sub: "Readymade garments" },
            { value: F.jacketsYear, label: "JACKETS A YEAR", sub: "Outerwear and jackets" },
          ]}
        />
        <FactList
          rows={[
            { label: "Products", value: "Trousers, jeans, cargos, skirts, shirts, jackets and dresses." },
            { label: "Product mix", value: `${F.bottomsShare} bottoms, ${F.topsShare} tops.` },
            { label: "Fabric mix", value: `${F.denimShare} denim, ${F.nonDenimShare} non-denim.` },
            { label: "Cutting", value: "Automatic cutting." },
            { label: "Quality", value: `AQL ${F.aql} on every line, at factory level.` },
          ]}
        />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="UNITS" title="Our woven units.">
          <p>Each unit, its address and its production lines.</p>
        </SectionHeader>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WOVEN_UNITS.map((u) => (
            <li key={u.name}>
              <UnitCard unit={u} />
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeader eyebrow="GALLERY" title="On the floor." />
        <Gallery
          label="Woven garments photos"
          images={[
            { src: "chain-sewing.jpg", alt: "Operators at sewing machines on a garment floor" },
            { src: "cine/sewing.jpg", alt: "Sewing lines with operators in red uniforms" },
            { src: "products/bottoms.jpg", alt: "Stacks of coloured trousers" },
            { src: "products/shirts.jpg", alt: "A hand turning the cuff of a blue shirt" },
          ]}
        />
      </Section>

      <ContactCta />
    </>
  );
}
