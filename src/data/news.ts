/* ── Newsroom ──
   Press reports about the group, newest first. `img` is a path under /media/.
   `highlight` must match a phrase in `title` exactly; it is marked in the
   headline. `dek` is a one-line standfirst that restates the headline and adds
   no facts of its own; leave it empty when there is nothing safe to add. An
   empty `url` shows the story without a link until the report is found. */
export type NewsItem = {
  cat: string;
  date: string;
  title: string;
  highlight?: string;
  dek?: string;
  img: string;
  url: string;
  source: string;
};

export const NEWS: NewsItem[] = [
  {
    cat: "TEXTILES",
    date: "1 SEP 2025",
    title: "Ha-Meem opens a new yarn-dyeing plant at Sreepur, Gazipur",
    highlight: "new yarn-dyeing plant",
    dek: "",
    img: "news-yarn.jpg",
    // Original report not found yet: the story shows without a link until one is added.
    url: "",
    source: "",
  },
  {
    cat: "SUSTAINABILITY",
    date: "2 FEB 2025",
    title: "A 4.4 MWp rooftop plant takes group solar capacity to 12.2 MWp",
    highlight: "12.2 MWp",
    dek: "The new rooftop installation adds 4.4 MWp, bringing the group's solar capacity to 12.2 MWp.",
    img: "biz/textiles.jpg",
    url: "https://www.thedailystar.net/business/news/ha-meem-group-installs-44mwp-rooftop-solar-power-plant-3814796",
    source: "The Daily Star",
  },
  {
    cat: "RECOGNITION",
    date: "NOV 2023",
    title: "Refat Garments receives the Bangabandhu Sheikh Mujib Export Trophy for FY2020-21",
    highlight: "Export Trophy",
    dek: "The trophy recognises Refat Garments' exports in the 2020-21 financial year.",
    img: "chain-sewing.jpg",
    url: "https://www.tbsnews.net/bangladesh/73-businesses-receive-national-export-trophy-735806",
    source: "The Business Standard",
  },
];
