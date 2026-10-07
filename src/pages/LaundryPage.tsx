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
import { WASHING_PLANTS } from "../data/units";
import { BUSINESS_CRUMBS } from "./crumbs";

export default function LaundryPage() {
  usePageMeta(
    "Washing & finishing",
    `Ha-Meem's ${F.washingPlantsWord} washing plants have a wash capacity of ${F.washYear} pieces a year, with ${F.laserMachines} laser machines and ${F.ozoneMachines} ozone machines.`,
  );

  return (
    <>
      <PageHero
        image="biz/laundry.jpg"
        imageAlt="A row of industrial washing machines in a Ha-Meem washing plant"
        eyebrow="BUSINESSES"
        title="Washing & finishing"
        intro="One of the largest washing operations in Bangladesh."
        crumbs={BUSINESS_CRUMBS}
        current="Washing & finishing"
      />

      <Section>
        <SectionHeader eyebrow="WASHING" title="Every plant, dry process.">
          <p>
            Our washing plants run Italian Tonello machines, and every plant has dry-process capability. Wash
            technicians come from Turkey, Sri Lanka and the Philippines.
          </p>
        </SectionHeader>
        <StatGrid
          className="border-t border-(--hair)"
          stats={[
            { value: F.washYear, label: "WASH CAPACITY A YEAR" },
            { value: F.washingPlants, label: "WASHING PLANTS" },
            { value: F.laserMachines, label: "LASER MACHINES" },
            { value: F.ozoneMachines, label: "OZONE MACHINES" },
          ]}
        />
        <FactList
          rows={[
            {
              label: "Processes",
              value:
                "Hand brushing, whisker (3D and laser), PP spray, tearing, grinding, oven curing, over-dyeing, tinting and ozone washing.",
            },
            { label: "Machines", value: "Italian Tonello machines; dry-process capability in every plant." },
            {
              label: "Development centre",
              value: "A mini-lab in the washing plant, run by a professional dyeing master, makes first samples.",
            },
            { label: "Technicians", value: "Wash technicians from Turkey, Sri Lanka and the Philippines." },
          ]}
        />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="PLANTS" title="Washing plants.">
          <p>Each plant listed has dry-process and over-dyeing capability.</p>
        </SectionHeader>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WASHING_PLANTS.map((u) => (
            <li key={u.name}>
              <UnitCard unit={u} />
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeader eyebrow="GALLERY" title="In the wash." />
        <Gallery
          label="Washing and finishing photos"
          images={[
            { src: "chain-wash.jpg", alt: "Washing machines along a plant aisle" },
            { src: "cine/laser.jpg", alt: "A laser finishing denim" },
            { src: "products/jeans.jpg", alt: "Washed denim jeans on a rail" },
          ]}
        />
      </Section>

      <ContactCta />
    </>
  );
}
