import { useEffect, useState, useRef } from "react";
import { persona } from "../data/persona";
import { REDUCED_MOTION_QUERY, usePrefersReducedMotion, useIsMobile } from "../hooks/useMediaQuery";
import Avatar from "./Avatar";
import Toast from "./Toast";
import { ChatBubbleIcon, ExpandIcon, PhoneIcon } from "./icons";

export type Opener = "ask" | "expand" | "pill";

type LauncherProps = {
  onOpen: (from: Opener) => void;
  onCall: () => void;
  /** Set after the panel closes, so focus goes back to the control that opened it. */
  restoreFocus: Opener | null;
  toastMessage: string | null;
};

export default function Launcher({ onOpen, onCall, restoreFocus, toastMessage }: LauncherProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const refs = {
    ask: useRef<HTMLButtonElement>(null),
    expand: useRef<HTMLButtonElement>(null),
    pill: useRef<HTMLButtonElement>(null),
  };

  useEffect(() => {
    if (!restoreFocus) return;
    const target = isMobile ? refs.pill : (restoreFocus === "pill" ? refs.ask : refs[restoreFocus]);
    target.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside
      className="hm-assist-launcher fixed bottom-6 right-6 z-50 flex flex-col items-end justify-end group font-['Figtree']"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Ha-Meem Assist"
    >
      <div className="absolute bottom-full mb-4 right-0">
        <Toast message={toastMessage} placement="launcher" />
      </div>

      {/* Expanded Card */}
      <div
        className={`absolute bottom-0 right-0 w-85 bg-[#381B13] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col origin-bottom-right transition-all ${
          reducedMotion ? "duration-0" : "duration-300 ease-out"
        } ${
          isHovered
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-90 opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar size={36} className="ring-2 ring-white/20 shadow-[0_0_15px_rgba(155,0,43,0.4)]" />
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-white leading-none text-base">
                {persona.name}
              </span>
              <span className="font-['JetBrains_Mono'] uppercase tracking-[0.12em] text-[10px] sm:text-xs text-white/90 mt-1">
                {persona.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-white/60 hover:text-white transition-colors p-1"
            onClick={() => onOpen("expand")}
            aria-label="Expand AI Assist"
            ref={refs.expand}
          >
            <ExpandIcon size={18} />
          </button>
        </div>

        <div className="p-5">
          <p className="font-['Space_Grotesk'] text-lg text-white leading-tight">
            {persona.launcherTitle}
          </p>
        </div>

        {/* BUTTONS: Added "!" to force Tailwind styles to override the global reset */}
        <div className="p-4 flex gap-2 border-t border-white/10">
          <button
            ref={refs.ask}
            type="button"
            className="flex-1 bg-[#9b002b]! text-white! rounded-lg py-3! px-4! flex items-center justify-center gap-2 font-semibold text-sm hover:bg-[#c1003a]! transition-all focus:ring-2 focus:ring-[#9b002b] outline-none shadow-md"
            onClick={() => onOpen("ask")}
          >
            <ChatBubbleIcon size={18} />
            <span>Ask anything</span>
          </button>
          
          <button
            type="button"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg border! border-white/20! bg-white/10! hover:bg-white/20! text-white! transition-all focus:ring-2 focus:ring-white/30 outline-none"
            aria-label="Call Ha-Meem"
            onClick={onCall}
          >
            <PhoneIcon size={18} />
          </button>
        </div>
      </div>

            {/* Collapsed Icon - Denim Vibes */}
      <button
        ref={refs.pill}
        type="button"
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white origin-center transition-all z-40 animate-denim-bob
          bg-linear-to-br from-[#1f2352] via-[#2a307a] to-[#15183b]
          border-[3px] border-dashed border-red
          shadow-[0_10px_25px_-5px_rgba(31,35,82,0.6),inset_0_2px_4px_rgba(255,255,255,0.2)]
          ${reducedMotion ? "duration-0" : "duration-300 ease-out"}
          ${
            isHovered
              ? "scale-90 opacity-0 pointer-events-none"
              : "scale-100 opacity-100 hover:scale-110 hover:rotate-6 hover:shadow-[0_15px_35px_-5px_rgba(31,35,82,0.8)]"
          }`}
        aria-label="Open AI Assist"
        data-cursor="OPEN"
        onClick={() => {
          if (isMobile) onOpen("ask");
        }}
      >
        {/* Inner stitch ring for extra detail */}
        <span className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
        <ChatBubbleIcon size={26} className="drop-shadow-md" />
      </button>
    </aside>
  );
}