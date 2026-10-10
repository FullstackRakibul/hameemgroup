import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

/* The one section header: eyebrow and h2 on the left; the intro paragraph
   stacked under the heading, or to the right and bottom-aligned from 1024px.
   Reveals as one block. */
export default function SectionHeader({
  eyebrow,
  title,
  children,
  titleClassName = "max-w-[20ch] font-black",
  className = "",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  titleClassName?: string;
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={`flex flex-col gap-head-intro lg:flex-row lg:items-end lg:justify-between lg:gap-16 ${className}`}
    >
      <div className="flex flex-col gap-head-eyebrow">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className={`text-balance font-['Fira_Sans_Condensed'] text-h2 ${titleClassName}`}>{title}</h2>
      </div>
      {children && (
        <div className="flex max-w-[60ch] flex-col gap-4 text-intro text-pretty text-(--mute) lg:max-w-107.5 lg:shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
