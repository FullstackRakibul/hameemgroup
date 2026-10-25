import type { CSSProperties } from "react";
import { ButtonIcon, NeedleIcon, ScissorsIcon, SpoolIcon } from "./GarmentIcons";

/* Edges and corners only: nothing in the central 30–70% column where text sits */
const PLACES = [
  { Icon: ScissorsIcon, left: 3, top: 12, size: 48, rot: -12, delay: 0, dur: 11, op: 0.06 },
  { Icon: SpoolIcon, left: 12, top: 38, size: 32, rot: 8, delay: -3, dur: 13, op: 0.05 },
  { Icon: NeedleIcon, left: 5, top: 66, size: 44, rot: -6, delay: -6, dur: 9, op: 0.07, red: true },
  { Icon: ButtonIcon, left: 18, top: 86, size: 28, rot: 0, delay: -2, dur: 12, op: 0.05 },
  { Icon: SpoolIcon, left: 24, top: 6, size: 30, rot: -10, delay: -8, dur: 14, op: 0.05 },
  { Icon: NeedleIcon, left: 92, top: 9, size: 40, rot: 14, delay: -4, dur: 10, op: 0.06 },
  { Icon: ButtonIcon, left: 84, top: 30, size: 34, rot: 0, delay: -7, dur: 12, op: 0.06, red: true },
  { Icon: ScissorsIcon, left: 93, top: 52, size: 56, rot: 10, delay: -1, dur: 13, op: 0.05 },
  { Icon: SpoolIcon, left: 80, top: 78, size: 40, rot: 6, delay: -5, dur: 11, op: 0.07 },
  { Icon: ScissorsIcon, left: 72, top: 92, size: 30, rot: -8, delay: -9, dur: 14, op: 0.05 },
];

/** Faint garment icons floating at the viewport edges, on every page. */
export default function GarmentBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 hidden overflow-hidden mix-blend-multiply md:block">
      {PLACES.map(({ Icon, left, top, size, rot, delay, dur, op, red }, i) => (
        <span key={i} className="absolute" style={{ left: `${left}%`, top: `${top}%`, transform: `rotate(${rot}deg)`, "--s": `${size}px` } as CSSProperties}>
          <span
            className="garment-float block motion-reduce:animate-none"
            style={{ color: red ? "var(--red)" : "var(--ink)", opacity: op, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
          >
            <Icon className="block size-(--s)" />
          </span>
        </span>
      ))}
    </div>
  );
}
