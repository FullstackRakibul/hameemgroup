import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ai-assistant.css";
import ChatPanel from "./components/ChatPanel";
import Launcher from "./components/Launcher";
import type { Opener } from "./components/Launcher";
import { toasts } from "./data/persona";
import { useAssistantChat } from "./hooks/useAssistantChat";
import { useIsMobile, usePrefersReducedMotion } from "./hooks/useMediaQuery";
import type { View } from "./types";

const TOAST_MS = 2500;

/** Shuvo · Ha-Meem Assist. UI only: canned replies, no network, no audio. */
export function AiAssistant() {
  const [view, setView] = useState<View>("launcher");
  const [opener, setOpener] = useState<Opener | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const chat = useAssistantChat();
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const open = (from: Opener) => {
    setOpener(from);
    setView("panel");
  };

  return createPortal(
    <div className="hm-assist-root">
      {view === "launcher" ? (
        <Launcher
          onOpen={open}
          onCall={() => showToast(toasts.call)}
          restoreFocus={opener}
          toastMessage={toast}
        />
      ) : (
        <ChatPanel
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
          onClosed={() => setView("launcher")}
        />
      )}
    </div>,
    document.body,
  );
}
