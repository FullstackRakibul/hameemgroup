import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ai-assistant.css";
import ChatPanel from "./components/ChatPanel";
import Launcher from "./components/Launcher";
import { toasts } from "./data/persona";
import { useAssistantChat } from "./hooks/useAssistantChat";
import { useIsMobile, usePrefersReducedMotion } from "./hooks/useMediaQuery";

const TOAST_MS = 2500;
const TEASER_DELAY_MS = 1000;

/** Shuvo · Ha-Meem Assist. UI only: canned replies, no network, no audio.
    The round launcher stays under the open panel on wide screens and closes it;
    on phones the panel is a full-screen sheet and the launcher steps aside. */
export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [closeSignal, setCloseSignal] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  // Teaser: shown once per page load, ~1 s after the launcher mounts, until
  // dismissed or the panel is opened. In memory only, by design.
  const [teaserReady, setTeaserReady] = useState(false);
  const [teaserDone, setTeaserDone] = useState(false);
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
    const timer = window.setTimeout(() => setTeaserReady(true), TEASER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // After the panel closes, focus goes back to the launcher (re-mounted on phones).
  useEffect(() => {
    if (open || !returnFocus.current) return;
    returnFocus.current = false;
    launcherRef.current?.focus();
  }, [open]);

  const openPanel = () => {
    setTeaserDone(true);
    setOpen(true);
  };

  const onClosed = useCallback(() => {
    returnFocus.current = true;
    setOpen(false);
  }, []);

  const showLauncher = !(open && isMobile);
  const showTeaser = teaserReady && !teaserDone && !open && !isMobile;

  return createPortal(
    <div className="hm-assist-root">
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
      {showLauncher && (
        <Launcher
          buttonRef={launcherRef}
          open={open}
          panelId={panelId}
          showTeaser={showTeaser}
          onToggle={() => (open ? setCloseSignal((n) => n + 1) : openPanel())}
          onOpen={openPanel}
          onDismissTeaser={() => setTeaserDone(true)}
        />
      )}
    </div>,
    document.body,
  );
}
