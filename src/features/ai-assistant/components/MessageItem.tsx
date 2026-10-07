import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import gsap from "gsap";
import { persona } from "../data/persona";
import { REDUCED_MOTION_QUERY } from "../hooks/useMediaQuery";
import type { Message, Topic } from "../types";
import Avatar from "./Avatar";
import SuggestionChips from "./SuggestionChips";
import { ArrowRightIcon, MailIcon, SpeakerIcon } from "./icons";

type MessageItemProps = {
  message: Message;
  animate: boolean;
  /** Quick replies under this message (the latest reply only). */
  quickReplies: Topic[] | null;
  quickRepliesLabel: string;
  onPick: (question: string) => void;
  onLink: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
  onSpeaker: () => void;
};

// The data writes "Email sales →"; the pill carries its own icon instead.
const pillLabel = (label: string) => label.replace(/\s*→\s*$/, "");

export default function MessageItem(props: MessageItemProps) {
  const { message, animate, quickReplies, quickRepliesLabel, onPick, onLink, onSpeaker } = props;
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
      <div className="hm-assist-msg-row">
        <Avatar size={32} />
        <div className="hm-assist-bubble hm-assist-msg-text">
          <span className="hm-assist-sr">{persona.name} said: </span>
          {message.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
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
          <SpeakerIcon size={16} />
        </button>
      </div>
      {message.links && message.links.length > 0 && (
        <div className="hm-assist-actions">
          {message.links.map((link) => (
            <a key={link.href} className="hm-assist-link" href={link.href} onClick={(e) => onLink(e, link.href)}>
              {link.href.startsWith("mailto:") ? <MailIcon size={16} /> : <ArrowRightIcon size={16} />}
              <span>{pillLabel(link.label)}</span>
            </a>
          ))}
        </div>
      )}
      {quickReplies && quickReplies.length > 0 && (
        <SuggestionChips topics={quickReplies} onPick={onPick} label={quickRepliesLabel} />
      )}
    </div>
  );
}
