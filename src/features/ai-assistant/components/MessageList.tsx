import type { MouseEvent } from "react";
import { topicById, welcomeTopics } from "../data/topics";
import type { Message } from "../types";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

type MessageListProps = {
  messages: Message[];
  isTyping: boolean;
  hasUserMessages: boolean;
  /** Messages at or after this index arrived while the panel was open, so they animate in. */
  animateFrom: number;
  onPick: (question: string) => void;
  onLink: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
  onSpeaker: () => void;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export default function MessageList(props: MessageListProps) {
  const { messages, isTyping, hasUserMessages, animateFrom, onPick, onLink, onSpeaker } = props;
  const last = messages[messages.length - 1];
  // Only the latest reply offers quick replies, and only once typing is done: the
  // six welcome topics under the greeting, a topic's follow-ups under its reply.
  const showReplies = !isTyping && last?.role === "assistant";
  const quickReplies = !showReplies
    ? null
    : last.topicId
      ? topicById(last.topicId).followUps.map(topicById)
      : hasUserMessages
        ? null
        : welcomeTopics;

  return (
    <div className="hm-assist-thread">
      <p className="hm-assist-date">{dateFormat.format(new Date())}</p>
      <div className="hm-assist-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
        {messages.map((message, i) => (
          <MessageItem
            key={message.id}
            message={message}
            animate={i >= animateFrom}
            quickReplies={message === last ? quickReplies : null}
            quickRepliesLabel={hasUserMessages ? "Follow-up questions" : "Suggested topics"}
            onPick={onPick}
            onLink={onLink}
            onSpeaker={onSpeaker}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
}
