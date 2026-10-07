// Every figure the assistant states must already appear on the site.
//
//   node scripts/check-assistant-facts.mjs
//
// Pulls the string literals out of data/topics.ts and data/persona.ts, takes
// every number token (/\d[\d.,]*/g), drops the allowed exceptions (the
// assistant ID, phone numbers, the postcode) and checks each one appears as a
// whole number in the site copy: src/pages/** and src/data/**. Figures the
// assistant interpolates from src/data/facts.ts are sourced by construction.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const SOURCES = ["src/features/ai-assistant/data/topics.ts", "src/features/ai-assistant/data/persona.ts"];
const SITE_DIRS = ["src/pages", "src/data"];

async function filesIn(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await filesIn(path)));
    else if (/\.(tsx?|mjs|js)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const siteFiles = (await Promise.all(SITE_DIRS.map(filesIn))).flat();
const site = (await Promise.all(siteFiles.map((f) => readFile(f, "utf8")))).join("\n");

const strings = (src) => [...src.matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2]);
const clean = (s) =>
  s
    .replace(/\$\{[^}]*\}/g, "") // interpolated from facts.ts
    .replace(/#?HM-6821/g, "")
    .replace(/\+?\d{2,3}(?:[\s-]?\d){7,}/g, "") // phone numbers
    .replace(/Dhaka-1208/g, "Dhaka");
const tokens = (s) => [...s.matchAll(/\d[\d.,]*/g)].map((m) => m[0].replace(/[.,]+$/, ""));
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const onSite = (n) => new RegExp(`(?<![\\d.,])${escape(n)}(?![\\d]|[.,]\\d)`).test(site);

const missing = [];
const checked = new Map();
for (const file of SOURCES) {
  for (const literal of strings(await readFile(file, "utf8"))) {
    for (const n of tokens(clean(literal))) {
      if (!checked.has(n)) checked.set(n, onSite(n));
      if (!checked.get(n)) missing.push(`${n}  (${file}: "${literal.slice(0, 60)}…")`);
    }
  }
}

console.log(`Read ${siteFiles.length} site files. Checked ${checked.size} distinct figures: ${[...checked.keys()].join(", ")}`);
if (missing.length) {
  console.log(`NOT FOUND in ${SITE_DIRS.join(", ")}:\n  ` + missing.join("\n  "));
  process.exitCode = 1;
} else {
  console.log("ALL FIGURES SOURCED");
}
