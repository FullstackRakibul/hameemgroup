import type { CSSProperties, ReactNode } from "react";

/* Line-art garment icons, drawn on a 48×48 grid in currentColor */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONS: Record<string, ReactNode> = {
  machine: (
    <g {...S}>
      <path d="M6 40h36M10 40V14a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v8H22v18" />
      <path d="M30 22v8M28 30h4" />
      <circle cx="34" cy="16" r="2.5" />
      <path d="M18 10V6h6v4" />
    </g>
  ),
  scissors: (
    <g {...S}>
      <circle cx="12" cy="36" r="5" />
      <circle cx="24" cy="40" r="5" />
      <path d="M15.5 32.5 40 8M21 36.5 38 12" />
    </g>
  ),
  spool: (
    <g {...S}>
      <path d="M12 8h24M12 40h24M16 8v32M32 8v32" />
      <path d="M16 14h16M16 19h16M16 24h16M16 29h16M16 34h16" />
    </g>
  ),
  needle: (
    <g {...S}>
      <path d="M10 38 38 10" />
      <ellipse cx="35.5" cy="12.5" rx="1.2" ry="3" transform="rotate(45 35.5 12.5)" />
      <path d="M36 12c6 4 4 14-4 16s-14 6-10 14" />
    </g>
  ),
  button: (
    <g>
      <circle cx="24" cy="24" r="16" fill="currentColor" />
      <circle cx="19" cy="19" r="2.5" fill="var(--mist)" />
      <circle cx="29" cy="19" r="2.5" fill="var(--mist)" />
      <circle cx="19" cy="29" r="2.5" fill="var(--mist)" />
      <circle cx="29" cy="29" r="2.5" fill="var(--mist)" />
    </g>
  ),
  form: (
    <g {...S}>
      <path d="M17 6h14c0 6-4 8-4 12s7 6 7 12H14c0-6 7-8 7-12s-4-6-4-12Z" />
      <path d="M24 30v12M16 44l8-2 8 2" />
    </g>
  ),
  hanger: (
    <g {...S}>
      <path d="M20 12a4 4 0 1 1 4 4v4" />
      <path d="M24 20 5 34a2 2 0 0 0 1 3.5h36a2 2 0 0 0 1-3.5Z" />
    </g>
  ),
  iron: (
    <g {...S}>
      <path d="M6 36h34a2 2 0 0 0 2-2c0-9-6-16-16-16H16" />
      <path d="M8 36c0-8 6-14 14-14h20" />
      <path d="M16 18v-4h16a4 4 0 0 1 4 4" />
      <circle cx="30" cy="30" r="1" fill="currentColor" />
    </g>
  ),
};

/* Side zones (0–14%, 86–100%) and the band below the stats only */
const PLACES = [
  { icon: "machine", left: 3, top: 10, size: 72, rot: -6, delay: 0, dur: 9, op: 0.15, mobile: true },
  { icon: "scissors", left: 89, top: 8, size: 52, rot: 12, delay: -2, dur: 8, op: 0.18, red: true, mobile: true },
  { icon: "spool", left: 7, top: 42, size: 44, rot: 8, delay: -4, dur: 10, op: 0.14 },
  { icon: "form", left: 90, top: 38, size: 64, rot: -4, delay: -1, dur: 11, op: 0.13 },
  { icon: "needle", left: 4, top: 72, size: 48, rot: -10, delay: -6, dur: 7, op: 0.16 },
  { icon: "hanger", left: 88, top: 70, size: 56, rot: 6, delay: -3, dur: 9, op: 0.15 },
  { icon: "button", left: 30, top: 93, size: 36, rot: 0, delay: -5, dur: 8, op: 0.2, red: true, mobile: true },
  { icon: "iron", left: 64, top: 92, size: 56, rot: -8, delay: -7, dur: 10, op: 0.14, mobile: true },
];

export default function GarmentIcons() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {PLACES.map((p) => (
        <div
          key={p.icon}
          className={`absolute ${p.mobile ? "block" : "hidden md:block"}`}
          style={{ left: `${p.left}%`, top: `${p.top}%`, transform: `rotate(${p.rot}deg)` }}
        >
          <svg
            viewBox="0 0 48 48"
            className="garment-float h-(--s) w-(--s) motion-reduce:animate-none max-md:h-[calc(var(--s)*0.7)] max-md:w-[calc(var(--s)*0.7)]"
            style={{
              "--s": `${p.size}px`,
              color: p.red ? "var(--red)" : "var(--ink)",
              opacity: p.red ? 0.2 : p.op,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            } as CSSProperties}
          >
            {ICONS[p.icon]}
          </svg>
        </div>
      ))}
    </div>
  );
}

/* Single icons, for reuse elsewhere (FoundedOrbit) */
const single = (name: string) =>
  function Icon({ className = "" }: { className?: string }) {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
        {ICONS[name]}
      </svg>
    );
  };
export const NeedleIcon = single("needle");
export const ButtonIcon = single("button");
export const ScissorsIcon = single("scissors");
export const SpoolIcon = single("spool");
