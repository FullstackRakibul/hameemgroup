import type { Topic } from "../types";

type SuggestionChipsProps = {
  topics: Topic[];
  onPick: (question: string) => void;
  label: string;
};

/** Quick replies: outlined, right-aligned, wrapping. Clicking sends the topic's question. */
export default function SuggestionChips({ topics, onPick, label }: SuggestionChipsProps) {
  return (
    <div className="hm-assist-chips" role="group" aria-label={label}>
      {topics.map((topic) => (
        <button
          key={topic.id}
          type="button"
          className="hm-assist-chip"
          onClick={() => topic.question && onPick(topic.question)}
        >
          {topic.label}
        </button>
      ))}
    </div>
  );
}
