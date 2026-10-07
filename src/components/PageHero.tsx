import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Eyebrow from "./Eyebrow";

export type Crumb = { label: string; to?: string };

type Props = {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Trail above the eyebrow; the current page is appended. */
  crumbs: Crumb[];
  current: string;
};

/* Dark opening band of every inner page. Dark so the transparent header's
   white text stays readable until the page scrolls. */
export default function PageHero({ image, imageAlt, eyebrow, title, intro, crumbs, current }: Props) {
  return (
    <section className="relative isolate flex min-h-[max(440px,55svh)] items-end overflow-hidden bg-(--ink) text-white">
      <img src={`/media/${image}`} alt={imageAlt} className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[rgba(17,20,24,0.72)]" aria-hidden="true" />

      <div className="wrap flex flex-col gap-5 pt-[calc(var(--header-h)+48px)] pb-16 md:pb-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-[0.04em] text-white/75">
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                {c.to ? (
                  <Link to={c.to} className="underline-offset-4 hover:text-white! hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                <span aria-hidden="true">/</span>
              </li>
            ))}
            <li>
              <span aria-current="page" className="text-white">
                {current}
              </span>
            </li>
          </ol>
        </nav>
        <Eyebrow className="text-white!">{eyebrow}</Eyebrow>
        <h1
          tabIndex={-1}
          className="max-w-[18ch] text-balance font-['Fira_Sans_Condensed'] text-[clamp(44px,6vw,84px)] font-semibold leading-[0.98] tracking-[-0.03em]"
        >
          {title}
        </h1>
        {intro && <p className="max-w-[56ch] text-[17px] leading-relaxed text-[#d5d6d7]">{intro}</p>}
      </div>

      {/* The stitch: a dashed red seam along the bottom edge */}
      <svg className="absolute inset-x-0 bottom-2.5 h-0.5 w-full" aria-hidden="true">
        <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--red)" strokeWidth="2" strokeDasharray="8 6" />
      </svg>
    </section>
  );
}
