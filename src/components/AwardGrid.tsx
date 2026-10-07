import type { Award } from "../data/facts";

const COLS: Record<number, string> = {
  4: "sm:grid-cols-2 lg:grid-cols-4",
  6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

/* Awards row: year in red, the awarding body's logo, title and source. */
export default function AwardGrid({ awards, className = "" }: { awards: Award[]; className?: string }) {
  return (
    <div className={`grid grid-cols-1 ${COLS[awards.length] ?? "sm:grid-cols-2 lg:grid-cols-5"} border-t border-(--hair) ${className}`}>
      {awards.map((a) => (
        <div
          key={`${a.year}-${a.title}-${a.by}`}
          className="min-h-43.75 p-5 pr-7 border-r border-(--hair) last:border-r-0 grid grid-cols-[1fr_60px] gap-y-0"
        >
          <b className="font-['Fira_Sans_Condensed'] text-(--red) text-[40px]">{a.year}</b>
          <img src={`/media/${a.logo}`} alt="" className="justify-self-end w-15 h-6.25 object-contain" />
          <strong className="col-span-2 mt-7 text-sm font-semibold">{a.title}</strong>
          <small className="col-span-2 text-(--mute) leading-snug mt-2 text-sm">{a.by}</small>
        </div>
      ))}
    </div>
  );
}
