import { F } from "./facts";

/* ── What we do: the nine businesses ──
   One tile each in the home page's mosaic. `tile` names its slot in the
   mosaic's grid areas ("g" is the call-to-action tile, not a business).
   `unit` is the stat's full label; `unitShort` is what follows the "/" beside
   the figure. `image` is a path under public/media. */
export type MosaicSlot = "a" | "b" | "c" | "d" | "e" | "f" | "h" | "i" | "j";

export type Business = {
  stat: string;
  unit: string;
  unitShort: string;
  title: string;
  text: string;
  image: string;
  to: string;
  tile: MosaicSlot;
};

export const BUSINESSES: Business[] = [
  {
    stat: F.productionLines,
    unit: "PRODUCTION LINES",
    unitShort: "lines",
    title: "Woven garments",
    text: `${F.factories} garment factories make ${F.garmentsYear} readymade garments a year, part of a group of ${F.employeesText} people.`,
    image: "biz/woven.jpg",
    to: "/businesses/woven",
    tile: "a",
  },
  {
    stat: F.denimYardsMonth,
    unit: "YARDS A MONTH",
    unitShort: "month",
    title: "Denim mill",
    text: "Rope-dyed and slasher-dyed denim fabric made for fashion brands at Ha-Meem Denim.",
    image: "biz/denim.jpg",
    to: "/businesses/denim-mill",
    tile: "b",
  },
  {
    stat: F.spinningDay,
    unit: "YARN A DAY",
    unitShort: "day",
    title: "Spinning & textiles",
    text: "Ring and rotor yarn, woven non-denim fabric and, since 2025, yarn dyeing at Sreepur.",
    image: "biz/spinning.jpg",
    to: "/businesses/denim-mill#spinning",
    tile: "c",
  },
  {
    stat: F.washingPlants,
    unit: "WASHING PLANTS",
    unitShort: "plants",
    title: "Washing & finishing",
    text: "Seven plants support garment finishing across the group's integrated manufacturing operations.",
    image: "biz/laundry.jpg",
    to: "/businesses/laundry",
    tile: "d",
  },
  {
    stat: F.sweatersYear,
    unit: "SWEATERS A YEAR",
    unitShort: "year",
    title: "Sweaters",
    text: `Computerised flat-knitting at Kashimpur and Ashulia, on ${F.stollMachines} Stoll machines.`,
    image: "biz/sweater.jpg",
    to: "/businesses/sweater",
    tile: "e",
  },
  {
    stat: F.samplesDay,
    unit: "SAMPLES A DAY",
    unitShort: "day",
    title: "Design & sampling",
    text: `In-house designers, CAD and a ${F.sampleMachines}-machine sample room turn a brief into a counter sample.`,
    image: "biz/design.jpg",
    to: "/businesses/design-studio",
    tile: "f",
  },
  {
    stat: F.embroideryMachines,
    unit: "EMBROIDERY MACHINES",
    unitShort: "machines",
    title: "Embroidery, printing & trims",
    text: "Forty embroidery heads, screen and digital print, labels, elastic, belts and narrow fabric.",
    image: "biz/embroidery.jpg",
    to: "/businesses/embroidery-printing-accessories",
    tile: "h",
  },
  {
    stat: F.cartonExport,
    unit: "EXPORT-ORIENTED",
    unitShort: "export",
    title: "Packaging",
    text: "Export cartons, poly bags and printed paper trims so every order ships complete.",
    image: "biz/packaging.jpg",
    to: "/businesses/ancillary",
    tile: "i",
  },
  {
    stat: F.samakalFounded,
    unit: "SAMAKAL FOUNDED",
    unitShort: "founded",
    title: "Beyond apparel",
    text: "A national daily, a 24-hour news channel, jute, tea, transport and port clearing.",
    image: "biz/gate.jpg",
    to: "/about#other-businesses",
    tile: "j",
  },
];
