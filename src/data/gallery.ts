/* ── Gallery page ──
   `src` is a path under /media/, as the file is named on disk. `width`/`height`
   are the image's real pixel size, used to reserve space before it loads. */
export type GalleryCategory = "Denim" | "Facilities" | "Virtual tours" | "Our group";
export type GalleryItem = { src: string; title: string; category: GalleryCategory; year?: string; width?: number; height?: number };

export const GALLERY_CATEGORIES: GalleryCategory[] = ["Denim", "Facilities", "Virtual tours", "Our group"];

export const GALLERY: GalleryItem[] = [
  { src: "gallery/denim.jpg", title: "Denim mill", category: "Denim", width: 1800, height: 982 },
  { src: "gallery/chain-sewing.jpg", title: "Production lines", category: "Facilities", width: 1920, height: 1080 },
  { src: "gallery/gate.jpg", title: "At a glance", category: "Our group", width: 1800, height: 1342 },
  { src: "gallery/people-knit.jpg", title: "Our people", category: "Our group", width: 2200, height: 1200 },
  { src: "gallery/chain-fabric.jpg", title: "Fabric inspection", category: "Denim", width: 2200, height: 1200 },
  { src: "gallery/spinning.jpg", title: "Inside the plant", category: "Facilities", width: 1800, height: 1012 },
  { src: "gallery/laundry.jpg", title: "Denim finishing", category: "Denim", width: 1800, height: 982 },
  { src: "gallery/chain-wash.jpg", title: "Denim at scale", category: "Denim", width: 2200, height: 1200 },
  { src: "gallery/woven.jpg", title: "Factory floor", category: "Facilities", width: 1800, height: 982 },
  { src: "gallery/sustain-campus.jpg", title: "Campus", category: "Facilities", width: 1600, height: 656 },
  { src: "gallery/textiles.jpg", title: "360° tour", category: "Virtual tours", width: 1800, height: 737 },
  { src: "gallery/chain-trims.jpg", title: "Textile zone, 360°", category: "Virtual tours", width: 1920, height: 1080 },
  { src: "gallery/chain-spinning.jpg", title: "Tongi zone, 360°", category: "Virtual tours", width: 1920, height: 1080 },
  { src: "gallery/news-yarn.jpg", title: "Group profile", category: "Our group", width: 1900, height: 1200 },
];

export const GALLERY_VIDEO = {
  src: "https://api.hameemgroup.com:9012/Resources/hameem-group-website/RFIDDIGITALVIDEO.mp4",
  title: "RFID-tracked production, end to end",
  poster: "gallery/chain-wash.jpg",
};

/* ── 360° VR tours ──
   The group's four live tour sites. `image` is the card photo: a path under
   /media/, as the file is named on disk, same as GalleryItem.src. */
export type VrTour = { id: string; name: string; company?: string; units: string; url: string; image: string; width: number; height: number };

export const VR_TOURS: VrTour[] = [
  {
    id: "tongi",
    name: "Tongi Zone",
    units: "Sewing, finishing, laundry, lab, laser, ozone",
    url: "https://360vr.hameemgroup.com/tongi/",
    image: "gallery/chain-sewing.jpg",
    width: 1920,
    height: 1080,
  },
  {
    id: "textile",
    name: "Textile Zone",
    units: "Textile, denim, spinning, recycle plant, yarn dyeing",
    url: "https://360vr.hameemgroup.com/textile/",
    image: "gallery/chain-spinning.jpg",
    width: 1920,
    height: 1080,
  },
  {
    id: "tikl",
    name: "That's It Knit Ltd.",
    company: "Sweater factory",
    units: "Winding, knitting, linking, wash",
    url: "https://360vr.hameemgroup.com/tikl/",
    image: "gallery/sweater.jpg",
    width: 1800,
    height: 982,
  },
  {
    id: "humana",
    name: "Humana Apparels Pvt. Ltd.",
    units: "Jackets & outerwear",
    url: "https://360vr.hameemgroup.com/humana/",
    image: "gallery/woven.jpg",
    width: 1800,
    height: 982,
  },
];
