/* Buyer logos in /media/buyers/{id}.png. Shared by the homepage and /customers.
   oshkosh.png is left out: the file is the Oshkosh Defense logo, a different
   company from the OshKosh B'gosh children's brand. */
export type Buyer = { id: string; name: string };

export const buyers: Buyer[] = [
  { id: "gap", name: "GAP" },
  { id: "hm", name: "H&M" },
  { id: "zara", name: "Zara" },
  { id: "pvh", name: "PVH" },
  { id: "kohls", name: "Kohl's" },
  { id: "jcpenney", name: "JCPenney" },
  { id: "next", name: "Next" },
  { id: "mango", name: "Mango" },
  { id: "american-eagle", name: "American Eagle Outfitters" },
  { id: "abercrombie", name: "Abercrombie & Fitch" },
  { id: "tommy", name: "Tommy Hilfiger" },
  { id: "esprit", name: "Esprit" },
  { id: "lindex", name: "Lindex" },
  { id: "vf", name: "VF" },
  { id: "napapijri", name: "Napapijri" },
  { id: "tom-tailor", name: "Tom Tailor" },
  { id: "reitmans", name: "Reitmans" },
  { id: "levis", name: "Levi's" },
  { id: "calvin-klein", name: "Calvin Klein" },
  { id: "lee", name: "Lee" },
  { id: "carters", name: "Carter's" },
  { id: "dickies", name: "Dickies" },
  { id: "banana-republic", name: "Banana Republic" },
  { id: "muji", name: "Muji" },
  { id: "vans", name: "Vans" },
  { id: "s-oliver", name: "s.Oliver" },
  { id: "aeon", name: "Aeon" },
  { id: "timberland", name: "Timberland" },
  { id: "wrangler", name: "Wrangler" },
];
