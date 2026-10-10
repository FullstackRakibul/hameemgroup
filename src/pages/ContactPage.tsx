import PageHero from "../components/PageHero";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import PersonCard from "../components/PersonCard";
import Eyebrow from "../components/Eyebrow";
import usePageMeta from "../components/usePageMeta";
import { EMAIL, HEAD_OFFICE, telHref } from "../data/facts";
import { MANAGEMENT, MERCHANDISING_CONTACTS } from "../data/units";
import { COMPANY_CRUMBS } from "./crumbs";

const linkClass = "inline-flex min-h-11 items-center text-(--red) font-medium underline-offset-4 hover:underline";

export default function ContactPage() {
  usePageMeta(
    "Contact",
    `Contact Ha-Meem Group: head office at ${HEAD_OFFICE.lines.join(", ")}. Sourcing ${EMAIL.sales}, careers ${EMAIL.careers}.`,
  );

  return (
    <>
      <PageHero
        image="biz/gate.jpg"
        imageAlt="Gate of a Ha-Meem factory, behind trees"
        eyebrow="CONTACT"
        title="Get in touch."
        intro="Questions about sourcing, careers or the group? Write to us or call the head office."
        crumbs={COMPANY_CRUMBS}
        current="Contact"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-10">
            <div data-reveal className="flex flex-col">
              <Eyebrow>HEAD OFFICE</Eyebrow>
              <h2 className="mt-head-eyebrow max-w-[16ch] text-balance font-['Fira_Sans_Condensed'] text-h2 font-black">
                {HEAD_OFFICE.name}
              </h2>
              <address className="mt-head-intro not-italic text-intro text-(--mute)">
                {HEAD_OFFICE.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <ul className="mt-3 flex flex-col">
                {HEAD_OFFICE.phones.map((phone) => (
                  <li key={phone}>
                    <a href={telHref(phone)} className={linkClass}>
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <dl className="grid gap-6 border-t border-(--hair) pt-8 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex flex-col gap-2">
                <dt className="text-xs font-semibold tracking-[0.12em] text-(--ink)">SOURCING ENQUIRIES</dt>
                <dd>
                  <a href={`mailto:${EMAIL.sales}`} className={linkClass}>
                    {EMAIL.sales}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="text-xs font-semibold tracking-[0.12em] text-(--ink)">CAREERS</dt>
                <dd>
                  <a href={`mailto:${EMAIL.careers}`} className={linkClass}>
                    {EMAIL.careers}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <iframe
            title="Map: Ha-Meem Group head office, Tejgaon Industrial Area, Dhaka"
            src={HEAD_OFFICE.map.embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-90 w-full border border-(--hair) bg-(--mist) lg:h-full lg:min-h-105"
          />
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeader eyebrow="MANAGEMENT" title="Management.">
          <p>The group&apos;s founders and senior leadership.</p>
        </SectionHeader>
        <div data-reveal-stagger className="grid gap-grid sm:grid-cols-2">
          {MANAGEMENT.map((p) => (
            <PersonCard key={p.name} person={p} />
          ))}
        </div>
      </Section>

      <Section id="merchandising">
        <SectionHeader eyebrow="MERCHANDISING" title="Merchandising contacts.">
          <p>For an existing order or programme, write to the merchandising team directly.</p>
        </SectionHeader>
        <div data-reveal-stagger className="grid gap-grid sm:grid-cols-2 lg:grid-cols-4">
          {MERCHANDISING_CONTACTS.map((p) => (
            <PersonCard key={p.email} person={p} tone="mist" />
          ))}
        </div>
      </Section>
    </>
  );
}
