import { useLayoutEffect, useState } from "react";
import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { persona } from "../data/persona";
import { ArrowUpIcon, MicIcon, ShieldIcon } from "./icons";

type ComposerProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  isTyping: boolean;
  onSend: (text: string) => boolean;
  onMic: () => void;
};

const LINE = 24; // px, matches the textarea line-height in ai-assistant.css
const MAX_LINES = 4;

export default function Composer({ textareaRef, isTyping, onSend, onMic }: ComposerProps) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !isTyping;

  // Grow from 1 to 4 lines, then scroll.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const padding = parseFloat(getComputedStyle(el).paddingTop) * 2;
    el.style.height = `${Math.min(el.scrollHeight, LINE * MAX_LINES + padding)}px`;
  }, [value, textareaRef]);

  const submit = () => {
    if (!canSend) return;
    if (onSend(value)) setValue("");
    textareaRef.current?.focus();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    submit();
  };

  return (
    <>
      <form className="hm-assist-composer" onSubmit={onSubmit}>
        <button type="button" className="hm-assist-mic" aria-label="Voice input (coming soon)" onClick={onMic}>
          <MicIcon size={20} />
        </button>
        <textarea
          ref={textareaRef}
          className="hm-assist-textarea"
          rows={1}
          value={value}
          placeholder={persona.placeholder}
          aria-label="Message Shuvo"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="hm-assist-send" aria-label="Send message" aria-disabled={!canSend}>
          <span className="hm-assist-send-circle">
            <ArrowUpIcon size={20} />
          </span>
        </button>
      </form>
      <p className="hm-assist-footnote">
        <ShieldIcon size={12} />
        <span>{persona.footer}</span>
      </p>
    </>
  );
}
