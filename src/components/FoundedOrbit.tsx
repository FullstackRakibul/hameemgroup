import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { F } from "../data/facts";
import { ButtonIcon, NeedleIcon, ScissorsIcon, SpoolIcon } from "./GarmentIcons";

/* Chips at 0°, 90°, 180° and 270° on the outer ring */
const CHIPS = [
  { Icon: NeedleIcon, pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { Icon: ButtonIcon, pos: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2" },
  { Icon: ScissorsIcon, pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
  { Icon: SpoolIcon, pos: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" },
];

// How far each layer leans toward the pointer, in px at full reach
const DEPTHS = [2.5, 4, 6]; // outer ring, inner ring, centre disc

/* Leans the badge's layers toward the pointer at different depths, from lg
   with a mouse. One rAF lerp that stops once every layer has settled. */
function useParallax(layers: RefObject<(HTMLDivElement | null)[]>, box: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = box.current;
    const area = el?.closest("section");
    if (!el || !area) return;
    const mq = window.matchMedia("(min-width: 64rem) and (hover: hover) and (prefers-reduced-motion: no-preference)");

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;

    const paint = () => {
      layers.current.forEach((layer, i) => {
        if (layer) layer.style.transform = `translate3d(${x * DEPTHS[i]}px, ${y * DEPTHS[i]}px, 0)`;
      });
    };
    const tick = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      if (Math.abs(tx - x) < 0.002 && Math.abs(ty - y) < 0.002) {
        x = tx;
        y = ty;
        frame = 0;
        paint();
        return;
      }
      paint();
      frame = requestAnimationFrame(tick);
    };
    const aim = (nx: number, ny: number) => {
      tx = nx;
      ty = ny;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !mq.matches) return;
      const r = el.getBoundingClientRect();
      // -1…1 across a reach of one badge width either side of its centre
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      aim(clamp((e.clientX - (r.left + r.width / 2)) / r.width), clamp((e.clientY - (r.top + r.height / 2)) / r.height));
    };
    const onLeave = () => aim(0, 0);
    const onChange = () => !mq.matches && aim(0, 0);

    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);
    mq.addEventListener("change", onChange);
    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      mq.removeEventListener("change", onChange);
    };
  }, [layers, box]);
}

/* The founded badge, in black and white: an ink disc with the year, two
   dashed rings turning, white chips with the trade's tools, and one navy
   needle dot riding the outer ring. */
export default function FoundedOrbit() {
  const box = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  useParallax(layers, box);
  const layer = (i: number) => (el: HTMLDivElement | null) => {
    layers.current[i] = el;
  };

  return (
    <div ref={box} className="relative mx-auto size-55 lg:size-70">
      {/* Outer ring: dashed border, chips and the needle dot turn together */}
      <div ref={layer(0)} aria-hidden="true" className="absolute inset-0 will-change-transform">
        <div className="orbit-spin absolute inset-0 rounded-full border-[1.5px] border-dashed border-(--hair) motion-reduce:animate-none">
          <span className="absolute left-[85.36%] top-[14.64%] size-2 -translate-1/2 rounded-full bg-(--navy)" />
          {CHIPS.map(({ Icon, pos }, i) => (
            <span
              key={i}
              className={`orbit-counter absolute ${pos} grid size-10 place-items-center rounded-full border border-(--hair) bg-white text-(--ink) motion-reduce:animate-none`}
            >
              <Icon className="size-6" />
            </span>
          ))}
        </div>
      </div>

      {/* Inner ring, turning the other way */}
      <div ref={layer(1)} aria-hidden="true" className="absolute inset-[14%] will-change-transform">
        <div className="orbit-spin-reverse absolute inset-0 rounded-full border border-dashed border-(--hair) motion-reduce:animate-none" />
      </div>

      {/* Centre disc */}
      <div ref={layer(2)} className="absolute inset-[26%] will-change-transform">
        <div className="soft-pulse flex size-full flex-col items-center justify-center rounded-full bg-(--heading) text-center text-white motion-reduce:animate-none">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-white/80">FOUNDED IN</span>
          <span className="font-['Fira_Sans_Condensed'] text-5xl font-black leading-none">{F.established}</span>
          <span className="mt-1 text-[9px] tracking-[0.18em] text-white/70">BANGLADESH</span>
        </div>
      </div>
    </div>
  );
}
