import type { ChipTopicId, Topic } from "../types";
import { chipIcons } from "./icons";

type SuggestionChipsProps = {
  topics: Topic[];
  onPick: (question: string) => void;
  size?: "lg" | "sm";
  label: string;
};

export default function SuggestionChips({ topics, onPick, size = "lg", label }: SuggestionChipsProps) {
  return (
    <div className={`hm-assist-chips hm-assist-chips--${size}`} role="group" aria-label={label}>
      {topics.map((topic) => {
        const Icon = chipIcons[topic.id as ChipTopicId];
        return (
          <button
            key={topic.id}
            type="button"
            className={`hm-assist-chip hm-assist-chip--${size}`}
            onClick={() => topic.question && onPick(topic.question)}
          >
            {Icon && <Icon size={size === "lg" ? 18 : 16} />}
            <span>{topic.label}</span>
          </button>
        );
      })}
    </div>
  );
}
