import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import gsap from "gsap";
import { persona } from "../data/persona";
import { REDUCED_MOTION_QUERY } from "../hooks/useMediaQuery";
import type { Message, Topic } from "../types";
import SuggestionChips from "./SuggestionChips";
import { SpeakerIcon } from "./icons";

type MessageItemProps = {
  message: Message;
  animate: boolean;
  followUps: Topic[] | null;
  onPick: (question: string) => void;
  onLink: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
  onSpeaker: () => void;
};

export default function MessageItem({ message, animate, followUps, onPick, onLink, onSpeaker }: MessageItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!animate || !el) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add({ reduce: REDUCED_MOTION_QUERY }, (c) => {
        if (c.conditions?.reduce) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.15 });
        else gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", clearProps: "transform" });
      });
    }, el);
    return () => {
      mm.revert();
      ctx.revert();
    };
    // Animate once, when the message first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (message.role === "user") {
    return (
      <div ref={ref} className="hm-assist-msg hm-assist-msg--user">
        <span className="hm-assist-sr">You said: </span>
        <p>{message.paragraphs[0]}</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="hm-assist-msg hm-assist-msg--assistant">
      <div className="hm-assist-msg-label">
        <span aria-hidden="true">{persona.name}</span>
        <button
          type="button"
          className="hm-assist-speaker"
          aria-label="Read aloud (coming soon)"
          aria-pressed={speaking}
          onClick={() => {
            setSpeaking((s) => !s);
            onSpeaker();
          }}
        >
          <SpeakerIcon size={14} />
        </button>
      </div>
      <div className="hm-assist-msg-text">
        <span className="hm-assist-sr">{persona.name} said: </span>
        {message.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {message.links && message.links.length > 0 && (
        <div className="hm-assist-msg-links">
          {message.links.map((link) => (
            <a key={link.href} className="hm-assist-link" href={link.href} onClick={(e) => onLink(e, link.href)}>
              {link.label}
            </a>
          ))}
        </div>
      )}
      {followUps && followUps.length > 0 && (
        <SuggestionChips topics={followUps} onPick={onPick} size="sm" label="Follow-up questions" />
      )}
    </div>
  );
}
