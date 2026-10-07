import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

/* Eyebrow and h2 on the left, a short paragraph on the right, as in the
   homepage's "Six steps, all ours" header. */
export default function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
      <div className="flex flex-col gap-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="max-w-[16ch] text-balance font-['Fira_Sans_Condensed'] text-[40px] font-black leading-[0.98] md:text-[54px]">
          {title}
        </h2>
      </div>
      {children && <div className="flex max-w-107.5 flex-col gap-4 leading-relaxed text-(--mute)">{children}</div>}
    </div>
  );
}
