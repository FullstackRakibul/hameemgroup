import type { MouseEvent } from "react";
import { topicById } from "../data/topics";
import type { Message } from "../types";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

type MessageListProps = {
  messages: Message[];
  isTyping: boolean;
  /** Messages at or after this index arrived while the panel was open, so they animate in. */
  animateFrom: number;
  onPick: (question: string) => void;
  onLink: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
  onSpeaker: () => void;
};

export default function MessageList({ messages, isTyping, animateFrom, onPick, onLink, onSpeaker }: MessageListProps) {
  const last = messages[messages.length - 1];
  // Only the latest reply keeps its follow-up chips, and only once typing is done.
  const followUps =
    !isTyping && last?.role === "assistant" && last.topicId ? topicById(last.topicId).followUps.map(topicById) : null;

  return (
    <div className="hm-assist-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
      {messages.map((message, i) => (
        <MessageItem
          key={message.id}
          message={message}
          animate={i >= animateFrom}
          followUps={message === last ? followUps : null}
          onPick={onPick}
          onLink={onLink}
          onSpeaker={onSpeaker}
        />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
