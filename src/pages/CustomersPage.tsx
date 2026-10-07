import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import BuyerGrid from "../components/BuyerGrid";
import ContactCta from "../components/ContactCta";
import usePageMeta from "../components/usePageMeta";
import { COMPANY_CRUMBS } from "./crumbs";

export default function CustomersPage() {
  usePageMeta(
    "Our customers",
    "The retailers and fashion brands in Europe and America that Ha-Meem Group manufactures for.",
  );

  return (
    <>
      <PageHero
        image="cine/sewing.jpg"
        imageAlt="Operators at work on a Ha-Meem sewing floor"
        eyebrow="OUR CUSTOMERS"
        title="Retailers and brands we manufacture for."
        intro="We work with some of the world's largest fashion brands, in Europe and America."
        crumbs={COMPANY_CRUMBS}
        current="Our customers"
      />

      <Section>
        <SectionHeader eyebrow="OUR CUSTOMERS" title="Our customers.">
          <p>Some of the retailers and brands whose products we make.</p>
        </SectionHeader>
        <BuyerGrid className="w-full" />
      </Section>

      <ContactCta />
    </>
  );
}
