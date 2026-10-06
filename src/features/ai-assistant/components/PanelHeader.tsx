import { persona } from "../data/persona";
import Avatar from "./Avatar";
import { CloseIcon, PhoneIcon } from "./icons";

type PanelHeaderProps = {
  nameId: string;
  onCall: () => void;
  onClose: () => void;
};

export default function PanelHeader({ nameId, onCall, onClose }: PanelHeaderProps) {
  return (
    <header className="hm-assist-header">
      <Avatar size={48} />
      <div className="hm-assist-header-text">
        <h2 id={nameId} className="hm-assist-name">
          {persona.name}
        </h2>
        <p className="hm-assist-meta">
          <span className="hm-assist-online" aria-hidden="true" />
          <span>
            {persona.role} · {persona.id} · online
          </span>
        </p>
      </div>
      <div className="hm-assist-header-actions">
        <button
          type="button"
          className="hm-assist-round hm-assist-round--outline"
          aria-label="Call Ha-Meem (coming soon)"
          onClick={onCall}
        >
          <PhoneIcon size={18} />
        </button>
        <button type="button" className="hm-assist-round" aria-label="Close chat" onClick={onClose}>
          <CloseIcon size={20} />
        </button>
      </div>
    </header>
  );
}
