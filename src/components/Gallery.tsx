export type GalleryImage = { src: string; alt: string };

const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/* The page's photos: square corners, the business-tile slow zoom on hover,
   no lightbox. */
export default function Gallery({ images, label }: { images: GalleryImage[]; label: string }) {
  return (
    <ul data-reveal-stagger aria-label={label} className={`grid grid-cols-1 gap-grid ${COLS[images.length] ?? "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {images.map((img) => (
        <li key={img.src} className="group aspect-[4/3] overflow-hidden bg-(--mist)">
          <img
            src={`/media/${img.src}`}
            alt={img.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.06]"
          />
        </li>
      ))}
    </ul>
  );
}
