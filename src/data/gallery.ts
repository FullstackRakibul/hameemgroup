/* ── Gallery page ──
   `src` is a base path under /media/ without the size suffix: the page loads
   `${src}-800.webp` and `${src}-1600.webp`. A full https URL is used as is
   (the download failed, so there is no local copy). `width`/`height` are the
   image's real proportions, used to reserve space. */
export type GalleryCategory = "Denim" | "Facilities" | "Virtual tours" | "Our group";
export type GalleryItem = { src: string; title: string; category: GalleryCategory; year?: string; width?: number; height?: number };

export const GALLERY_CATEGORIES: GalleryCategory[] = ["Denim", "Facilities", "Virtual tours", "Our group"];

const R = "https://api.hameemgroup.com:9012/Resources/";

export const GALLERY: GalleryItem[] = [
  { src: `${R}hameem-group-websile/denim-hameem-group-0001.jpeg`, title: "Denim mill", category: "Denim" },
  { src: "gallery/production-lines", title: "Production lines", category: "Facilities", width: 1600, height: 900 },
  { src: "gallery/at-a-glance", title: "At a glance", category: "Our group", width: 1333, height: 2000 },
  { src: "gallery/people", title: "Our people", category: "Our group", width: 1600, height: 900 },
  { src: `${R}hameem-group-websile/denim-hameem-group-0002.jpeg`, title: "Fabric inspection", category: "Denim" },
  { src: "gallery/inside-plant", title: "Inside the plant", category: "Facilities", width: 1600, height: 900 },
  { src: `${R}hameem-group-websile/denim-hameem-group-0003.jpeg`, title: "Denim finishing", category: "Denim" },
  { src: "gallery/denim-banner", title: "Denim at scale", category: "Denim", width: 1600, height: 900 },
  { src: "gallery/factory-floor", title: "Factory floor", category: "Facilities", width: 1600, height: 250 },
  { src: "gallery/campus", title: "Campus", category: "Facilities", width: 1600, height: 416 },
  { src: "gallery/tour-360", title: "360° tour", category: "Virtual tours", width: 81, height: 82 },
  { src: "gallery/textile-zone-360", title: "Textile zone, 360°", category: "Virtual tours", width: 435, height: 210 },
  { src: "gallery/tongi-zone-360", title: "Tongi zone, 360°", category: "Virtual tours", width: 435, height: 210 },
  { src: "gallery/profile", title: "Group profile", category: "Our group", width: 500, height: 500 },
];

export const GALLERY_VIDEO = {
  src: `${R}hameem-group-website/RFIDDIGITALVIDEO.mp4`,
  title: "RFID-tracked production, end to end",
  poster: "gallery/denim-banner",
};
