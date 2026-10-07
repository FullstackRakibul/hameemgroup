import type { Unit } from "../data/units";

/* A factory or plant: square corners, hairline border, condensed name,
   address in grey and, where known, the line count as a large numeral. */
export default function UnitCard({ unit, website }: { unit: Unit; website?: string }) {
  return (
    <article className="flex h-full flex-col gap-3 border border-(--hair) bg-white p-7">
      <h3 className="font-['Fira_Sans_Condensed'] text-[24px] font-semibold leading-tight">{unit.name}</h3>
      <p className="text-sm leading-relaxed text-(--mute)">
        {unit.address.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      {unit.note && (
        <p className="text-xs font-semibold tracking-[0.08em] text-(--ink) uppercase">{unit.note}</p>
      )}
      {unit.lines && (
        <div className="mt-auto flex flex-col gap-2 border-t border-(--hair) pt-5">
          <b className="font-['Fira_Sans_Condensed'] text-[44px] font-semibold leading-none">{unit.lines}</b>
          <span className="text-[10px] font-semibold tracking-[0.12em] text-(--red)">PRODUCTION LINES</span>
        </div>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-3 text-sm font-semibold text-(--red)! underline-offset-4 hover:underline"
        >
          Visit our website →
        </a>
      )}
    </article>
  );
}
