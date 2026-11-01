import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

/* The one section header: eyebrow and h2 on the left; the intro paragraph
   stacked under the heading, or to the right and bottom-aligned from 1024px.
   Reveals as one block.

   Every variant lives here, so no section styles its own header. The defaults
   reproduce the original split, left, light, h2 header, which is what the
   thirty-odd inner-page calls rely on. */
export default function SectionHeader({
  eyebrow,
  title,
  children,
  layout = "split",
  align = "left",
  tone = "light",
  size = "h2",
  titleClassName = "max-w-[20ch]",
  className = "",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  /** split: intro beside the heading from 1024px. stacked: always under it. */
  layout?: "split" | "stacked";
  /** center also forces stacked: a centred header has nothing to sit beside. */
  align?: "left" | "center";
  /** dark is for headers over photos. */
  tone?: "light" | "dark";
  size?: "h2" | "statement";
  titleClassName?: string;
  className?: string;
}) {
  const centered = align === "center";
  const split = layout === "split" && !centered;
  const dark = tone === "dark";

  return (
    <div
      data-reveal
      data-section-header
      className={`flex flex-col gap-head-intro ${
        centered ? "items-center text-center" : ""
      } ${split ? "lg:flex-row lg:items-end lg:justify-between lg:gap-16" : ""} ${className}`}
    >
      <div className={`flex flex-col gap-head-eyebrow ${centered ? "items-center" : ""}`}>
        {/* Eyebrow colours itself from currentColor, so the dark tone only
            needs the text switched to white. */}
        <Eyebrow className={dark ? "text-white!" : ""}>{eyebrow}</Eyebrow>
        <h2
          className={`text-balance font-['Fira_Sans_Condensed'] font-semibold ${
            size === "statement" ? "text-statement" : "text-h2"
          } ${dark ? "text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]" : "text-(--heading)"} ${titleClassName}`}
        >
          {title}
        </h2>
      </div>
      {children && (
        <div
          className={`flex max-w-[60ch] flex-col gap-4 text-intro text-pretty ${
            dark ? "text-[#d5d6d7] [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]" : "text-(--mute)"
          } ${split ? "lg:max-w-107.5 lg:shrink-0" : ""}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
