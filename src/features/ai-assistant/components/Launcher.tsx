import { useId } from "react";
import type { RefObject } from "react";
import { MessageCircle, X } from "lucide-react";
import { persona } from "../data/persona";
import Avatar from "./Avatar";

type LauncherProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** The panel is open: the circle shows a close icon and closes it. */
  open: boolean;
  panelId: string;
  /** The greeting card above the circle. */
  showTeaser: boolean;
  /** Draw the stitched ring in once (the idle hint after the greeting closes). */
  hint: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onDismissTeaser: () => void;
};

/* ── The dock's lower slot: the assistant's round launcher ──
   An ink circle with a stitched ring sewn just inside its edge (it turns
   slowly on hover). The greeting card opens straight up from it, never
   sideways across the page. Styled here rather than in ai-assistant.css, and
   kept outside .hm-assist-root, whose button reset would override it. */
export default function Launcher(props: LauncherProps) {
  const { buttonRef, open, panelId, showTeaser, hint, onToggle, onOpen, onDismissTeaser } = props;
  const maskId = `hm-assist-ring-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <div className="hm-assist-dock fixed right-(--dock-gap) bottom-[calc(var(--dock-gap)+env(safe-area-inset-bottom))] z-1000">
      {showTeaser && (
        <div className="hm-assist-teaser absolute bottom-[calc(100%+12px)] right-0 w-[min(260px,calc(100vw-2*var(--dock-gap)))] animate-[awardIn_250ms_ease-out_both] [--award-from:translateY(8px)] motion-reduce:[--award-from:none] [body:has(.is-mobile-open,.is-mega-open,dialog[open])_&]:hidden">
          <div className="relative flex items-center gap-1 rounded-sm border border-(--hair) bg-white py-1 pl-3 pr-1 shadow-[0_8px_24px_-10px_rgba(17,20,24,0.28)]">
            <button
              type="button"
              onClick={onOpen}
              className="flex min-h-11 flex-1 items-center gap-2.5 rounded-xs text-left text-sm font-semibold text-(--ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy)"
            >
              <Avatar size={24} />
              {persona.launcherTitle}
            </button>
            {/* 44px hit area around a 28px circle */}
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={onDismissTeaser}
              className="group/x grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-(--navy)"
            >
              <span className="grid size-7 place-items-center rounded-full text-(--mute) transition-colors duration-200 group-hover/x:bg-(--mist) group-hover/x:text-(--ink) motion-reduce:transition-none">
                <X size={14} strokeWidth={1.75} aria-hidden="true" />
              </span>
            </button>
            {/* The tail, pointing down at the launcher's centre */}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 right-[calc(var(--dock-size)/2-6px)] size-3 rotate-45 border-r border-b border-(--hair) bg-white"
            />
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-label={`Chat with ${persona.name}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={onToggle}
        className="group/fab relative grid size-(--dock-size) place-items-center rounded-full bg-(--ink) text-white shadow-[0_10px_24px_-8px_rgba(17,20,24,0.45)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--navy) motion-reduce:transition-none"
      >
        {/* The stitched ring: draws in once as a hint, turns on hover */}
        <svg
          aria-hidden="true"
          viewBox="0 0 56 56"
          className="pointer-events-none absolute inset-0 size-full group-hover/fab:animate-[orbitSpin_12s_linear_infinite] motion-reduce:animate-none!"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="56" height="56">
              <circle
                cx="28"
                cy="28"
                r="23"
                fill="none"
                stroke="white"
                strokeWidth="4"
                pathLength={1}
                className={`[stroke-dasharray:1] [stroke-dashoffset:0] ${
                  hint ? "animate-[tourDraw_1200ms_cubic-bezier(.22,1,.36,1)_both] motion-reduce:animate-none" : ""
                }`}
              />
            </mask>
          </defs>
          <circle
            cx="28"
            cy="28"
            r="23"
            fill="none"
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="1"
            strokeDasharray="3 3"
            mask={`url(#${maskId})`}
          />
        </svg>
        <MessageCircle
          size={24}
          strokeWidth={1.75}
          aria-hidden="true"
          className={`[grid-area:1/1] transition-[opacity,rotate] duration-200 motion-reduce:rotate-0 ${
            open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
          }`}
        />
        <X
          size={22}
          strokeWidth={1.75}
          aria-hidden="true"
          className={`[grid-area:1/1] transition-[opacity,rotate] duration-200 motion-reduce:rotate-0 ${
            open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
        />
      </button>
    </div>
  );
}
