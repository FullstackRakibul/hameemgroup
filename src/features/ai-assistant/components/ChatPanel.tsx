import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import gsap from "gsap";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { MOBILE_QUERY, REDUCED_MOTION_QUERY } from "../hooks/useMediaQuery";
import type { Message } from "../types";
import Composer from "./Composer";
import MessageList from "./MessageList";
import PanelHeader from "./PanelHeader";
import Toast from "./Toast";
import WelcomeView from "./WelcomeView";
import { ArrowDownIcon } from "./icons";

type ChatPanelProps = {
  messages: Message[];
  isTyping: boolean;
  hasUserMessages: boolean;
  send: (text: string) => boolean;
  isMobile: boolean;
  reducedMotion: boolean;
  toastMessage: string | null;
  onCall: () => void;
  onMic: () => void;
  onSpeaker: () => void;
  /** Called once the close animation has finished. */
  onClosed: () => void;
};

const STICK_THRESHOLD = 80; // px from the bottom that still counts as "at the bottom"

export default function ChatPanel(props: ChatPanelProps) {
  const { messages, isTyping, hasUserMessages, send, isMobile, reducedMotion, toastMessage } = props;
  const nameId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const closingRef = useRef(false);
  const stickRef = useRef(true);
  const onClosedRef = useRef(props.onClosed);
  const [animateFrom] = useState(messages.length);
  const [showNewPill, setShowNewPill] = useState(false);

  useLayoutEffect(() => {
    onClosedRef.current = props.onClosed;
  });

  /* ── Open animation; close plays the reverse, then unmounts ── */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add({ reduce: REDUCED_MOTION_QUERY, mobile: MOBILE_QUERY }, (c) => {
        const { reduce, mobile } = c.conditions ?? {};
        if (reduce) gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.15 });
        else if (mobile) gsap.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: "power3.out" });
        else
          gsap.fromTo(
            panel,
            { opacity: 0, scale: 0.96, y: 16, transformOrigin: "bottom right" },
            { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: "power3.out" },
          );
      });
    }, panel);
    ctxRef.current = ctx;
    closingRef.current = false;
    textareaRef.current?.focus({ preventScroll: true });
    return () => {
      mm.revert();
      ctx.revert();
      ctxRef.current = null;
    };
  }, []);

  const close = useCallback((then?: () => void) => {
    const panel = panelRef.current;
    if (closingRef.current || !panel) return;
    closingRef.current = true;
    const done = () => {
      onClosedRef.current();
      then?.();
    };
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const vars: gsap.TweenVars = reduce
      ? { opacity: 0, duration: 0.12 }
      : mobile
        ? { yPercent: 100, duration: 0.2, ease: "power2.in" }
        : { opacity: 0, scale: 0.96, y: 16, transformOrigin: "bottom right", duration: 0.2, ease: "power2.in" };
    const run = () => gsap.to(panel, { ...vars, overwrite: true, onComplete: done });
    if (ctxRef.current) ctxRef.current.add(run);
    else run();
  }, []);

  /* ── Escape closes ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  /* ── Mobile: full-screen modal sheet with scroll lock + focus trap ── */
  useFocusTrap(panelRef, isMobile);
  useEffect(() => {
    if (!isMobile) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isMobile]);

  /* ── Auto-scroll unless the reader has scrolled up ── */
  const scrollToBottom = useCallback(
    (smooth: boolean) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reducedMotion ? "smooth" : "auto" });
      stickRef.current = true;
      setShowNewPill(false);
    },
    [reducedMotion],
  );

  useLayoutEffect(() => {
    if (!hasUserMessages) return;
    if (stickRef.current) scrollToBottom(true);
    else setShowNewPill(true);
  }, [messages.length, isTyping, hasUserMessages, scrollToBottom]);

  // Reopening an existing conversation starts at the latest message.
  useLayoutEffect(() => {
    if (hasUserMessages) scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD;
    if (stickRef.current) setShowNewPill(false);
  };

  /* ── Links: anchors scroll the page (closing the sheet first on mobile) ── */
  const onLink = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const go = () => target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    if (isMobile) close(() => requestAnimationFrame(go));
    else go();
  };

  const pick = (question: string) => {
    send(question);
    textareaRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={panelRef}
      className="hm-assist-panel"
      role="dialog"
      aria-labelledby={nameId}
      aria-modal={isMobile ? true : undefined}
    >
      <PanelHeader nameId={nameId} onCall={props.onCall} onClose={() => close()} />

      <div className="hm-assist-scroll-wrap">
        <div ref={scrollRef} className="hm-assist-scroll" onScroll={onScroll}>
          {hasUserMessages ? (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              animateFrom={animateFrom}
              onPick={pick}
              onLink={onLink}
              onSpeaker={props.onSpeaker}
            />
          ) : (
            <WelcomeView onPick={pick} />
          )}
        </div>
        {showNewPill && (
          <button type="button" className="hm-assist-newpill" onClick={() => scrollToBottom(true)}>
            New message <ArrowDownIcon size={14} />
          </button>
        )}
      </div>

      <div className="hm-assist-bottom">
        <Toast message={toastMessage} placement="panel" />
        <Composer textareaRef={textareaRef} isTyping={isTyping} onSend={send} onMic={props.onMic} />
      </div>
    </div>
  );
}
