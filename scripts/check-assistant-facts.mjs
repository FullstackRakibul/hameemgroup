// Every figure the assistant states must already appear on the site.
//
//   node scripts/check-assistant-facts.mjs
//
// Pulls the string literals out of data/topics.ts and data/persona.ts, takes
// every number token (/\d[\d.,]*/g), drops the allowed exceptions (the
// assistant ID, phone numbers, the postcode) and checks each one appears as a
// whole number in src/App.tsx.
import { readFile } from "node:fs/promises";

const SOURCES = ["src/features/ai-assistant/data/topics.ts", "src/features/ai-assistant/data/persona.ts"];
const app = await readFile("src/App.tsx", "utf8");

const strings = (src) => [...src.matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2]);
const clean = (s) =>
  s
    .replace(/#?HM-6821/g, "")
    .replace(/\+?\d{2,3}(?:[\s-]?\d){7,}/g, "") // phone numbers
    .replace(/Dhaka-1208/g, "Dhaka");
const tokens = (s) => [...s.matchAll(/\d[\d.,]*/g)].map((m) => m[0].replace(/[.,]+$/, ""));
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const onSite = (n) => new RegExp(`(?<![\\d.,])${escape(n)}(?![\\d]|[.,]\\d)`).test(app);

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

console.log(`Checked ${checked.size} distinct figures: ${[...checked.keys()].join(", ")}`);
if (missing.length) {
  console.log("NOT FOUND in src/App.tsx:\n  " + missing.join("\n  "));
  process.exitCode = 1;
} else {
  console.log("ALL FIGURES SOURCED");
}
