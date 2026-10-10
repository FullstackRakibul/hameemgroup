import type { ReactNode } from "react";

export default function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-(--red) text-xs font-semibold tracking-[0.12em] leading-[1.2] uppercase ${className}`}>
      {children}
    </p>
  );
}
