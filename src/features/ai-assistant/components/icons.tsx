import type { ReactNode } from "react";
import type { ChipTopicId } from "../types";

type IconProps = { size?: number; className?: string };

function Svg({ size = 20, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export const ChatBubbleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth={2.5} />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
  </Svg>
);

export const ExpandIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const MicIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
  </Svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
);

export const SpeakerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Svg>
);

export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Svg>
);

/* ── Chip icons ── */
const ShirtIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3.5 4 6l-1.5 4.5 3 1.5V20h13v-8l3-1.5L20 6l-5-2.5a3 3 0 0 1-6 0Z" />
  </Svg>
);

const FactoryIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 20.5V10l5.5 3.5V10l5.5 3.5V5h4l1 15.5Z" />
    <path d="M7 17h2M12 17h2M3 20.5h18" />
  </Svg>
);

const LeafIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 19c0-8 5-13.5 15-14-.4 10-6 15-14 15" />
    <path d="M5 19c3-4 6-6.5 10-8.5" />
  </Svg>
);

const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);

const BriefcaseIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
  </Svg>
);

const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);

export const chipIcons: Record<ChipTopicId, (p: IconProps) => ReactNode> = {
  products: ShirtIcon,
  capacity: FactoryIcon,
  sustainability: LeafIcon,
  visit: MapPinIcon,
  careers: BriefcaseIcon,
  contact: MailIcon,
};
