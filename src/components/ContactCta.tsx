import { EMAIL } from "../data/facts";
import Eyebrow from "./Eyebrow";

/* Dark closing band: "Sourcing from Bangladesh?" with the two pill buttons.
   Link text colours carry ! because index.css resets a { color: inherit }
   outside Tailwind's layers. */
export default function ContactCta({ id }: { id?: string }) {
  return (
    <section id={id} className="relative min-h-137.5 md:h-160.5 overflow-hidden text-white bg-(--ink)">
      <img src="/media/cine/fabric.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[rgba(10,14,18,0.88)]" />
      <div className="relative z-1 flex flex-col gap-8 text-center pt-28 md:pt-32 px-5">
        <Eyebrow className="text-white!">WORK WITH US</Eyebrow>
        <h2 className="font-['Fira_Sans_Condensed'] tracking-widest font-black text-[50px] md:text-[72px] leading-[0.84] mt-14 mb-4">
          Sourcing from
          <br />
          Bangladesh?
        </h2>
        <p className="text-[#d9dadb] leading-relaxed mb-9">
          One partner from yarn to vessel. Tell us what you make
          <br />
          and we will tell you where it fits.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            className="inline-block px-8 py-4 bg-white text-(--ink)! border border-white rounded-full text-[11px] font-semibold tracking-widest hover:bg-transparent hover:text-white! transition-colors duration-300"
            href={`mailto:${EMAIL.sales}`}
          >
            TALK TO SALES
          </a>
          <a
            className="inline-block px-8 py-4 bg-black text-white! border border-white rounded-full text-[11px] font-semibold tracking-widest hover:bg-white hover:text-(--ink)! transition-colors duration-300"
            href={`mailto:${EMAIL.careers}`}
          >
            CAREERS
          </a>
        </div>
      </div>
    </section>
  );
}
