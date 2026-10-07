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

export default function EmbroideryPage() {
  usePageMeta(
    "Embroidery, printing & accessories",
    `${F.inHouseAccessories} in-house accessories at Ha-Meem: ${F.embroideryMachines} embroidery machines, ${F.printsMonth} printed pieces and ${F.labelsMonth} labels a month.`,
  );

  return (
    <>
      <PageHero
        image="biz/embroidery.jpg"
        imageAlt="A row of multi-head embroidery machines stitching denim pocket panels"
        eyebrow="BUSINESSES"
        title="Embroidery, printing & accessories"
        intro={`${F.inHouseAccessories} in-house accessories, from embroidery and print to labels and elastic.`}
        crumbs={BUSINESS_CRUMBS}
        current="Embroidery, printing & accessories"
      />

      <Section>
        <SectionHeader eyebrow="BACKWARD LINKAGE" title={`${F.inHouseAccessories} in-house accessories.`}>
          <p>
            Embroidery, printing and accessories were set up in {F.embroiderySince} to strengthen backward linkage.
            Trims, prints and labels now come from inside the group.
          </p>
        </SectionHeader>
        <StatGrid
          className="border-t border-(--hair)"
          stats={[
            { value: F.embroideryMachines, label: "EMBROIDERY MACHINES" },
            { value: F.printsMonth, label: "PIECES PRINTED A MONTH" },
            { value: F.narrowFabricMonth, label: "YARDS A MONTH", sub: "Narrow fabric and elastic" },
            { value: F.labelsMonth, label: "LABELS A MONTH" },
          ]}
        />
        <FactList
          rows={[
            {
              label: "Embroidery",
              value: `Set up in ${F.embroiderySince}. ${F.embroideryMachines} machines, Japanese Tajima and Chinese, including sequin machines.`,
            },
            {
              label: "Printing",
              value: `Screen printing on woven, twill and knit. Nylon, pigment, emboss, photo, rubber, digital and sublimation prints, with OEKO-TEX certified colours and chemicals. ${F.printsMonth} pieces a month.`,
            },
            {
              label: "Accessories",
              value: `Crochet, needle loom, starching, jacquard and finishing machines. Belts, twill tape, elastic, buttons, zippers, hangers, and paper and woven labels. ${F.narrowFabricMonth} yards of narrow fabric and elastic a month.`,
            },
            { label: "Labels", value: `Swiss Müller machines, ${F.labelsMonth} pieces a month.` },
          ]}
        />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="GALLERY" title="Trims, made in-house." />
        <Gallery
          label="Embroidery, printing and accessories photos"
          images={[
            { src: "chain-trims.jpg", alt: "Operators loading garments into embroidery machines" },
            { src: "biz/label.jpg", alt: "Folded fabrics and a woven label" },
          ]}
        />
      </Section>

      <ContactCta />
    </>
  );
}
