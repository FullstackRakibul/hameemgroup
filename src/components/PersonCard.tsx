import type { Person } from "../data/units";

/* A named contact: square corners, hairline border, optional mailto link. */
export default function PersonCard({ person, tone = "white" }: { person: Person; tone?: "white" | "mist" }) {
  return (
    <article
      className={`flex h-full flex-col gap-2 border border-(--hair) p-6 ${tone === "mist" ? "bg-(--mist)" : "bg-white"}`}
    >
      <h3 className="font-['Fira_Sans_Condensed'] text-[22px] font-semibold leading-tight">{person.name}</h3>
      <p className="text-sm text-(--mute)">{person.role}</p>
      {person.email && (
        <a
          href={`mailto:${person.email}`}
          className="mt-auto break-all pt-3 text-sm font-medium text-(--red)! underline-offset-4 hover:underline"
        >
          {person.email}
        </a>
      )}
    </article>
  );
}
