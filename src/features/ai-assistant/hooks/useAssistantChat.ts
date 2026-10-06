import { useCallback, useEffect, useRef, useState } from "react";
import { persona } from "../data/persona";
import { findTopic } from "../data/topics";
import type { Message } from "../types";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Fake typing time for a reply: longer replies "take" longer, within 0.7–1.6 s. */
export const typingDelay = (paragraphs: string[]) => clamp(600 + paragraphs.join(" ").length * 4, 700, 1600);

const greetingMessage: Message = { id: "m0", role: "assistant", paragraphs: [persona.greeting] };

/** Conversation state: in memory only, so it survives closing the panel but not a reload. */
export function useAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([greetingMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef(false);
  const timers = useRef(new Set<number>());
  const nextId = useRef(1);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => window.clearTimeout(t));
      pending.clear();
    };
  }, []);

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || typingRef.current) return false;

    const topic = findTopic(text);
    const userMessage: Message = { id: `m${nextId.current++}`, role: "user", paragraphs: [text] };
    setMessages((prev) => [...prev, userMessage]);
    typingRef.current = true;
    setIsTyping(true);

    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      const reply: Message = {
        id: `m${nextId.current++}`,
        role: "assistant",
        paragraphs: topic.reply,
        links: topic.links,
        topicId: topic.id,
      };
      setMessages((prev) => [...prev, reply]);
      typingRef.current = false;
      setIsTyping(false);
    }, typingDelay(topic.reply));
    timers.current.add(timer);
    return true;
  }, []);

  const hasUserMessages = messages.some((m) => m.role === "user");

  return { messages, isTyping, send, hasUserMessages };
}
