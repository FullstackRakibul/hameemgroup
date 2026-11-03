import { Link } from "react-router-dom";

type Props = {
  /** header: colours from the .site-logo-* rules in index.css (white over the
      hero, red and navy once the header is solid). light / dark: fixed, for
      light and dark backgrounds. */
  tone?: "header" | "light" | "dark";
  /** md: the header. lg: the footer. */
  size?: "md" | "lg";
  className?: string;
};

const TONES = {
  header: { mark: "site-logo-mark ring-white/35", name: "site-logo-name", group: "site-logo-group" },
  light: { mark: "ring-(--hair)", name: "text-(--red)", group: "text-(--navy)" },
  dark: { mark: "ring-white/35", name: "text-white", group: "text-white/85" },
};

const SIZES = {
  md: { mark: "size-10 lg:size-11", name: "text-base lg:text-[1.05rem]", group: "text-[0.56rem]" },
  lg: { mark: "size-12", name: "text-lg", group: "text-[0.62rem]" },
};

/* ── The group's lockup: the round mark and the two-line wordmark ──
   One component for the header and the footer, so the two can't drift
   apart. The mark lifts 1px on hover or focus. */
export default function BrandLockup({ tone = "header", size = "md", className = "" }: Props) {
  const t = TONES[tone];
  const s = SIZES[size];
  return (
    <Link
      to="/"
      aria-label="Ha-Meem Group — home"
      className={`group flex items-center gap-3 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) ${className}`}
    >
      <img
        src="/group-logo-circle.png"
        alt=""
        width={44}
        height={44}
        draggable={false}
        className={`brand-mark shrink-0 rounded-full ring-1 transition-transform duration-250 group-hover:-translate-y-px group-focus-visible:-translate-y-px motion-reduce:transition-none ${s.mark} ${t.mark}`}
      />
      <span className="flex flex-col leading-none">
        <span
          className={`brand-name whitespace-nowrap font-['Montserrat'] font-extrabold uppercase tracking-[0.04em] transition-colors duration-300 ${s.name} ${t.name}`}
        >
          Ha-Meem
        </span>
        <span
          className={`brand-group mt-0.75 whitespace-nowrap font-['Montserrat'] font-semibold uppercase tracking-[0.6em] transition-colors duration-300 ${s.group} ${t.group}`}
        >
          Group
        </span>
      </span>
    </Link>
  );
}
