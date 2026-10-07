import { useLayoutEffect, useState } from "react";
import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { persona } from "../data/persona";
import { MicIcon, SendIcon } from "./icons";

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

  // Grow from 1 to 4 lines, then scroll. Empty, it stays one line even when
  // the placeholder would wrap.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const s = getComputedStyle(el);
    const padding = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
    const border = parseFloat(s.borderTopWidth) * 2;
    const content = value ? el.scrollHeight - padding : LINE;
    el.style.height = `${Math.min(content, LINE * MAX_LINES) + padding + border}px`;
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
          <MicIcon size={22} />
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
          <SendIcon size={22} />
        </button>
      </form>
      <p className="hm-assist-footnote">{persona.footer}</p>
    </>
  );
}
