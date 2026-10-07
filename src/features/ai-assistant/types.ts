export type TopicId =
  | "products"
  | "capacity"
  | "sustainability"
  | "visit"
  | "careers"
  | "contact"
  | "about"
  | "greeting"
  | "fallback";

export type AssistLink = { label: string; href: string };

export type Topic = {
  id: TopicId;
  /** Chip label. Topics without one never appear as a chip. */
  label?: string;
  /** Sent as the user message when the chip is clicked. */
  question?: string;
  /** Shown on the welcome screen. */
  welcome?: boolean;
  keywords: string[];
  /** Wins ties in keyword scoring (commercial intent outranks product words). */
  priority?: number;
  reply: string[];
  links: AssistLink[];
  followUps: TopicId[];
};

export type Message = {
  id: string;
  role: "assistant" | "user";
  paragraphs: string[];
  links?: AssistLink[];
  topicId?: TopicId;
};
