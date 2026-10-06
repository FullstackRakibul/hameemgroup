import { persona } from "../data/persona";
import { welcomeTopics } from "../data/topics";
import Avatar from "./Avatar";
import SuggestionChips from "./SuggestionChips";

/* Faint flowing lines behind the avatar (decorative). */
function Wave() {
  const lines = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg className="hm-assist-wave" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {lines.map((i) => (
        <path
          key={i}
          d={`M0 ${40 + i * 7} C 70 ${10 + i * 9}, 120 ${100 - i * 4}, 180 ${58 + i * 2} S 300 ${12 + i * 10}, 360 ${46 + i * 6}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export default function WelcomeView({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="hm-assist-welcome">
      <div className="hm-assist-welcome-art">
        <Wave />
        <Avatar size={76} shape="rounded" className="hm-assist-welcome-avatar" />
      </div>
      <p className="hm-assist-welcome-hello">{persona.welcomeHello}</p>
      <h3 className="hm-assist-welcome-title">{persona.welcomeTitle}</h3>
      <p className="hm-assist-welcome-intro">{persona.welcomeIntro}</p>
      <SuggestionChips topics={welcomeTopics} onPick={onPick} label="Suggested topics" />
    </div>
  );
}
