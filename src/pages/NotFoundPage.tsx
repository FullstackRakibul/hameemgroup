import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Section from "../components/Section";
import usePageMeta from "../components/usePageMeta";

export default function NotFoundPage() {
  usePageMeta("Page not found", "The page you asked for does not exist on the Ha-Meem Group site.");

  return (
    <>
      <PageHero
        image="cine/fabric.jpg"
        imageAlt="Rolls of indigo denim fabric"
        eyebrow="ERROR"
        title="Page not found"
        intro="The page you asked for does not exist, or has moved."
        crumbs={[{ label: "Home", to: "/" }]}
        current="Page not found"
      />
      <Section>
        <Link
          to="/"
          className="inline-block self-start px-8 py-4 border border-(--ink) rounded-full text-xs font-semibold tracking-widest hover:bg-(--ink) hover:text-white! transition-colors duration-300"
        >
          BACK TO THE HOMEPAGE
        </Link>
      </Section>
    </>
  );
}
