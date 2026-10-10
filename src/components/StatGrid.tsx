import type { Stat } from "../data/facts";

const COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

/* The homepage stats row: hairline dividers, condensed numerals, red label,
   grey sub-line. */
export default function StatGrid({ stats, className = "" }: { stats: Stat[]; className?: string }) {
  return (
    <div data-reveal-stagger className={`grid gap-0 ${COLS[stats.length] ?? COLS[4]} ${className}`}>
      {stats.map((s) => (
        <div
          key={s.label}
          className="group relative py-8 px-4 text-center border-r border-(--hair) last:border-r-0 transition-colors duration-300 ease-out hover:bg-(--mist) cursor-default"
        >
          {/* Red accent bar that slides in from center on hover */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-(--red) transition-all duration-500 ease-out group-hover:w-3/4"
          />
          <b className="font-['Fira_Sans_Condensed'] text-[42px] md:text-[52px] font-semibold block leading-none text-(--ink) transition-all duration-300 ease-out group-hover:text-(--red) motion-safe:group-hover:scale-[1.08]">
            {s.value}
          </b>
          <span className="text-(--red) text-[10px] font-semibold tracking-[0.12em] block mt-3 transition-opacity duration-300">
            {s.label}
          </span>
          {s.sub && (
            <span className="text-(--mute) text-[13px] block mt-2 leading-snug transition-colors duration-300 group-hover:text-(--ink)">
              {s.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
