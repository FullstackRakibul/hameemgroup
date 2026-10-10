import type { ReactNode } from "react";

/* Page section: white or mist, section-y padding, content in .wrap with the
   header-to-content gap between blocks. */
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
    <section id={id} className={`${tone === "mist" ? "bg-(--mist)" : "bg-white"} section-y`}>
      <div className={`wrap flex flex-col gap-section-head ${className}`}>{children}</div>
    </section>
  );
}
