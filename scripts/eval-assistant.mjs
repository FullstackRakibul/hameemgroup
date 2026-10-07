// Shuvo · Ha-Meem Assist evaluation.
//
//   node scripts/eval-assistant.mjs [baseUrl] [--skip-build]
//
// Walks every viewport × state against the running dev server, saves
// screenshots/assistant/after/{w}x{h}-{state}.png, runs the checklist and prints
// a PASS/FAIL table (exit 1 on any FAIL). Rows 3–5 measure the layout against
// the reference design and write side-by-side images of the reference
// (design/ai-assistant/reference.png) and ours to screenshots/assistant/compare/.
// Uses the system Edge/Chrome (set PW_BROWSER to override).
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const BASE = args.find((a) => !a.startsWith("--")) || "http://localhost:5199/";
const SKIP_BUILD = args.includes("--skip-build");
const OUT = "screenshots/assistant/after";
const CMP = "screenshots/assistant/compare";
const REF = "design/ai-assistant/reference.png";
const VIEWPORTS = [
  [360, 740], [375, 812], [414, 896], [768, 1024], [1024, 768],
  [1280, 720], [1280, 800], [1440, 900], [1920, 1080],
];
// Load the assistant's data through Vite: topics.ts imports src/data/facts.ts
// with bundler-style (extensionless) paths that plain Node cannot resolve.
const { createServer } = await import("vite");
const loader = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const { topics } = await loader.ssrLoadModule("/src/features/ai-assistant/data/topics.ts");
const { toasts } = await loader.ssrLoadModule("/src/features/ai-assistant/data/persona.ts");
await loader.close();
const topic = (id) => topics.find((t) => t.id === id);
const expectedDelay = (t) => Math.min(1600, Math.max(700, 600 + t.reply.join(" ").length * 4));
const PRIMARY = "rgb(39, 66, 87)";
const WHITE = "rgb(255, 255, 255)";

function browserPath() {
  return [
    process.env.PW_BROWSER,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].find((p) => p && existsSync(p));
}

/* ── Bookkeeping ── */
const ROWS = {
  1: "Module is self-contained", 2: "No style leakage", 3: "Launcher matches reference",
  4: "Panel matches reference", 5: "Welcome matches reference", 6: "Brand tokens only", 7: "Fonts",
  8: "Launcher opens panel", 9: "Close paths", 10: "State persists", 11: "Chip → canned reply",
  12: "Typing indicator", 13: "Send disabled while typing", 14: "Free-text routing", 15: "Composer keys",
  16: "Tab order", 17: "Focus visible", 18: "Roles and names", 19: "Live announcements", 20: "Contrast",
  21: "Touch targets", 22: "Mobile full-screen sheet", 23: "Mobile launcher", 24: "No overlap",
  25: "Short laptop", 26: "No network / devices", 27: "Figures sourced", 28: "Reduced motion",
  29: "No stacked tweens", 30: "Preloader respected", 31: "Types and build", 32: "Clean console",
};
const results = Object.fromEntries(Object.keys(ROWS).map((k) => [k, { runs: 0, fails: [], note: "" }]));
const check = (id, ok, where, detail = "") => {
  results[id].runs++;
  if (!ok) results[id].fails.push(`${where}${detail ? `: ${detail}` : ""}`);
};
const consoleProblems = [];
const externalRequests = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;

/* ── Page setup: stubs record device APIs and scroll behaviour ── */
const INIT = () => {
  window.__deviceCalls = [];
  window.__scrollCalls = [];
  const md = navigator.mediaDevices || {};
  md.getUserMedia = async () => {
    window.__deviceCalls.push("getUserMedia");
    throw new Error("blocked");
  };
  if (window.speechSynthesis) {
    window.speechSynthesis.speak = () => window.__deviceCalls.push("speechSynthesis.speak");
  }
  const orig = Element.prototype.scrollTo;
  Element.prototype.scrollTo = function (...a) {
    if (this.classList?.contains("hm-assist-scroll")) window.__scrollCalls.push(a[0]?.behavior ?? "auto");
    return orig.apply(this, a);
  };
};

async function newPage(browser, w, h, opts = {}) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, ...opts });
  const page = await context.newPage();
  await page.addInitScript(INIT);
  const tag = `${w}x${h}${opts.reducedMotion ? " reduced" : ""}`;
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") consoleProblems.push(`${tag} ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => consoleProblems.push(`${tag} pageerror: ${e.message}`));
  page.on("requestfailed", (r) => consoleProblems.push(`${tag} requestfailed: ${r.url()} (${r.failure()?.errorText})`));
  page.on("request", (r) => {
    const url = r.url();
    // The page's own Google Fonts @import is not the assistant's traffic.
    if (!url.startsWith(BASE) && !url.startsWith("data:") && !/fonts\.(googleapis|gstatic)\.com/.test(url)) {
      externalRequests.push(`${tag} ${url}`);
    }
  });
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame() && !f.url().startsWith(BASE)) externalRequests.push(`${tag} navigated to ${f.url()}`);
  });
  return { page, context };
}

async function load(page, w, h) {
  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await wait(Math.max(0, 1000 - (Date.now() - t0)));
  const during = await page.locator(".hm-assist-launcher").count();
  check(30, during === 0, `${w}x${h} at 1s`, `${during} launcher(s) during preloader`);
  await page.locator(".hm-assist-fab").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await wait(1300); // the teaser appears ~1 s after the launcher
}

const shot = (page, w, h, state) => page.screenshot({ path: `${OUT}/${w}x${h}-${state}.png` });
const isMobileW = (w) => w < 640;
const fab = (page) => page.locator(".hm-assist-fab");

async function openPanel(page) {
  await fab(page).click();
  await page.locator(".hm-assist-panel").waitFor({ state: "visible" });
  await wait(450);
}
async function waitReply(page, since = Date.now()) {
  await page.locator(".hm-assist-typing").waitFor({ state: "attached", timeout: 1500 });
  await page.locator(".hm-assist-typing").waitFor({ state: "detached", timeout: 4000 });
  const elapsed = Date.now() - since;
  await wait(350);
  return elapsed;
}
const focusIsFab = (page) => page.evaluate(() => document.activeElement?.classList.contains("hm-assist-fab"));

/* ── In-page measurements ── */
const geometry = (page) =>
  page.evaluate(() => {
    const vis = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity) === 0) return null;
      const r = el.getBoundingClientRect();
      return r.width && r.height ? r.toJSON() : null;
    };
    return {
      launcher: vis(document.querySelector(".hm-assist-fab")),
      teaser: vis(document.querySelector(".hm-assist-teaser")),
      panel: vis(document.querySelector(".hm-assist-panel")),
      btt: vis(document.querySelector(".back-to-top")),
      stitch: vis(document.querySelector(".stitch-track")),
      noOverflow: document.documentElement.scrollWidth <= window.innerWidth,
      vw: window.innerWidth,
      vh: window.innerHeight,
    };
  });
const intersects = (a, b) => !!a && !!b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

function overlapChecks(g, where) {
  for (const box of ["launcher", "teaser", "panel"]) {
    if (!g[box]) continue;
    check(24, !intersects(g[box], g.btt), `${where} ${box}×back-to-top`, JSON.stringify([g[box], g.btt]));
    check(24, !intersects(g[box], g.stitch), `${where} ${box}×stitch`);
  }
  check(24, g.noOverflow, `${where} overflow`);
}

const touchTargets = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".hm-assist-root button")]
      .filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => {
        const r = b.getBoundingClientRect();
        const after = getComputedStyle(b, "::after");
        const extra = after.content !== "none" ? -2 * parseFloat(after.top || "0") : 0;
        return { name: b.getAttribute("aria-label") || b.textContent.trim(), w: r.width, h: r.height, hitH: r.height + extra };
      }),
  );
function touchCheck(list, where) {
  const bad = list.filter((b) => b.w < 44 || b.hitH < 44);
  check(21, bad.length === 0, where, bad.map((b) => `${b.name} ${b.w.toFixed(0)}×${b.h.toFixed(0)} hit ${b.hitH}`).join(", "));
}

// Text colour is blended over its background when it has alpha.
const contrast = (page) =>
  page.evaluate(() => {
    // "rgb(…)" / "rgba(…)" use 0–255; color-mix() results come back as "color(srgb r g b / a)" in 0–1.
    const rgba = (c) => {
      const v = c.match(/[\d.]+/g).map(Number);
      const rgb = c.startsWith("color(srgb") ? v.slice(0, 3).map((x) => x * 255) : v.slice(0, 3);
      return [...rgb, v[3] ?? 1];
    };
    const lum = ([r, g, b]) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const bgOf = (el) => {
      for (let e = el; e; e = e.parentElement) {
        const v = rgba(getComputedStyle(e).backgroundColor);
        if (v[3] > 0.5) return v;
      }
      return [255, 255, 255, 1];
    };
    const ratio = (fgC, bg) => {
      const [r, g, b, a] = rgba(fgC);
      const fg = [r * a + bg[0] * (1 - a), g * a + bg[1] * (1 - a), b * a + bg[2] * (1 - a)];
      const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    const sels = [
      ".hm-assist-teaser-open", ".hm-assist-title", ".hm-assist-headline", ".hm-assist-note", ".hm-assist-name",
      ".hm-assist-meta", ".hm-assist-date", ".hm-assist-msg-text p", ".hm-assist-msg--user p", ".hm-assist-chip",
      ".hm-assist-link span", ".hm-assist-footnote", ".hm-assist-toast", ".hm-assist-newpill", ".hm-assist-avatar",
    ];
    const out = [];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el || !el.getBoundingClientRect().width) continue;
      const s = getComputedStyle(el);
      const size = parseFloat(s.fontSize);
      const large = size >= 24 || (size >= 18.66 && parseInt(s.fontWeight) >= 700);
      // The avatar is split: check its letters against both halves.
      const bgs = sel === ".hm-assist-avatar" ? [[93, 46, 36, 1], [39, 66, 87, 1]] : [bgOf(el)];
      for (const bg of bgs) out.push({ sel, ratio: +ratio(s.color, bg).toFixed(2), min: large ? 3 : 4.5 });
    }
    const ta = document.querySelector(".hm-assist-textarea");
    if (ta) out.push({ sel: "placeholder", ratio: +ratio(getComputedStyle(ta, "::placeholder").color, bgOf(ta)).toFixed(2), min: 4.5 });
    return out;
  });
async function contrastCheck(page, where) {
  const bad = (await contrast(page)).filter((c) => c.ratio < c.min);
  check(20, bad.length === 0, where, bad.map((c) => `${c.sel} ${c.ratio}`).join(", "));
}

/* ── Rows 3–5: the layout measured against the reference design ── */
const launcherLayout = (page) =>
  page.evaluate(() => {
    const r = (el) => el?.getBoundingClientRect().toJSON();
    const fabEl = document.querySelector(".hm-assist-fab");
    const s = getComputedStyle(fabEl);
    const op = (sel) => getComputedStyle(fabEl.querySelector(sel)).opacity;
    return {
      fab: r(fabEl), radius: s.borderRadius, bg: s.backgroundColor, bgImage: s.backgroundImage,
      chat: op(".hm-assist-fab-icon--chat"), close: op(".hm-assist-fab-icon--close"),
      teaser: r(document.querySelector(".hm-assist-teaser-open")),
      chip: r(document.querySelector(".hm-assist-teaser-chip")),
      panel: r(document.querySelector(".hm-assist-panel")),
    };
  });

const panelLayout = (page) =>
  page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    const r = (el) => el?.getBoundingClientRect().toJSON();
    const panel = q(".hm-assist-panel");
    const ps = getComputedStyle(panel);
    const header = q(".hm-assist-header");
    const hs = getComputedStyle(header);
    const bubble = q(".hm-assist-msg--assistant .hm-assist-bubble");
    const bs = getComputedStyle(bubble);
    const avatar = q(".hm-assist-msg--assistant .hm-assist-avatar");
    const chips = [...document.querySelectorAll(".hm-assist-chip")];
    const cs = chips[0] && getComputedStyle(chips[0]);
    const ta = q(".hm-assist-textarea");
    const ts = getComputedStyle(ta);
    const send = q(".hm-assist-send");
    const date = q(".hm-assist-date");
    return {
      panel: r(panel), radius: ps.borderTopLeftRadius, border: ps.borderTopWidth,
      header: r(header), headerBottomRadius: hs.borderBottomLeftRadius,
      back: r(q(".hm-assist-header .hm-assist-hbtn")),
      title: r(q(".hm-assist-title")), headerAvatar: r(q(".hm-assist-header-avatar .hm-assist-avatar")),
      headline: r(q(".hm-assist-headline")), note: r(q(".hm-assist-note")),
      date: r(date), bubble: r(bubble), avatar: r(avatar),
      bubbleBg: bs.backgroundColor, bubbleBorder: bs.borderTopWidth, bubbleRadius: bs.borderTopLeftRadius,
      chips: chips.map(r), chipBg: cs?.backgroundColor, chipBorder: cs?.borderTopWidth, chipSvgs: chips.filter((c) => c.querySelector("svg")).length,
      scroll: r(q(".hm-assist-scroll")),
      ta: r(ta), taBorder: ts.borderTopWidth, taRadius: ts.borderTopLeftRadius,
      send: r(send), sendBg: getComputedStyle(send).backgroundColor, sendInnerFilled: !!send.querySelector("[class*=circle]"),
      mic: r(q(".hm-assist-mic")),
    };
  });

async function referenceRows(browser) {
  const { page, context } = await newPage(browser, 1440, 900);
  await load(page, 1440, 900);

  // Row 3 — closed (V8)
  let L = await launcherLayout(page);
  check(3, near(L.fab.width, 56) && near(L.fab.height, 56) && L.radius === "50%" && L.bg === PRIMARY && L.bgImage === "none", "V8 circle", JSON.stringify(L.fab));
  check(3, L.chat === "1" && L.close === "0", "V8 chat icon", `${L.chat}/${L.close}`);
  check(3, !!L.teaser && L.teaser.right <= L.fab.left && L.teaser.width <= 261 && L.teaser.bottom <= L.fab.bottom + 1, "V8 teaser left of circle", JSON.stringify(L.teaser));
  check(3, !!L.chip && near(L.chip.left + L.chip.width / 2, L.teaser.left, 2) && near(L.chip.top + L.chip.height / 2, L.teaser.top, 2) && near(L.chip.width, 22), "V8 dismiss on top-left corner", JSON.stringify(L.chip));
  await page.screenshot({ path: `${OUT}/1440x900-closed-crop.png`, clip: { x: L.teaser.left - 40, y: L.teaser.top - 40, width: L.fab.right - L.teaser.left + 64, height: L.fab.bottom - L.teaser.top + 64 } });

  // Row 3 — under the panel (V7)
  await openPanel(page);
  L = await launcherLayout(page);
  check(3, L.close === "1" && L.chat === "0" && near(L.fab.top - L.panel.bottom, 12) && near(L.fab.right, L.panel.right), "V7 close icon under panel", JSON.stringify({ gap: L.fab.top - L.panel.bottom, fab: L.fab.right, panel: L.panel.right }));

  // Rows 4 + 5 — welcome
  const P = await panelLayout(page);
  check(4, near(P.panel.width, 400) && P.radius === "18px" && P.border === "0px", "V1 panel", JSON.stringify({ w: P.panel.width, r: P.radius, b: P.border }));
  check(4, near(P.header.left, P.panel.left) && near(P.header.width, P.panel.width) && P.headerBottomRadius === "0px", "V1 header full width, square bottom");
  check(4, P.bubbleBg === WHITE && P.bubbleBorder === "1px" && P.bubbleRadius === "12px", "V4 bubble", JSON.stringify([P.bubbleBg, P.bubbleBorder, P.bubbleRadius]));
  check(4, near(P.avatar.width, 32) && P.avatar.right <= P.bubble.left && near(P.avatar.bottom, P.bubble.bottom, 1), "V4 avatar outside, bottom left", JSON.stringify([P.avatar, P.bubble]));
  check(4, P.taBorder === "1px" && P.taRadius === "22px" && P.mic.right <= P.ta.left && P.send.left >= P.ta.right && P.sendBg === "rgba(0, 0, 0, 0)" && !P.sendInnerFilled, "V6 composer", JSON.stringify([P.taBorder, P.taRadius, P.sendBg]));
  const cx = P.panel.left + P.panel.width / 2;
  check(5, P.header.height >= 200 && P.header.height <= 216, "V2 header height", `${P.header.height}`);
  check(5, P.back.left - P.panel.left < 24 && P.back.top - P.panel.top < 24, "V2 chevron top left", JSON.stringify(P.back));
  for (const [k, box] of [["title", P.title], ["avatar", P.headerAvatar], ["headline", P.headline], ["note", P.note]]) {
    check(5, !!box && near(box.left + box.width / 2, cx, 2), `V2 ${k} centred`, JSON.stringify(box));
  }
  check(5, near(P.headerAvatar.width, 56) && P.headerAvatar.top > P.title.bottom && P.headline.top > P.headerAvatar.bottom && P.note.top > P.headline.bottom, "V2 order");
  check(5, P.date.bottom <= P.bubble.top && P.bubble.bottom <= P.chips[0].top, "V3 date, greeting, chips", JSON.stringify([P.date.bottom, P.bubble.top, P.bubble.bottom, P.chips[0].top]));
  const rightEdge = Math.max(...P.chips.map((c) => c.right));
  const rows = new Set(P.chips.map((c) => Math.round(c.top))).size;
  const rowEnds = [...new Set(P.chips.map((c) => Math.round(c.top)))].map((t) => Math.max(...P.chips.filter((c) => Math.round(c.top) === t).map((c) => c.right)));
  check(5, P.chips.length === 6 && P.chipBg === WHITE && P.chipBorder === "1px" && P.chipSvgs === 0 && rows > 1 && rowEnds.every((e) => near(e, rightEdge)) && near(rightEdge, P.scroll.right - 20, 2), "V5 quick replies", JSON.stringify({ n: P.chips.length, rows, rightEdge, scrollRight: P.scroll.right }));
  await page.screenshot({ path: `${OUT}/1440x900-welcome-crop.png`, clip: { x: P.panel.left - 24, y: P.panel.top - 24, width: P.panel.width + 48, height: L.fab.bottom - P.panel.top + 48 } });

  // Conversation crop
  await page.locator(".hm-assist-chip", { hasText: "Talk to sales" }).click();
  await waitReply(page);
  await page.screenshot({ path: `${OUT}/1440x900-conversation-crop.png`, clip: { x: P.panel.left - 24, y: P.panel.top - 24, width: P.panel.width + 48, height: L.fab.bottom - P.panel.top + 48 } });
  await context.close();

  // Phone sheet
  const m = await newPage(browser, 375, 812);
  await load(m.page, 375, 812);
  await openPanel(m.page);
  await m.page.screenshot({ path: `${OUT}/375x812-sheet-crop.png` });
  await m.context.close();
}

async function compareSheets(browser) {
  if (!existsSync(REF)) return `reference missing: ${REF}`;
  await mkdir(CMP, { recursive: true });
  const b64 = async (f) => (await readFile(f)).toString("base64");
  const ref = await b64(REF);
  const sheet = await browser.newPage();
  for (const ours of ["1440x900-closed-crop.png", "1440x900-welcome-crop.png", "1440x900-conversation-crop.png", "375x812-sheet-crop.png"]) {
    // Both at 1 CSS px per image px: the reference is drawn at 1×.
    await sheet.setViewportSize({ width: 1800, height: 900 });
    await sheet.setContent(`<body style="margin:0;background:#888;font:600 14px system-ui;color:white">
      <div style="display:flex;gap:24px;align-items:flex-start;padding:12px">
        <figure style="margin:0"><figcaption>REFERENCE (1×)</figcaption><img style="display:block" src="data:image/png;base64,${ref}"></figure>
        <figure style="margin:0"><figcaption>OURS ${ours} (1×)</figcaption><img style="display:block" src="data:image/png;base64,${await b64(`${OUT}/${ours}`)}"></figure>
      </div></body>`);
    await sheet.screenshot({ path: `${CMP}/${ours.replace("-crop", "")}`, fullPage: true });
  }
  await sheet.close();
  return null;
}

/* ── Full walk for one viewport ── */
async function walk(browser, w, h) {
  const tag = `${w}x${h}`;
  const mobile = isMobileW(w);
  const { page, context } = await newPage(browser, w, h);
  await load(page, w, h);

  // launcher (+ teaser on wide screens) @ 0 and @ 1200
  await shot(page, w, h, "launcher");
  let g = await geometry(page);
  check(24, mobile ? !g.teaser : !!g.teaser, `${tag} teaser ${mobile ? "hidden" : "shown"}`);
  overlapChecks(g, `${tag} launcher@0`);
  touchCheck(await touchTargets(page), `${tag} launcher`);
  await contrastCheck(page, `${tag} launcher`);
  if (mobile) {
    const r = g.launcher;
    const radius = await fab(page).evaluate((el) => getComputedStyle(el).borderRadius);
    check(23, near(r.width, 56) && near(r.height, 56) && radius === "50%" && near(r.right, g.vw - 16) && near(r.bottom, g.vh - 16), tag, JSON.stringify(r));
  }
  await page.evaluate(() => window.scrollTo(0, 1200));
  await wait(800);
  g = await geometry(page);
  check(24, !!g.btt, `${tag} back-to-top visible @1200`);
  overlapChecks(g, `${tag} launcher@1200`);
  await shot(page, w, h, "launcher-scrolled");
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(400);

  // welcome
  await openPanel(page);
  await shot(page, w, h, "welcome");
  const opened = await page.evaluate(() => {
    const f = document.querySelector(".hm-assist-fab");
    return {
      launcher: !!f,
      expanded: f?.getAttribute("aria-expanded"),
      closeIcon: f ? getComputedStyle(f.querySelector(".hm-assist-fab-icon--close")).opacity : null,
      focused: document.activeElement?.classList.contains("hm-assist-textarea"),
    };
  });
  const launcherOk = mobile ? !opened.launcher : opened.launcher && opened.expanded === "true" && opened.closeIcon === "1";
  check(8, launcherOk && opened.focused, `${tag} open`, JSON.stringify(opened));
  g = await geometry(page);
  overlapChecks(g, `${tag} panel`);
  if (!mobile) {
    const fits = [g.panel, g.launcher].every((r) => r.top >= 16 && r.left >= 16 && r.right <= g.vw - 16 && r.bottom <= g.vh - 16);
    check(24, fits, `${tag} panel+launcher inside viewport with 16px`, JSON.stringify([g.panel, g.launcher]));
  }
  touchCheck(await touchTargets(page), `${tag} welcome`);
  await contrastCheck(page, `${tag} welcome`);
  check(18, (await page.getByRole("dialog", { name: "Ha-Meem Assist", exact: true }).count()) === 1, `${tag} dialog name`);
  if (mobile) {
    const m = await page.evaluate(() => ({
      panel: document.querySelector(".hm-assist-panel").getBoundingClientRect().toJSON(),
      bottom: document.querySelector(".hm-assist-bottom").getBoundingClientRect().bottom,
      overflow: document.body.style.overflow,
      modal: document.querySelector(".hm-assist-panel").getAttribute("aria-modal"),
      launcher: document.querySelectorAll(".hm-assist-fab").length,
    }));
    check(22, near(m.panel.left, 0) && near(m.panel.top, 0) && near(m.panel.width, w) && near(m.panel.height, h) && m.overflow === "hidden" && near(m.bottom, h) && m.modal === "true" && m.launcher === 0, tag, JSON.stringify(m));
  }
  if ((w === 1280 && h === 720) || (w === 1024 && h === 768)) {
    const s = await page.evaluate(() => {
      const scroll = document.querySelector(".hm-assist-scroll").getBoundingClientRect();
      const inside = (r) => r.top >= scroll.top && r.bottom <= scroll.bottom;
      const chips = [...document.querySelectorAll(".hm-assist-chip")].map((c) => c.getBoundingClientRect());
      const greeting = document.querySelector(".hm-assist-msg--assistant .hm-assist-bubble").getBoundingClientRect();
      const panel = document.querySelector(".hm-assist-panel").getBoundingClientRect();
      return {
        inViewport: panel.top >= 0 && panel.bottom <= innerHeight && panel.left >= 0 && panel.right <= innerWidth,
        chips: chips.length,
        chipsVisible: chips.every(inside),
        greetingVisible: inside(greeting),
      };
    });
    check(25, s.inViewport && s.chips === 6 && s.chipsVisible && s.greetingVisible, tag, JSON.stringify(s));
  }
  if (w === 1440) {
    // 7: fonts
    const fonts = await page.evaluate(() => {
      const ff = (sel) => getComputedStyle(document.querySelector(sel)).fontFamily;
      return { title: ff(".hm-assist-title"), chip: ff(".hm-assist-chip"), textarea: ff(".hm-assist-textarea"), bubble: ff(".hm-assist-msg-text p") };
    });
    check(7, fonts.title.startsWith('"Fira Sans Condensed"') && fonts.chip.startsWith('"Fira Sans Condensed"'), "1440 title/chip", JSON.stringify(fonts));
    check(7, /^"Fira Sans"/.test(fonts.textarea) && /^"Fira Sans"/.test(fonts.bubble), "1440 textarea/bubble", JSON.stringify(fonts));
  }

  // typing
  const sustain = topic("sustainability");
  // Time the fake typing inside the page: click → indicator removed.
  await page.evaluate(() => {
    const t = (window.__typingTimes = {});
    document.addEventListener("click", () => (t.click ??= performance.now()), { capture: true, once: true });
    new MutationObserver(() => {
      const has = !!document.querySelector(".hm-assist-typing");
      if (has && !t.start) t.start = performance.now();
      if (!has && t.start && !t.end) t.end = performance.now();
    }).observe(document.body, { childList: true, subtree: true });
  });
  await page.locator(".hm-assist-chip", { hasText: "Sustainability" }).click();
  await wait(200);
  await shot(page, w, h, "typing");
  const typing = await page.evaluate(() => {
    const t = document.querySelector(".hm-assist-typing");
    const log = document.querySelector('[role="log"][aria-live="polite"]');
    return { present: !!t, inLog: !!(log && t && log.contains(t)), sr: t?.querySelector(".hm-assist-sr")?.textContent };
  });
  check(12, typing.present, `${tag} at 200ms`);
  check(19, typing.inLog && typing.sr === "Shuvo is typing", `${tag} typing`, JSON.stringify(typing));
  // 13: Enter during typing adds nothing
  const users = await page.locator(".hm-assist-msg--user").count();
  await page.locator(".hm-assist-textarea").fill("hello");
  await page.locator(".hm-assist-textarea").press("Enter");
  await wait(50);
  check(13, (await page.locator(".hm-assist-msg--user").count()) === users, tag);
  await waitReply(page);
  const times = await page.evaluate(() => window.__typingTimes);
  const delay = Math.round(times.end - times.click);
  const gone = (await page.locator(".hm-assist-typing").count()) === 0;
  const exp = expectedDelay(sustain);
  check(12, gone && exp >= 700 && exp <= 1600 && delay >= exp - 20 && delay <= exp + 150, tag, `expected ${exp}ms, measured ~${delay}ms, gone ${gone}`);
  const live = await page.evaluate(() => {
    const log = document.querySelector('[role="log"][aria-live="polite"][aria-relevant="additions"]');
    const all = document.querySelectorAll(".hm-assist-msg--assistant");
    return !!log && log.contains(all[all.length - 1]) && !!all[all.length - 1].querySelector(".hm-assist-sr");
  });
  check(19, live, `${tag} reply in log`);
  check(18, (await page.locator('[role="log"]').count()) === 1, `${tag} log role`);

  // conversation
  await page.locator(".hm-assist-textarea").fill("I need a job");
  await page.locator(".hm-assist-textarea").press("Enter");
  await waitReply(page);
  await shot(page, w, h, "conversation");
  touchCheck(await touchTargets(page), `${tag} conversation`);
  await contrastCheck(page, `${tag} conversation`);
  const names = await page.evaluate(() =>
    [...document.querySelectorAll(".hm-assist-root button")].filter((b) => !(b.getAttribute("aria-label") || b.textContent.trim())).length,
  );
  check(18, names === 0, `${tag} unnamed buttons`, `${names}`);
  g = await geometry(page);
  overlapChecks(g, `${tag} conversation`);

  // toast
  await page.getByRole("button", { name: "Call Ha-Meem (coming soon)" }).click();
  await wait(250);
  await shot(page, w, h, "toast");
  check(26, (await page.locator(".hm-assist-toast").textContent()) === toasts.call, `${tag} call toast`);
  await contrastCheck(page, `${tag} toast`);

  // 9 + 10: close with the chevron, focus back on the launcher, reopen keeps the conversation
  const usersBefore = await page.locator(".hm-assist-msg--user").count();
  await page.getByRole("button", { name: "Close chat" }).click();
  await page.locator(".hm-assist-panel").waitFor({ state: "detached" });
  await wait(150);
  const focusX = await focusIsFab(page);
  check(9, (await page.locator(".hm-assist-panel").count()) === 0 && focusX, `${tag} chevron`, `focus ok ${focusX}`);
  check(9, !mobile || (await page.evaluate(() => document.body.style.overflow)) === "", `${tag} scroll unlocked`);
  await openPanel(page);
  const reopen = await page.evaluate(() => {
    const s = document.querySelector(".hm-assist-scroll");
    return { compact: !!document.querySelector(".hm-assist-header--compact"), atBottom: s.scrollHeight - s.scrollTop - s.clientHeight < 4 };
  });
  check(10, (await page.locator(".hm-assist-msg--user").count()) === usersBefore && reopen.compact && reopen.atBottom, tag, JSON.stringify(reopen));
  await page.keyboard.press("Escape");
  await page.locator(".hm-assist-panel").waitFor({ state: "detached" });
  await wait(150);
  const focusEsc = await focusIsFab(page);
  check(9, (await page.locator(".hm-assist-panel").count()) === 0 && focusEsc, `${tag} Escape`, `focus ok ${focusEsc}`);
  if (!mobile) {
    await openPanel(page);
    await fab(page).click();
    await page.locator(".hm-assist-panel").waitFor({ state: "detached" });
    await wait(150);
    const focusFab = await focusIsFab(page);
    const expanded = await fab(page).getAttribute("aria-expanded");
    check(9, focusFab && expanded === "false", `${tag} launcher closes`, `focus ok ${focusFab}, expanded ${expanded}`);
  }

  const devices = await page.evaluate(() => window.__deviceCalls);
  check(26, devices.length === 0, `${tag} device calls`, devices.join(","));
  await context.close();
}

/* ── Content and keyboard rows (desktop 1440×900) ── */
async function contentRows(browser) {
  const w = 1440, h = 900;
  // 11: each quick reply, fresh page
  for (const t of topics.filter((x) => x.welcome)) {
    const { page, context } = await newPage(browser, w, h);
    await load(page, w, h);
    await openPanel(page);
    await page.locator(".hm-assist-chip", { hasText: t.label }).click();
    await waitReply(page);
    const got = await page.evaluate(() => {
      const u = [...document.querySelectorAll(".hm-assist-msg--user p")].map((p) => p.textContent);
      const a = [...document.querySelectorAll(".hm-assist-msg--assistant:not(.hm-assist-typing)")].at(-1);
      return { user: u.at(-1), reply: [...a.querySelectorAll(".hm-assist-msg-text p")].map((p) => p.textContent) };
    });
    check(11, got.user === t.question && JSON.stringify(got.reply) === JSON.stringify(t.reply), t.id, JSON.stringify(got).slice(0, 120));
    await context.close();
  }

  const { page, context } = await newPage(browser, w, h);
  await load(page, w, h);
  await openPanel(page);
  const ta = page.locator(".hm-assist-textarea");

  // 15: composer keys
  let users = await page.locator(".hm-assist-msg--user").count();
  await ta.fill("");
  await ta.press("Enter");
  check(15, (await page.locator(".hm-assist-msg--user").count()) === users, "empty Enter");
  await ta.fill("first line");
  await ta.press("Shift+Enter");
  const v = await ta.inputValue();
  check(15, v === "first line\n" && (await page.locator(".hm-assist-msg--user").count()) === users, "Shift+Enter", JSON.stringify(v));
  // grows to four lines, then scrolls
  const heights = [];
  for (const text of ["a", "a\nb", "a\nb\nc", "a\nb\nc\nd", "a\nb\nc\nd\ne\nf"]) {
    await ta.fill(text);
    heights.push(await ta.evaluate((el) => ({ h: Math.round(el.getBoundingClientRect().height), scrolls: el.scrollHeight > el.clientHeight })));
  }
  const grows = heights[0].h < heights[1].h && heights[1].h < heights[2].h && heights[2].h < heights[3].h && heights[3].h === heights[4].h && heights[4].scrolls;
  check(15, grows, "1 → 4 lines, then scroll", JSON.stringify(heights));
  await ta.fill("");

  // 14: free-text routing (Enter sends)
  const routes = [
    ["do you have GOTS?", "sustainability"],
    ["I need a job", "careers"],
    ["hello", "greeting"],
    ["what's your MOQ for jackets", "contact"],
    ["asdfgh", "fallback"],
  ];
  for (const [text, id] of routes) {
    users = await page.locator(".hm-assist-msg--user").count();
    await ta.fill(text);
    await ta.press("Enter");
    const sent = (await page.locator(".hm-assist-msg--user").count()) === users + 1;
    const cleared = (await ta.inputValue()) === "";
    const focused = await page.evaluate(() => document.activeElement?.classList.contains("hm-assist-textarea"));
    if (text === "do you have GOTS?") check(15, sent && cleared && focused, "Enter sends", `${sent} ${cleared} ${focused}`);
    await waitReply(page);
    const first = await page.evaluate(
      () => [...document.querySelectorAll(".hm-assist-msg--assistant:not(.hm-assist-typing)")].at(-1)?.querySelector(".hm-assist-msg-text p")?.textContent ?? "(none)",
    );
    check(14, first === topic(id).reply[0], `"${text}" → ${id}`, first.slice(0, 60));
  }

  // speaker + mic toasts, no device calls
  await page.locator(".hm-assist-speaker").last().click();
  await wait(150);
  check(26, (await page.locator(".hm-assist-toast").textContent()) === toasts.speaker, "speaker toast");
  check(26, (await page.locator(".hm-assist-speaker").last().getAttribute("aria-pressed")) === "true", "speaker aria-pressed");
  await page.locator(".hm-assist-mic").click();
  await wait(150);
  check(26, (await page.locator(".hm-assist-toast").textContent()) === toasts.mic, "mic toast");

  // 16: Tab from the back chevron: chevron, call, conversation controls, mic, textarea, send, then the launcher
  await page.getByRole("button", { name: "Close chat" }).focus();
  const order = [];
  for (let i = 0; i < 80; i++) {
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      return { cls: el.className.split(" ")[0] || el.tagName, label: el.getAttribute("aria-label") || "", inPanel: !!el.closest(".hm-assist-panel") };
    });
    order.push(info);
    if (!info.inPanel) break;
    await page.keyboard.press("Tab");
  }
  const labels = order.map((o) => o.label || o.cls);
  const tail = order.slice(-4).map((o) => o.cls);
  check(16, labels[0] === "Close chat" && labels[1] === "Call Ha-Meem (coming soon)" && JSON.stringify(tail) === JSON.stringify(["hm-assist-mic", "hm-assist-textarea", "hm-assist-send", "hm-assist-fab"]), "1440 order", labels.join(" > "));

  // 17: every control shows a 2px ring when focused from the keyboard: white on the blue header, blue elsewhere
  await page.getByRole("button", { name: "Close chat" }).focus();
  const outlines = [];
  for (let i = 0; i < 80; i++) {
    const o = await page.evaluate(() => {
      const el = document.activeElement;
      const s = getComputedStyle(el);
      return { label: el.getAttribute("aria-label") || el.textContent.trim().slice(0, 20), style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, inHeader: !!el.closest(".hm-assist-header"), inPanel: !!el.closest(".hm-assist-panel") };
    });
    if (!o.inPanel) break;
    outlines.push(o);
    await page.keyboard.press("Tab");
  }
  const noRing = outlines.filter((o) => o.style === "none" || o.width !== "2px" || o.color !== (o.inHeader ? WHITE : PRIMARY));
  check(17, outlines.length > 5 && noRing.length === 0, "1440", noRing.map((o) => `${o.label} ${o.color}`).join(", ") || `${outlines.length} controls`);
  const fabRing = await page.evaluate(() => {
    const f = document.querySelector(".hm-assist-fab");
    f.focus();
    const s = getComputedStyle(f);
    return { outline: s.outlineStyle !== "none" && s.outlineWidth === "2px", shadow: s.boxShadow.includes("255, 255, 255") };
  });
  check(17, fabRing.outline && fabRing.shadow, "launcher ring", JSON.stringify(fabRing));

  // 29: open/close quickly five times (launcher and Escape)
  await page.keyboard.press("Escape");
  await page.locator(".hm-assist-panel").waitFor({ state: "detached" });
  for (let i = 0; i < 5; i++) {
    await fab(page).click();
    await wait(60);
    if (i % 2) await page.keyboard.press("Escape");
    else await fab(page).click();
    await page.locator(".hm-assist-panel").waitFor({ state: "detached", timeout: 3000 });
  }
  await wait(600);
  const settled = await page.evaluate(() => ({
    panel: document.querySelectorAll(".hm-assist-panel").length,
    launcher: getComputedStyle(document.querySelector(".hm-assist-fab")).opacity,
  }));
  await fab(page).click();
  await wait(600);
  const reopened = await page.evaluate(() => {
    const p = document.querySelector(".hm-assist-panel");
    const s = getComputedStyle(p);
    return { opacity: s.opacity, transform: s.transform };
  });
  check(29, settled.panel === 0 && settled.launcher === "1" && reopened.opacity === "1" && (reopened.transform === "none" || reopened.transform === "matrix(1, 0, 0, 1, 0, 0)"), "5× open/close", JSON.stringify({ settled, reopened }));
  await context.close();

  // 16 (mobile): focus never leaves the sheet
  const m = await newPage(browser, 375, 812);
  await load(m.page, 375, 812);
  await openPanel(m.page);
  let outside = 0;
  for (let i = 0; i < 25; i++) {
    await m.page.keyboard.press(i % 2 ? "Tab" : "Shift+Tab");
    if (!(await m.page.evaluate(() => document.querySelector(".hm-assist-panel").contains(document.activeElement)))) outside++;
  }
  for (let i = 0; i < 20; i++) {
    await m.page.keyboard.press("Shift+Tab");
    if (!(await m.page.evaluate(() => document.querySelector(".hm-assist-panel").contains(document.activeElement)))) outside++;
  }
  check(16, outside === 0, "375 focus trap", `${outside} escapes`);
  await m.context.close();
}

/* ── Reduced motion ── */
async function reducedRows(browser) {
  for (const [w, h] of [[1440, 900], [375, 812]]) {
    const { page, context } = await newPage(browser, w, h, { reducedMotion: "reduce" });
    await load(page, w, h);
    const launcherT = await fab(page).evaluate((el) => getComputedStyle(el).transform);
    await fab(page).click();
    const samples = [];
    for (let i = 0; i < 8; i++) {
      samples.push(await page.evaluate(() => getComputedStyle(document.querySelector(".hm-assist-panel")).transform));
      await wait(25);
    }
    await wait(300);
    await shot(page, w, h, "reduced-motion");
    await page.locator(".hm-assist-chip", { hasText: "Our products" }).click();
    await wait(100);
    const dots = await page.evaluate(() => ({
      anim: getComputedStyle(document.querySelector(".hm-assist-dot")).animationName,
      text: getComputedStyle(document.querySelector(".hm-assist-typing-text")).display,
      header: getComputedStyle(document.querySelector(".hm-assist-header")).transitionDuration,
    }));
    const msgSamples = [];
    await waitReply(page);
    for (let i = 0; i < 5; i++) {
      msgSamples.push(await page.evaluate(() => getComputedStyle([...document.querySelectorAll(".hm-assist-msg")].at(-1)).transform));
    }
    const scrolls = await page.evaluate(() => window.__scrollCalls);
    const flat = (t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
    check(28, flat(launcherT) && samples.every(flat) && msgSamples.every(flat), `${w} transforms`, JSON.stringify({ launcherT, samples: [...new Set(samples)], msg: [...new Set(msgSamples)] }));
    check(28, dots.anim === "none" && dots.text !== "none" && dots.header === "0s", `${w} typing + header`, JSON.stringify(dots));
    check(28, !scrolls.includes("smooth"), `${w} scroll`, scrolls.join(","));
    await context.close();
  }
}

/* ── Static checks ── */
async function staticRows() {
  // 1: isolation — only the module, scripts and design/screenshot assets change; App.tsx untouched
  const status = execSync("git status --porcelain -uall", { encoding: "utf8" }).split("\n").filter(Boolean);
  const allowed = /^(src\/features\/ai-assistant\/|scripts\/|screenshots\/|design\/)/;
  const stray = status.map((l) => l.slice(3)).filter((p) => !allowed.test(p));
  check(1, stray.length === 0, "git status", stray.join(", "));
  const appDiff = execSync("git diff -- src/App.tsx", { encoding: "utf8" });
  check(1, appDiff.trim() === "", "App.tsx untouched");

  // 2: every selector is namespaced
  const css = (await readFile("src/features/ai-assistant/ai-assistant.css", "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = [];
  const keyframeDepth = [];
  let depth = 0;
  for (const m of css.matchAll(/([^{}]+)\{|\}/g)) {
    if (m[0] === "}") {
      depth--;
      if (keyframeDepth.at(-1) === depth) keyframeDepth.pop();
      continue;
    }
    const sel = m[1].trim();
    if (sel.startsWith("@keyframes")) keyframeDepth.push(depth);
    else if (!sel.startsWith("@") && !keyframeDepth.length) selectors.push(...sel.split(",").map((s) => s.trim()));
    depth++;
  }
  const leaks = selectors.filter((s) => !/^(\.hm-assist-|body:has\(\.hm-assist-panel\) \.back-to-top$)/.test(s));
  check(2, leaks.length === 0, `${selectors.length} selectors`, leaks.join(" | "));

  // 6: hex only on the three token declarations
  const files = execSync("git ls-files --others --cached --exclude-standard src/features/ai-assistant", { encoding: "utf8" }).trim().split("\n").filter(existsSync);
  const hex = [];
  const tokens = [];
  for (const f of files) {
    const lines = (await readFile(f, "utf8")).split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        if (/^\s*--assist-(primary|accent|online):/.test(line)) tokens.push(m[0]);
        else hex.push(`${f}:${i + 1} ${m[0]}`);
      }
    });
  }
  check(6, hex.length === 0 && tokens.length === 3, "module", hex.join(", ") || `tokens ${tokens.join(" ")}`);

  // 26: no network or device APIs in the source
  const src = (await Promise.all(files.map((f) => readFile(f, "utf8")))).join("\n");
  const banned = ["fetch(", "XMLHttpRequest", "WebSocket", "getUserMedia", "speechSynthesis", "tel:", "localStorage", "sessionStorage"].filter((b) => src.includes(b));
  check(26, banned.length === 0, "source", banned.join(", "));

  // 27: figures
  try {
    const out = execSync("node scripts/check-assistant-facts.mjs", { encoding: "utf8" });
    check(27, out.includes("ALL FIGURES SOURCED"), "facts", out.trim().split("\n").at(-1));
  } catch (e) {
    check(27, false, "facts", e.stdout);
  }

  // 31: types and build, with no warnings on stdout or stderr
  if (!SKIP_BUILD) {
    for (const cmd of ["npx tsc --noEmit -p tsconfig.json", "npm run build"]) {
      try {
        const out = execSync(`${cmd} 2>&1`, { encoding: "utf8" });
        const warnings = out.split("\n").filter((l) => /warn|\(!\)/i.test(l) && !/configLoader|__dirname|VITE_CONFIG_NATIVE|npm notice/.test(l));
        check(31, warnings.length === 0, cmd, warnings.join(" | "));
      } catch (e) {
        check(31, false, cmd, `${e.stdout || ""}${e.stderr || ""}`.slice(0, 300));
      }
    }
    results[31].note = "no lint script in package.json";
  }
}

/* ── Run ── */
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath() });
for (const [w, h] of VIEWPORTS) {
  process.stdout.write(`… ${w}x${h}\n`);
  await walk(browser, w, h);
}
process.stdout.write("… content + keyboard\n");
await contentRows(browser);
process.stdout.write("… reduced motion\n");
await reducedRows(browser);
process.stdout.write("… reference\n");
await referenceRows(browser);
const compareBlocked = await compareSheets(browser);
if (compareBlocked) for (const id of [3, 4, 5]) check(id, false, "compare", compareBlocked);
await browser.close();
await staticRows();
check(26, externalRequests.length === 0, "requests", externalRequests.slice(0, 5).join(" | "));
const noise = consoleProblems.filter((p) => !/Images loaded lazily/.test(p));
check(32, noise.length === 0, "console", noise.slice(0, 5).join(" | "));
for (const id of [3, 4, 5]) results[id].note = `side by side in ${CMP}/`;

const rows = Object.entries(ROWS).map(([id, name]) => {
  const r = results[id];
  if (id === "31" && SKIP_BUILD) return [id, name, "SKIPPED", "--skip-build"];
  const status = r.runs === 0 ? "NOT RUN" : r.fails.length ? "FAIL" : "PASS";
  return [id, name, status, r.fails.length ? r.fails.slice(0, 2).join(" ‖ ") : `${r.runs} assertions${r.note ? `; ${r.note}` : ""}`];
});
const pad = (s, n) => String(s).padEnd(n);
console.log(`\n${pad("#", 4)}${pad("Check", 30)}${pad("Result", 9)}Detail`);
console.log("-".repeat(110));
for (const [id, name, status, detail] of rows) console.log(`${pad(id, 4)}${pad(name, 30)}${pad(status, 9)}${detail}`);
const failing = rows.filter((r) => r[2] === "FAIL" || r[2] === "NOT RUN");
console.log(`\n${failing.length ? `${failing.length} row(s) failing` : "All automated rows pass"}`);
process.exitCode = failing.length ? 1 : 0;
