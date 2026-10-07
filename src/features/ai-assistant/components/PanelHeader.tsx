import { persona } from "../data/persona";
import Avatar from "./Avatar";
import { ChevronLeftIcon, PhoneIcon } from "./icons";

type PanelHeaderProps = {
  nameId: string;
  /** Welcome block before the first user message, compact bar after. */
  compact: boolean;
  onCall: () => void;
  onClose: () => void;
};

/* One <header> for both states, so its height can ease from the welcome
   block to the compact bar. The title keeps nameId for aria-labelledby. */
export default function PanelHeader({ nameId, compact, onCall, onClose }: PanelHeaderProps) {
  const back = (
    <button type="button" className="hm-assist-hbtn" aria-label="Close chat" onClick={onClose}>
      <ChevronLeftIcon size={22} />
    </button>
  );
  const call = (
    <button type="button" className="hm-assist-hbtn" aria-label="Call Ha-Meem (coming soon)" onClick={onCall}>
      <PhoneIcon size={20} />
    </button>
  );

  return (
    <header className={`hm-assist-header ${compact ? "hm-assist-header--compact" : "hm-assist-header--welcome"}`}>
      {compact ? (
        <div className="hm-assist-header-bar">
          {back}
          <Avatar size={36} online />
          <div className="hm-assist-header-text">
            <h2 id={nameId} className="hm-assist-name">
              {persona.name}
            </h2>
            <p className="hm-assist-meta">{persona.role} · online</p>
          </div>
          {call}
        </div>
      ) : (
        <>
          <div className="hm-assist-header-bar">
            {back}
            <h2 id={nameId} className="hm-assist-title">
              {persona.role}
            </h2>
            {call}
          </div>
          <div className="hm-assist-header-avatar">
            <Avatar size={56} online />
          </div>
          <p className="hm-assist-headline">{persona.welcomeTitle}</p>
          <p className="hm-assist-note">{persona.headerNote}</p>
        </>
      )}
    </header>
  );
}
