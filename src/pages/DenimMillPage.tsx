import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import StatGrid from "../components/StatGrid";
import FactList from "../components/FactList";
import UnitCard from "../components/UnitCard";
import BuyerGrid from "../components/BuyerGrid";
import Gallery from "../components/Gallery";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { DENIM_SITE_URL, F } from "../data/facts";
import { DENIM_UNIT } from "../data/units";
import { BUSINESS_CRUMBS } from "./crumbs";

export default function DenimMillPage() {
  usePageMeta(
    "Denim mill",
    `Ha-Meem Denim Mills makes ${F.denimYardsMonth} yards of denim and ${F.nonDenimYardsMonth} yards of non-denim fabric a month, from its own yarn, ${F.spinningDay} a day.`,
  );

  return (
    <>
      <PageHero
        image="biz/denim.jpg"
        imageAlt="Rows of looms weaving indigo denim at Ha-Meem Denim"
        eyebrow="BUSINESSES"
        title="Denim mill"
        intro={`Vertical in denim: ${F.denimYardsMonth} yards of denim fabric a month, from our own yarn.`}
        crumbs={BUSINESS_CRUMBS}
        current="Denim mill"
      />

      <Section>
        <SectionHeader eyebrow="DENIM" title="Vertical in denim.">
          <p>
            Ha-Meem Denim weaves, dyes and finishes on a {F.denimSiteAcres}-acre site, making {F.denimYardsMonth}{" "}
            yards of denim and {F.nonDenimYardsMonth} yards of non-denim fabric a month.
          </p>
        </SectionHeader>
        <StatGrid
          className="border-t border-(--hair)"
          stats={[
            { value: F.denimYardsMonth, label: "YARDS OF DENIM A MONTH" },
            { value: F.nonDenimYardsMonth, label: "YARDS OF NON-DENIM A MONTH" },
            { value: F.spinningDay, label: "YARN SPUN A DAY" },
            { value: F.denimSiteAcres, label: "ACRE SITE" },
          ]}
        />
        <FactList
          rows={[
            { label: "Weaving", value: "Picanol looms." },
            { label: "Spinning", value: "Open-end spinning." },
            {
              label: "Dyeing",
              value:
                "Sucker Müller slasher dyeing, and a Morrison rope-dyeing unit for deep, pure indigo and other shades.",
            },
            { label: "Finishing", value: "Flat finishing, mercerizing, and wet finishing on Morrison machines." },
            { label: "Premium finishes", value: "Stenter and coated finishing." },
          ]}
        />
      </Section>

      <Section tone="mist" id="spinning">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <SectionHeader eyebrow="SPINNING" title="Our own yarn.">
            <p>
              Our own spinning mills produce {F.spinningDay} of yarn a day. With every stage in-house, the group is
              vertical in both denim and woven.
            </p>
          </SectionHeader>
          <UnitCard unit={DENIM_UNIT} website={DENIM_SITE_URL || undefined} />
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="IN OUR CUSTOMERS' PRODUCTS" title="Who uses our denim.">
          <p>Ha-Meem denim goes into products for GAP, JCPenney, Kohl&apos;s, PVH and Next.</p>
        </SectionHeader>
        <BuyerGrid ids={["gap", "jcpenney", "kohls", "pvh", "next"]} className="w-full" />
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="GALLERY" title="From yarn to roll." />
        <Gallery
          label="Denim mill photos"
          images={[
            { src: "chain-fabric.jpg", alt: "Indigo denim coming off a finishing range into a trolley" },
            { src: "products/fabric.jpg", alt: "Folded denim and coloured fabric swatches" },
            { src: "chain-spinning.jpg", alt: "Yarn winding frames in the spinning mill" },
          ]}
        />
      </Section>

      <ContactCta />
    </>
  );
}
