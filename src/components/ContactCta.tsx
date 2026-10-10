import { EMAIL } from "../data/facts";
import Eyebrow from "./Eyebrow";

const pill =
  "btn-ring inline-flex min-h-12 items-center rounded-full border border-white px-8 text-[11px] font-semibold tracking-widest transition-colors duration-300";

/* Dark closing band: "Sourcing from Bangladesh?" with the two pill buttons. */
export default function ContactCta({ id }: { id?: string }) {
  return (
    <section id={id} className="relative overflow-hidden text-white bg-(--ink) [--ring:#fff]">
      <img src="/media/cine/fabric.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[rgba(10,14,18,0.88)]" />
      <div data-reveal className="wrap relative z-1 flex flex-col items-center section-y text-center">
        <Eyebrow className="text-white!">WORK WITH US</Eyebrow>
        <h2 className="mt-head-eyebrow text-balance font-['Fira_Sans_Condensed'] text-statement font-black tracking-widest">
          Sourcing from
          <br />
          Bangladesh?
        </h2>
        <p className="mt-head-intro max-w-[60ch] text-pretty text-intro text-[#d9dadb]">
          One partner from yarn to vessel. Tell us what you make
          <br className="hidden sm:inline" /> and we will tell you where it fits.
        </p>
        <div className="mt-cta flex flex-wrap justify-center gap-3">
          <a className={`${pill} bg-white text-(--ink) hover:bg-transparent hover:text-white`} href={`mailto:${EMAIL.sales}`}>
            TALK TO SALES
          </a>
          <a className={`${pill} bg-black text-white hover:bg-white hover:text-(--ink)`} href={`mailto:${EMAIL.careers}`}>
            CAREERS
          </a>
        </div>
      </div>
    </section>
  );
}
