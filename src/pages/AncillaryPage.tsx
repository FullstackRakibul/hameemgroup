import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import FactList from "../components/FactList";
import Gallery from "../components/Gallery";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { ANCILLARY_UNITS, CARTON_UNIT } from "../data/units";
import { BUSINESS_CRUMBS } from "./crumbs";

export default function AncillaryPage() {
  usePageMeta(
    "Ancillary industries",
    `Ha-Meem's ancillary units: embroidery, printing, cartons (${CARTON_UNIT.name}), poly bags, labels, jute and chemical formulation.`,
  );

  return (
    <>
      <PageHero
        image="biz/packaging.jpg"
        imageAlt="A worker feeding corrugated board into a carton machine"
        eyebrow="BUSINESSES"
        title="Ancillary industries"
        intro="The units around the sewing line, from cartons and poly bags to jute and chemicals."
        crumbs={BUSINESS_CRUMBS}
        current="Ancillary industries"
      />

      <Section>
        <SectionHeader eyebrow="ANCILLARY" title="Supporting units.">
          <p>Trims, packaging and materials made inside the group.</p>
        </SectionHeader>
        <FactList rows={ANCILLARY_UNITS} />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="GALLERY" title="Packing and trims." />
        <Gallery
          label="Ancillary industries photos"
          images={[
            { src: "biz/label.jpg", alt: "Folded fabrics and a woven label" },
            { src: "chain-trims.jpg", alt: "Embroidery machines and operators" },
          ]}
        />
      </Section>

      <ContactCta />
    </>
  );
}
