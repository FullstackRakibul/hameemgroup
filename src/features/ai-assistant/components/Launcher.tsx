import type { RefObject } from "react";
import { persona } from "../data/persona";
import { ChatBubbleIcon, CloseIcon } from "./icons";

type LauncherProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** The panel is open: the circle shows a close icon and closes it. */
  open: boolean;
  panelId: string;
  /** Teaser bubble beside the circle (wide screens, until dismissed or opened). */
  showTeaser: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onDismissTeaser: () => void;
};

export default function Launcher(props: LauncherProps) {
  const { buttonRef, open, panelId, showTeaser, onToggle, onOpen, onDismissTeaser } = props;
  return (
    <div className="hm-assist-launcher">
      {showTeaser && (
        <div className="hm-assist-teaser">
          <button type="button" className="hm-assist-teaser-open" onClick={onOpen}>
            {persona.launcherTitle}
          </button>
          <button type="button" className="hm-assist-teaser-dismiss" aria-label="Dismiss message" onClick={onDismissTeaser}>
            <span className="hm-assist-teaser-chip">
              <CloseIcon size={12} />
            </span>
          </button>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className={`hm-assist-fab ${open ? "hm-assist-fab--open" : ""}`}
        aria-label={`Chat with ${persona.name}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={onToggle}
      >
        <span className="hm-assist-fab-icon hm-assist-fab-icon--chat">
          <ChatBubbleIcon size={26} />
        </span>
        <span className="hm-assist-fab-icon hm-assist-fab-icon--close">
          <CloseIcon size={22} />
        </span>
      </button>
    </div>
  );
}
