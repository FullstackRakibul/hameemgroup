import { F } from "./facts";

/* ── Vertical integration: the six steps ──
   One panel each in the home page's chain accordion, in production order.
   `stat` counts up when its step opens (unless it has no digits); `image` is
   a path under public/media. */
export type ChainStep = { title: string; text: string; stat: string; unit: string; image: string };

export const CHAIN_STEPS: ChainStep[] = [
  {
    title: "Spinning",
    text: "Cotton becomes yarn in our own spinning mills at Mawna, with rotor spinning and yarn dyeing added since.",
    stat: F.spinningDay,
    unit: "YARN SPUN A DAY",
    image: "chain-spinning.jpg",
  },
  {
    title: "Weaving & dyeing",
    text: `Ha-Meem Denim produces rope-dyed and slasher-dyed denim fabric: ${F.denimYardsMonth} yards of denim and ${F.nonDenimYardsMonth} yards of non-denim fabric a month.`,
    stat: `${F.denimYardsMonth} yds`,
    unit: "DENIM A MONTH",
    image: "chain-fabric.jpg",
  },
  {
    title: "Cutting & sewing",
    text: `Automatic spreading and cutting across ${F.factories} garment factories and ${F.productionLines} production lines, making ${F.garmentsYear} garments a year.`,
    stat: F.garmentsYear,
    unit: "GARMENTS A YEAR",
    image: "chain-sewing.jpg",
  },
  {
    title: "Washing & finishing",
    text: `Seven washing plants with ${F.laserMachines} laser machines and ${F.ozoneMachines} ozone machines support garment finishing, with processes including ozone, laser, over-dye, dip-dye and 3D whisker.`,
    stat: F.washingPlants,
    unit: "WASHING PLANTS",
    image: "chain-wash.jpg",
  },
  {
    title: "Trims & packaging",
    text: `Accessories are ${F.inHouseAccessories} in-house: labels, elastic, twill tape, buttons, zips and hangers, then export cartons and poly bags from our own plants.`,
    stat: F.labelsMonth,
    unit: "LABELS A MONTH",
    image: "chain-trims.jpg",
  },
  {
    title: "Shipping",
    text: "Our own transport fleet and clearing and forwarding offices at every Bangladeshi port move goods from factory gate to vessel.",
    stat: "EVERY",
    unit: "PORT, OWN C&F",
    image: "biz/label.jpg",
  },
];
