import { F } from "../data/facts";
import { ButtonIcon, NeedleIcon, ScissorsIcon, SpoolIcon } from "./GarmentIcons";

/* Chips at 0°, 90°, 180° and 270° on the outer ring */
const CHIPS = [
  { Icon: NeedleIcon, pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { Icon: ButtonIcon, pos: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2" },
  { Icon: ScissorsIcon, pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
  { Icon: SpoolIcon, pos: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" },
];

export default function FoundedOrbit() {
  return (
    <div className="relative mx-auto size-55 lg:size-70">
      {/* Outer ring: dashed border and chips turn together */}
      <div aria-hidden="true" className="orbit-spin absolute inset-0 rounded-full border-[1.5px] border-dashed border-(--ink)/20 motion-reduce:animate-none">
        {CHIPS.map(({ Icon, pos }, i) => (
          <span
            key={i}
            className={`orbit-counter absolute ${pos} grid size-10 place-items-center rounded-full border border-(--hair) bg-white text-(--ink)/70 shadow-[0_4px_12px_rgba(0,0,0,0.08)] motion-reduce:animate-none`}
          >
            <Icon className="size-6" />
          </span>
        ))}
      </div>

      {/* Inner ring, turning the other way */}
      <div aria-hidden="true" className="orbit-spin-reverse absolute inset-[14%] rounded-full border border-dashed border-(--navy)/30 motion-reduce:animate-none" />

      {/* Centre disc */}
      <div className="soft-pulse absolute inset-[26%] flex flex-col items-center justify-center rounded-full bg-(--navy) text-center text-white shadow-[0_12px_30px_rgba(155,0,43,0.25)] motion-reduce:animate-none">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-white/80">FOUNDED IN</span>
        <span className="font-['Fira_Sans_Condensed'] text-5xl font-black leading-none">{F.established}</span>
        <span className="mt-1 text-[9px] tracking-[0.18em] text-white/70">· BANGLADESH ·</span>
      </div>
    </div>
  );
}
