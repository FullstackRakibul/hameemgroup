import type { ReactNode } from "react";
import SmartLink from "./SmartLink";

export type FactRow = { label: string; value?: ReactNode; to?: string; linkText?: string };

/* Label and value rows between hairlines, for processes and capabilities. */
export default function FactList({ rows }: { rows: FactRow[] }) {
  return (
    <dl className="border-t border-(--hair)">
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid gap-2 border-b border-(--hair) py-5 md:grid-cols-[minmax(0,280px)_1fr] md:gap-10"
        >
          <dt className="pt-0.5 text-xs font-semibold tracking-[0.12em] text-(--red) uppercase">{r.label}</dt>
          <dd className="flex flex-col items-start gap-2 leading-relaxed text-(--ink) md:flex-row md:items-baseline md:justify-between md:gap-8">
            <span>{r.value}</span>
            {r.to && (
              <SmartLink
                href={r.to}
                className="shrink-0 text-sm font-semibold whitespace-nowrap text-(--mute)! transition-colors hover:text-(--red)!"
              >
                {r.linkText ?? "More"} →
              </SmartLink>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
