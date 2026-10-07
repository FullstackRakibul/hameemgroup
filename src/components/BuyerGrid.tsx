import { buyers } from "../data/buyers";

/* Buyer logo grid, greyscale until hovered. One component for the homepage
   and /customers; pass ids to show a subset. */
export default function BuyerGrid({ ids, className = "" }: { ids?: string[]; className?: string }) {
  const list = ids ? buyers.filter((b) => ids.includes(b.id)) : buyers;
  const cols = list.length <= 5 ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-6";
  return (
    <ul className={`mx-auto grid max-w-400 gap-px border border-[#e4e4e0] bg-[#e4e4e0] ${cols} ${className}`}>
      {list.map((b) => (
        <li key={b.id} className="group grid h-20 place-items-center bg-white px-4 sm:h-24 sm:px-6">
          <img
            src={`/media/buyers/${b.id}.png`}
            alt={b.name}
            loading="lazy"
            className="w-auto max-w-full object-contain opacity-80 grayscale transition-[filter,opacity] duration-500 group-hover:opacity-100 group-hover:grayscale-0 max-h-9 sm:max-h-11 sm:max-w-[min(100%,7.5rem)]"
          />
        </li>
      ))}
    </ul>
  );
}
