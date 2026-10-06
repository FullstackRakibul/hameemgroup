import { persona } from "../data/persona";

export default function TypingIndicator() {
  return (
    <div className="hm-assist-msg hm-assist-msg--assistant hm-assist-typing">
      <div className="hm-assist-msg-label">
        <span>{persona.name}</span>
      </div>
      <div className="hm-assist-dots" aria-hidden="true">
        <span className="hm-assist-dot" />
        <span className="hm-assist-dot" />
        <span className="hm-assist-dot" />
        <span className="hm-assist-typing-text">typing…</span>
      </div>
      <span className="hm-assist-sr">{persona.name} is typing</span>
    </div>
  );
}
