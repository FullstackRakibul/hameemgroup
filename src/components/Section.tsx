import type { ReactNode } from "react";

/* Page section: white or mist, homepage padding, content in .wrap. */
export default function Section({
  children,
  tone = "white",
  id,
  className = "",
}: {
  children: ReactNode;
  tone?: "white" | "mist";
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`${tone === "mist" ? "bg-(--mist)" : "bg-white"} py-24 md:py-28`}>
      <div className={`wrap flex flex-col gap-12 md:gap-16 ${className}`}>{children}</div>
    </section>
  );
}
