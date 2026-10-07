import { persona } from "../data/persona";
import Avatar from "./Avatar";

export default function TypingIndicator() {
  return (
    <div className="hm-assist-msg hm-assist-msg--assistant hm-assist-typing">
      <div className="hm-assist-msg-row">
        <Avatar size={32} />
        <div className="hm-assist-bubble hm-assist-dots" aria-hidden="true">
          <span className="hm-assist-dot" />
          <span className="hm-assist-dot" />
          <span className="hm-assist-dot" />
          <span className="hm-assist-typing-text">typing…</span>
        </div>
      </div>
      <span className="hm-assist-sr">{persona.name} is typing</span>
    </div>
  );
}
