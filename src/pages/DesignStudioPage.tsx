import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import StatGrid from "../components/StatGrid";
import FactList from "../components/FactList";
import Gallery from "../components/Gallery";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { F } from "../data/facts";
import { BUSINESS_CRUMBS } from "./crumbs";

export default function DesignStudioPage() {
  usePageMeta(
    "Design & sampling",
    `Ha-Meem's design studio presents seasonal collections to buyers in the USA and Europe; its ${F.sampleMachines}-machine sample section makes about ${F.samplesDay} samples a day.`,
  );

  return (
    <>
      <PageHero
        image="biz/design.jpg"
        imageAlt="The Ha-Meem design studio showroom, with denim and garments on display"
        eyebrow="BUSINESSES"
        title="Design & sampling"
        intro="From a seasonal collection to an approved pre-production sample."
        crumbs={BUSINESS_CRUMBS}
        current="Design & sampling"
      />

      <Section>
        <SectionHeader eyebrow="DESIGN STUDIO" title="Designed with our buyers.">
          <p>
            Designers from Bangladesh and abroad follow current trends and present seasonal collections to buyers in
            the USA and Europe, working closely with the buyers&apos; own designers.
          </p>
        </SectionHeader>
        <FactList
          rows={[
            { label: "Team", value: "Designers from Bangladesh and abroad who follow current trends." },
            { label: "Presentations", value: "Seasonal collections for buyers in the USA and Europe." },
            { label: "With buyers", value: "Close work with each buyer's own designers." },
            {
              label: "Research",
              value: "Fairs including Première Vision, Bread & Butter and Texworld, and WGSN.",
            },
            { label: "Development", value: "Work with fabric suppliers to develop the right product." },
          ]}
        />
      </Section>

      <Section tone="mist" id="samples">
        <SectionHeader eyebrow="SAMPLE SECTION" title={`About ${F.samplesDay} samples a day.`}>
          <p>
            Some of the technical team hold fit certifications from Kohl&apos;s, GAP and JCPenney, and may approve
            pre-production samples.
          </p>
        </SectionHeader>
        <StatGrid
          className="border-t border-(--hair)"
          stats={[
            { value: F.sampleMachines, label: "MACHINES", sub: "In the sample section" },
            { value: F.samplesDay, label: "SAMPLES A DAY", sub: "Approximately" },
          ]}
        />
        <FactList
          rows={[
            { label: "Equipment", value: "Auto pattern cutters, Lectra and Gerber CAD, and fitting mannequins." },
            { label: "Pattern masters", value: "Dedicated computer-based pattern masters for each buyer." },
            {
              label: "Fit approval",
              value: "Fit certifications from Kohl's, GAP and JCPenney; approval of pre-production samples.",
            },
          ]}
        />
      </Section>

      <Section>
        <SectionHeader eyebrow="GALLERY" title="Studio and samples." />
        <Gallery
          label="Design and sampling photos"
          images={[
            { src: "products/showroom.jpg", alt: "Buyers reviewing a denim collection in the showroom" },
            { src: "products/bottoms.jpg", alt: "Coloured trousers from a seasonal range" },
          ]}
        />
      </Section>

      <ContactCta />
    </>
  );
}
