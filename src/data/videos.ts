/* ── Videos: the one place every film link lives ──
   The hero, the gallery, the contact band and the About stats band all read
   from here. `poster` is a path under public/media: the still shown while the
   film loads, and instead of it on small screens, slow connections and for
   reduced motion. */
export type VideoAsset = { id: string; src: string; poster: string; label: string };

export const VIDEOS = {
  looms: {
    id: "looms",
    src: "https://api.hameemgroup.com:9012/Resources/Videos/ccl.mp4",
    poster: "cine/looms.jpg",
    label: "Looms weaving indigo denim",
  },
  laser: {
    id: "laser",
    src: "https://api.hameemgroup.com:9012/Resources/Videos/laser-01.mp4",
    poster: "cine/laser.jpg",
    label: "Laser finishing",
  },
  textile: {
    id: "textile",
    src: "https://api.hameemgroup.com:9012/Resources/Videos/texttile-qwill-01.mp4",
    poster: "cine/fabric.jpg",
    label: "Fabric at the textile mill",
  },
  campus: {
    id: "campus",
    src: "https://api.hameemgroup.com:9012/Resources/Videos/gallery-main.mp4",
    poster: "gallery/chain-sewing.jpg",
    label: "Across the group",
  },
  rfid: {
    id: "rfid",
    src: "https://api.hameemgroup.com:9012/Resources/hameem-group-website/RFIDDIGITALVIDEO.mp4",
    poster: "gallery/chain-wash.jpg",
    label: "RFID-tracked production",
  },
  // The sustainability cards' topic loops (MP4s converted from the old GIFs)
  solar: { id: "solar", src: "/media/sustain/solar.mp4", poster: "sustain/solar.jpg", label: "Solar power" },
  water: { id: "water", src: "/media/sustain/water.mp4", poster: "sustain/water.jpg", label: "Water recycling" },
  fiber: { id: "fiber", src: "/media/sustain/fiber.mp4", poster: "sustain/fiber.jpg", label: "Power co-generation" },
  recycle: { id: "recycle", src: "/media/sustain/recycle.mp4", poster: "sustain/recycle.jpg", label: "Fibre recycling" },
} satisfies Record<string, VideoAsset>;

export type VideoId = keyof typeof VIDEOS;

/** The About stats band's film when no stat is chosen. */
export const ABOUT_STATS_DEFAULT_VIDEO: VideoId = "looms";
