import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { persona } from "../data/persona";
import { REDUCED_MOTION_QUERY, useIsMobile } from "../hooks/useMediaQuery";
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
  const isMobile = useIsMobile();
  const rootRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const refs = {
    ask: useRef<HTMLButtonElement>(null),
    expand: useRef<HTMLButtonElement>(null),
    pill: useRef<HTMLButtonElement>(null),
  };

  // Publish the launcher height so back-to-top can sit above it.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const publish = () => document.body.style.setProperty("--hm-assist-launcher-h", `${surface.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(surface);
    return () => {
      ro.disconnect();
      document.body.style.removeProperty("--hm-assist-launcher-h");
    };
  }, [isMobile]);

  // Entrance: lift and fade, or a short fade under reduced motion.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add({ reduce: REDUCED_MOTION_QUERY }, (c) => {
        if (c.conditions?.reduce) gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.15 });
        else gsap.fromTo(root, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
      });
    }, root);
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!restoreFocus) return;
    const target = isMobile ? refs.pill : restoreFocus === "pill" ? refs.ask : refs[restoreFocus];
    target.current?.focus();
    // Only on mount: returning from the panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside
      ref={rootRef}
      aria-label="Ha-Meem Assist"
      className={`hm-assist-launcher ${isMobile ? "hm-assist-launcher--compact" : ""}`}
    >
      <Toast message={toastMessage} placement="launcher" />

      {isMobile ? (
        <div ref={surfaceRef} className="hm-assist-pill">
          <button ref={refs.pill} type="button" className="hm-assist-pill-open" onClick={() => onOpen("pill")}>
            <Avatar size={40} />
            <span>{persona.mobileLauncherLabel}</span>
          </button>
          <button
            type="button"
            className="hm-assist-call hm-assist-call--sm hm-assist-btn-red"
            aria-label="Call Ha-Meem (coming soon)"
            onClick={onCall}
          >
            <PhoneIcon size={20} />
          </button>
        </div>
      ) : (
        <div ref={surfaceRef} className="hm-assist-card">
          <div className="hm-assist-card-top">
            <Avatar size={56} />
            <div className="hm-assist-card-text">
              <p className="hm-assist-launcher-title">{persona.launcherTitle}</p>
              <p className="hm-assist-launcher-sub">{persona.launcherSubtitle.replace(" + ", " + ")}</p>
            </div>
          </div>
          <button
            ref={refs.expand}
            type="button"
            className="hm-assist-expand"
            aria-label="Open chat with Ayesha"
            onClick={() => onOpen("expand")}
          >
            <ExpandIcon size={18} />
          </button>
          <div className="hm-assist-card-actions">
            <button ref={refs.ask} type="button" className="hm-assist-ask hm-assist-btn-red" onClick={() => onOpen("ask")}>
              <ChatBubbleIcon size={20} />
              <span>Ask anything</span>
            </button>
            <button
              type="button"
              className="hm-assist-call hm-assist-btn-red"
              aria-label="Call Ha-Meem (coming soon)"
              onClick={onCall}
            >
              <PhoneIcon size={20} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
