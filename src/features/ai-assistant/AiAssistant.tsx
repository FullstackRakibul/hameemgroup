import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import "./ai-assistant.css";
import ChatPanel from "./components/ChatPanel";
import Launcher from "./components/Launcher";
import { toasts } from "./data/persona";
import { useAssistantChat } from "./hooks/useAssistantChat";
import { useIsMobile, usePrefersReducedMotion } from "./hooks/useMediaQuery";

const TOAST_MS = 2500;
const TEASER_AFTER_MS = 8000; // the soonest the greeting may appear
const TEASER_FOR_MS = 10000; // how long it stays
const TEASER_KEY = "hm-assist-teaser-seen";

const teaserSeen = () => {
  try {
    return sessionStorage.getItem(TEASER_KEY) === "1";
  } catch {
    return false;
  }
};
// Something else holds the screen: the mobile or mega menu, a dialog, a locked page
const screenBusy = () =>
  document.querySelector(".is-mobile-open, .is-mega-open, dialog[open]") !== null ||
  document.body.style.overflow === "hidden";

/** Shuvo · Ha-Meem Assist. UI only: canned replies, no network, no audio.
    The round launcher is the floating dock's lower slot (back-to-top sits
    above it, in App). It stays under the open panel on wide screens and closes
    it; on phones the panel is a bottom sheet and the launcher steps aside. */
export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [closeSignal, setCloseSignal] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  // The greeting: once per session, not before 8s and not while the hero is
  // on screen, never over a menu or dialog; it leaves after 10s, on ×, or when
  // the panel opens. When it leaves on its own or on ×, the launcher's ring
  // draws in once, a second later, as a quiet hint.
  const [teaser, setTeaser] = useState<"wait" | "show" | "done">(() => (teaserSeen() ? "done" : "wait"));
  const [hint, setHint] = useState(false);
  const mountedAt = useRef(Date.now());
  const { pathname } = useLocation();
  const toastTimer = useRef<number | undefined>(undefined);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  const panelId = useId();
  const chat = useAssistantChat();
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (teaser !== "wait") return;
    const hero = document.querySelector("[data-hero]");
    let heroGone = !hero;
    const tryShow = () => {
      if (!heroGone || Date.now() - mountedAt.current < TEASER_AFTER_MS || screenBusy()) return;
      setTeaser("show");
      try {
        sessionStorage.setItem(TEASER_KEY, "1");
      } catch {
        /* storage blocked: it may show again next load */
      }
    };
    const io = hero
      ? new IntersectionObserver(([e]) => {
          heroGone = !e.isIntersecting;
          tryShow();
        })
      : null;
    if (hero) io?.observe(hero);
    const poll = window.setInterval(tryShow, 1000);
    return () => {
      io?.disconnect();
      window.clearInterval(poll);
    };
  }, [teaser, pathname]);

  useEffect(() => {
    if (teaser !== "show") return;
    const timer = window.setTimeout(() => closeTeaser(), TEASER_FOR_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teaser]);

  const hintTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(hintTimer.current), []);
  const closeTeaser = () => {
    setTeaser("done");
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(true), 1000);
  };

  // After the panel closes, focus goes back to the launcher (re-mounted on phones).
  useEffect(() => {
    if (open || !returnFocus.current) return;
    returnFocus.current = false;
    launcherRef.current?.focus();
  }, [open]);

  const openPanel = () => {
    setTeaser("done");
    setOpen(true);
  };

  const onClosed = useCallback(() => {
    returnFocus.current = true;
    setOpen(false);
  }, []);

  const showLauncher = !(open && isMobile);
  const showTeaser = teaser === "show" && !open;
  const requestClose = () => setCloseSignal((n) => n + 1);

  return createPortal(
    <>
    <div className="hm-assist-root">
      {/* Phones: the page dims under the bottom sheet; tapping it closes */}
      {open && isMobile && (
        <div
          aria-hidden="true"
          onClick={requestClose}
          className="fixed inset-0 z-1099 bg-(--ink)/40 animate-[awardIn_250ms_ease-out_both] [--award-from:none]"
        />
      )}
      {open && (
        <ChatPanel
          id={panelId}
          closeSignal={closeSignal}
          messages={chat.messages}
          isTyping={chat.isTyping}
          hasUserMessages={chat.hasUserMessages}
          send={chat.send}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
          toastMessage={toast}
          onCall={() => showToast(toasts.call)}
          onMic={() => showToast(toasts.mic)}
          onSpeaker={() => showToast(toasts.speaker)}
          onClosed={onClosed}
        />
      )}
    </div>
      {showLauncher && (
        <Launcher
          buttonRef={launcherRef}
          open={open}
          panelId={panelId}
          showTeaser={showTeaser}
          hint={hint && !reducedMotion}
          onToggle={() => (open ? requestClose() : openPanel())}
          onOpen={openPanel}
          onDismissTeaser={closeTeaser}
        />
      )}
    </>,
    document.body,
  );
}
