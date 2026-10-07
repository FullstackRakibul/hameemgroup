import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import FactList from "../components/FactList";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { F } from "../data/facts";
import { COMPANY_CRUMBS } from "./crumbs";

export default function MerchandisingPage() {
  usePageMeta(
    "Merchandising",
    `${F.merchandisers} Ha-Meem merchandisers link each buyer to the factories, in sub-groups by buyer, with the group's own C&F offices at every Bangladeshi port.`,
  );

  return (
    <>
      <PageHero
        image="products/showroom.jpg"
        imageAlt="Buyers and merchandisers reviewing a denim collection in the Ha-Meem showroom"
        eyebrow="COMPANY"
        title="Merchandising"
        intro={`${F.merchandisers} merchandisers between our buyers and our factories.`}
        crumbs={COMPANY_CRUMBS}
        current="Merchandising"
      />

      <Section>
        <SectionHeader eyebrow="HOW WE WORK" title="One team for each buyer.">
          <p>
            Our merchandisers link each buyer to the factories. They work in sub-groups organised by buyer, so that
            goods ship on time.
          </p>
        </SectionHeader>
        <FactList
          rows={[
            { label: "Merchandisers", value: `${F.merchandisers} merchandisers link each buyer to the factories.` },
            { label: "Buyer sub-groups", value: "Organised into sub-groups by buyer, so that goods ship on time." },
            {
              label: "Clearing & forwarding",
              value: "Our own C&F offices at every Bangladeshi port clear and forward shipments quickly.",
            },
          ]}
        />
        <Link
          to="/contact#merchandising"
          className="inline-block self-start px-8 py-4 border border-(--ink) rounded-full text-xs font-semibold tracking-widest hover:bg-(--ink) hover:text-white! transition-colors duration-300"
        >
          MERCHANDISING CONTACTS
        </Link>
      </Section>

      <ContactCta />
    </>
  );
}
