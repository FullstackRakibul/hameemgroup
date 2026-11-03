import type { ReactNode } from "react";

/* Line-art garment icons, drawn on a 48×48 grid in currentColor. Used by the
   founded badge and the page-edge backdrop. */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONS: Record<string, ReactNode> = {
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
};

/* Single icons, for FoundedOrbit and GarmentBackdrop */
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
