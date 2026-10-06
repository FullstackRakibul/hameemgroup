// Shuvo · Ha-Meem Assist evaluation.
//
//   node scripts/eval-assistant.mjs [baseUrl] [--skip-build]
//
// Walks every viewport × state against the running dev server, saves
// screenshots/assistant/after/{w}x{h}-{state}.png, runs the automatable rows
// of the checklist and prints a PASS/FAIL table (exit 1 on any FAIL). Builds
// screenshots/assistant/compare/ when the design references exist in
// design/ai-assistant/. Uses the system Edge/Chrome (set PW_BROWSER to override).
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const BASE = args.find((a) => !a.startsWith("--")) || "http://localhost:5199/";
const SKIP_BUILD = args.includes("--skip-build");
const OUT = "screenshots/assistant/after";
const CMP = "screenshots/assistant/compare";
const REF = "design/ai-assistant";
const VIEWPORTS = [
  [360, 740], [375, 812], [414, 896], [768, 1024], [1024, 768],
  [1280, 720], [1280, 800], [1440, 900], [1920, 1080],
];
const { topics } = await import("../src/features/ai-assistant/data/topics.ts");
const { toasts } = await import("../src/features/ai-assistant/data/persona.ts");
const topic = (id) => topics.find((t) => t.id === id);
const expectedDelay = (t) => Math.min(1600, Math.max(700, 600 + t.reply.join(" ").length * 4));

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
  21: "Touch targets", 22: "Mobile full-screen sheet", 23: "Mobile compact launcher", 24: "No overlap",
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
  await page.locator(".hm-assist-launcher").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await wait(500);
}

const shot = (page, w, h, state) => page.screenshot({ path: `${OUT}/${w}x${h}-${state}.png` });
const isMobileW = (w) => w < 640;
const opener = (page, w) => page.locator(isMobileW(w) ? ".hm-assist-pill-open" : ".hm-assist-ask");

async function openPanel(page, w) {
  await opener(page, w).click();
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
      launcher: vis(document.querySelector(".hm-assist-card, .hm-assist-pill")),
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
  for (const box of ["launcher", "panel"]) {
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

const contrast = (page) =>
  page.evaluate(() => {
    const rgb = (c) => c.match(/[\d.]+/g).map(Number);
    const lum = (c) => {
      const [r, g, b] = rgb(c).slice(0, 3).map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bgOf = (el) => {
      for (let e = el; e; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor;
        const v = rgb(c);
        if (v.length < 4 || v[3] > 0.5) return c;
      }
      return "rgb(255, 255, 255)";
    };
    const sels = [
      ".hm-assist-launcher-title", ".hm-assist-launcher-sub", ".hm-assist-ask span", ".hm-assist-pill-open > span:last-child",
      ".hm-assist-name", ".hm-assist-meta span:last-child", ".hm-assist-welcome-hello", ".hm-assist-welcome-title",
      ".hm-assist-welcome-intro", ".hm-assist-chip span", ".hm-assist-msg-label span", ".hm-assist-msg-text p",
      ".hm-assist-msg--user p", ".hm-assist-link", ".hm-assist-footnote span", ".hm-assist-toast", ".hm-assist-newpill",
    ];
    const out = [];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el || !el.getBoundingClientRect().width) continue;
      const s = getComputedStyle(el);
      const fg = s.color;
      const bg = bgOf(el);
      const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
      const ratio = (l1 + 0.05) / (l2 + 0.05);
      const size = parseFloat(s.fontSize);
      const large = size >= 24 || (size >= 18.66 && parseInt(s.fontWeight) >= 700);
      out.push({ sel, ratio: +ratio.toFixed(2), min: large ? 3 : 4.5 });
    }
    const ta = document.querySelector(".hm-assist-textarea");
    if (ta) {
      const ph = getComputedStyle(ta, "::placeholder").color;
      const [l1, l2] = [lum(ph), lum(bgOf(ta))].sort((a, b) => b - a);
      out.push({ sel: "placeholder", ratio: +((l1 + 0.05) / (l2 + 0.05)).toFixed(2), min: 4.5 });
    }
    return out;
  });
async function contrastCheck(page, where) {
  const bad = (await contrast(page)).filter((c) => c.ratio < c.min);
  check(20, bad.length === 0, where, bad.map((c) => `${c.sel} ${c.ratio}`).join(", "));
}

/* ── Full walk for one viewport ── */
async function walk(browser, w, h) {
  const tag = `${w}x${h}`;
  const mobile = isMobileW(w);
  const { page, context } = await newPage(browser, w, h);
  await load(page, w, h);

  // launcher @ 0 and @ 1200
  await shot(page, w, h, "launcher");
  let g = await geometry(page);
  overlapChecks(g, `${tag} launcher@0`);
  touchCheck(await touchTargets(page), `${tag} launcher`);
  await contrastCheck(page, `${tag} launcher`);
  if (mobile) {
    const r = g.launcher;
    check(23, r.height <= 56 && r.width < g.vw - 32 && r.right <= g.vw - 15 && r.bottom <= g.vh - 15, tag, JSON.stringify(r));
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
  await openPanel(page, w);
  await shot(page, w, h, "welcome");
  const opened = await page.evaluate(() => ({
    launcher: !!document.querySelector(".hm-assist-launcher"),
    focused: document.activeElement?.classList.contains("hm-assist-textarea"),
  }));
  check(8, !opened.launcher && opened.focused, `${tag} open`, JSON.stringify(opened));
  g = await geometry(page);
  overlapChecks(g, `${tag} panel`);
  touchCheck(await touchTargets(page), `${tag} welcome`);
  await contrastCheck(page, `${tag} welcome`);
  check(18, (await page.getByRole("dialog", { name: "Shuvo" }).count()) === 1, `${tag} dialog name`);
  if (mobile) {
    const m = await page.evaluate(() => ({
      panel: document.querySelector(".hm-assist-panel").getBoundingClientRect().toJSON(),
      bottom: document.querySelector(".hm-assist-bottom").getBoundingClientRect().bottom,
      overflow: document.body.style.overflow,
      modal: document.querySelector(".hm-assist-panel").getAttribute("aria-modal"),
    }));
    check(22, near(m.panel.left, 0) && near(m.panel.top, 0) && near(m.panel.width, w) && near(m.panel.height, h) && m.overflow === "hidden" && near(m.bottom, h) && m.modal === "true", tag, JSON.stringify(m));
  }
  if (w === 1280 && h === 720) {
    const s = await page.evaluate(() => {
      const scroll = document.querySelector(".hm-assist-scroll").getBoundingClientRect();
      const chips = [...document.querySelectorAll(".hm-assist-welcome .hm-assist-chip")].map((c) => c.getBoundingClientRect());
      const panel = document.querySelector(".hm-assist-panel").getBoundingClientRect();
      return {
        inViewport: panel.top >= 0 && panel.bottom <= innerHeight && panel.left >= 0 && panel.right <= innerWidth,
        chips: chips.length,
        chipsVisible: chips.every((c) => c.top >= scroll.top && c.bottom <= scroll.bottom),
      };
    });
    check(25, s.inViewport && s.chips === 6 && s.chipsVisible, tag, JSON.stringify(s));
  }
  if (w === 1440) {
    // 7: fonts
    const fonts = await page.evaluate(() => {
      const ff = (sel) => getComputedStyle(document.querySelector(sel)).fontFamily;
      return { name: ff(".hm-assist-name"), chip: ff(".hm-assist-chip"), textarea: ff(".hm-assist-textarea") };
    });
    check(7, fonts.name.startsWith('"Fira Sans Condensed"') && fonts.chip.startsWith('"Fira Sans Condensed"'), "1440 name/chip", JSON.stringify(fonts));
    check(7, /^"Fira Sans"/.test(fonts.textarea), "1440 textarea", fonts.textarea);
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
    return !!log && log.contains(all[all.length - 1]);
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
  await page.locator(".hm-assist-header .hm-assist-round--outline").click();
  await wait(250);
  await shot(page, w, h, "toast");
  check(26, (await page.locator(".hm-assist-toast").textContent()) === toasts.call, `${tag} call toast`);
  await contrastCheck(page, `${tag} toast`);

  // 9 + 10: close with X, focus back on opener, reopen keeps the conversation
  const usersBefore = await page.locator(".hm-assist-msg--user").count();
  await page.getByRole("button", { name: "Close chat" }).click();
  await page.locator(".hm-assist-launcher").waitFor({ state: "visible" });
  await wait(150);
  const focusX = await page.evaluate((cls) => document.activeElement?.classList.contains(cls), mobile ? "hm-assist-pill-open" : "hm-assist-ask");
  check(9, (await page.locator(".hm-assist-panel").count()) === 0 && focusX, `${tag} X`, `focus ok ${focusX}`);
  check(9, !mobile || (await page.evaluate(() => document.body.style.overflow)) === "", `${tag} scroll unlocked`);
  if (mobile) await opener(page, w).click();
  else await page.locator(".hm-assist-expand").click();
  await page.locator(".hm-assist-panel").waitFor({ state: "visible" });
  await wait(450);
  check(10, (await page.locator(".hm-assist-msg--user").count()) === usersBefore, tag);
  await page.keyboard.press("Escape");
  await page.locator(".hm-assist-launcher").waitFor({ state: "visible" });
  await wait(150);
  const focusEsc = await page.evaluate((cls) => document.activeElement?.classList.contains(cls), mobile ? "hm-assist-pill-open" : "hm-assist-expand");
  check(9, (await page.locator(".hm-assist-panel").count()) === 0 && focusEsc, `${tag} Escape`, `focus ok ${focusEsc}`);

  const devices = await page.evaluate(() => window.__deviceCalls);
  check(26, devices.length === 0, `${tag} device calls`, devices.join(","));
  await context.close();
}

/* ── Content and keyboard rows (desktop 1440×900) ── */
async function contentRows(browser) {
  const w = 1440, h = 900;
  // 11: each chip, fresh page
  for (const t of topics.filter((x) => x.welcome)) {
    const { page, context } = await newPage(browser, w, h);
    await load(page, w, h);
    await openPanel(page, w);
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
  await openPanel(page, w);
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

  // 16: Shift+Tab from the textarea walks back through the panel in visual order
  await ta.focus();
  const seen = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press("Shift+Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      const panel = document.querySelector(".hm-assist-panel");
      return { inPanel: panel.contains(el), top: el.getBoundingClientRect().top, cls: el.className.split(" ")[0] || el.tagName, label: el.getAttribute("aria-label") || el.textContent.trim().slice(0, 20) };
    });
    if (!info.inPanel) break;
    seen.push(info);
  }
  const expectedStart = ["hm-assist-mic"];
  const order = seen.map((s) => s.cls);
  const headerIdx = order.indexOf("hm-assist-round");
  check(16, order[0] === expectedStart[0] && order.at(-1) === "hm-assist-round" && headerIdx >= order.length - 2, "1440 reverse order", order.join(" < "));

  // 17: every control shows a 2px outline when focused from the keyboard
  await page.getByRole("button", { name: "Call Ha-Meem (coming soon)" }).focus();
  const outlines = [];
  for (let i = 0; i < 40; i++) {
    const o = await page.evaluate(() => {
      const el = document.activeElement;
      const target = el.classList.contains("hm-assist-textarea") ? el.closest(".hm-assist-composer") : el;
      const s = getComputedStyle(target);
      return { label: el.getAttribute("aria-label") || el.textContent.trim().slice(0, 20), style: s.outlineStyle, width: s.outlineWidth, inPanel: !!el.closest(".hm-assist-panel") };
    });
    if (!o.inPanel) break;
    outlines.push(o);
    await page.keyboard.press("Tab");
  }
  const noRing = outlines.filter((o) => o.style === "none" || o.width !== "2px");
  check(17, outlines.length > 5 && noRing.length === 0, "1440", noRing.map((o) => o.label).join(", ") || `${outlines.length} controls`);

  // 29: open/close quickly five times
  await page.keyboard.press("Escape");
  await page.locator(".hm-assist-launcher").waitFor({ state: "visible" });
  for (let i = 0; i < 5; i++) {
    await page.locator(".hm-assist-ask").click();
    await wait(60);
    await page.keyboard.press("Escape");
    await page.locator(".hm-assist-launcher").waitFor({ state: "visible", timeout: 3000 });
  }
  await wait(600);
  const settled = await page.evaluate(() => ({
    panel: document.querySelectorAll(".hm-assist-panel").length,
    launcher: getComputedStyle(document.querySelector(".hm-assist-launcher")).opacity,
  }));
  await page.locator(".hm-assist-ask").click();
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
  await openPanel(m.page, 375);
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
    const launcherT = await page.evaluate(() => getComputedStyle(document.querySelector(".hm-assist-launcher")).transform);
    await opener(page, w).click();
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
    }));
    const msgSamples = [];
    await waitReply(page);
    for (let i = 0; i < 5; i++) {
      msgSamples.push(await page.evaluate(() => getComputedStyle([...document.querySelectorAll(".hm-assist-msg")].at(-1)).transform));
    }
    const scrolls = await page.evaluate(() => window.__scrollCalls);
    const flat = (t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
    check(28, flat(launcherT) && samples.every(flat) && msgSamples.every(flat), `${w} transforms`, JSON.stringify({ launcherT, samples: [...new Set(samples)], msg: [...new Set(msgSamples)] }));
    check(28, dots.anim === "none" && dots.text !== "none", `${w} typing`, JSON.stringify(dots));
    check(28, !scrolls.includes("smooth"), `${w} scroll`, scrolls.join(","));
    await context.close();
  }
}

/* ── Static checks ── */
async function staticRows() {
  // 1: isolation
  const status = execSync("git status --porcelain -uall", { encoding: "utf8" }).split("\n").filter(Boolean);
  const allowed = /^(src\/features\/ai-assistant\/|scripts\/|screenshots\/|design\/|package(-lock)?\.json$|src\/App\.tsx$)/;
  const stray = status.map((l) => l.slice(3)).filter((p) => !allowed.test(p));
  check(1, stray.length === 0, "git status", stray.join(", "));
  const appDiff = execSync("git diff --unified=0 -- src/App.tsx", { encoding: "utf8" });
  const added = appDiff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1).trim());
  const removed = appDiff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---"));
  check(1, removed.length === 0 && added.length === 2 && added.includes('import { AiAssistant } from "./features/ai-assistant";') && added.includes("{!loading && <AiAssistant />}"), "App.tsx diff", JSON.stringify(added));

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
  const leaks = selectors.filter((s) => !/^(\.hm-assist-|:root\b|body:has\(\.hm-assist-(launcher|panel)\) \.back-to-top$)/.test(s));
  check(2, leaks.length === 0, `${selectors.length} selectors`, leaks.join(" | "));

  // 6: no stray hex colours in the module
  const files = execSync("git ls-files --others --cached --exclude-standard src/features/ai-assistant", { encoding: "utf8" }).trim().split("\n");
  const hex = [];
  for (const f of files) {
    const lines = (await readFile(f, "utf8")).split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        if (!/--assist-(online|red-hover):/.test(line)) hex.push(`${f}:${i + 1} ${m[0]}`);
      }
    });
  }
  check(6, hex.length === 0, "module", hex.join(", "));

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

  // 31: build
  if (!SKIP_BUILD) {
    for (const cmd of ["npx tsc --noEmit -p tsconfig.json", "npm run build"]) {
      try {
        const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
        const warnings = out.split("\n").filter((l) => /warn|\(!\)/i.test(l) && !/configLoader|__dirname|VITE_CONFIG_NATIVE/.test(l));
        check(31, warnings.length === 0, cmd, warnings.join(" | "));
      } catch (e) {
        check(31, false, cmd, `${e.stdout || ""}${e.stderr || ""}`.slice(0, 300));
      }
    }
    results[31].note = "no lint script in package.json";
  }
}

/* ── Compare images (needs the design references) ── */
async function compare(browser) {
  const refs = ["launcher.png", "chat-panel.png", "welcome.png"];
  const missing = refs.filter((r) => !existsSync(`${REF}/${r}`));
  if (missing.length) return `references missing in ${REF}/: ${missing.join(", ")}`;
  await mkdir(CMP, { recursive: true });

  // Crops of ours at 1440×900
  const { page, context } = await newPage(browser, 1440, 900);
  await load(page, 1440, 900);
  const card = await page.locator(".hm-assist-card").boundingBox();
  await page.screenshot({ path: `${OUT}/1440x900-launcher-crop.png`, clip: { x: card.x - 16, y: card.y - 16, width: card.width + 32, height: card.height + 32 } });
  await openPanel(page, 1440);
  const panelBox = async () => page.locator(".hm-assist-panel").boundingBox();
  let p = await panelBox();
  await page.screenshot({ path: `${OUT}/1440x900-welcome-crop.png`, clip: p });
  await page.locator(".hm-assist-chip", { hasText: "Sustainability" }).click();
  await waitReply(page);
  await page.locator(".hm-assist-textarea").fill("I need a job");
  await page.locator(".hm-assist-textarea").press("Enter");
  await waitReply(page);
  p = await panelBox();
  await page.screenshot({ path: `${OUT}/1440x900-conversation-crop.png`, clip: p });
  await context.close();

  const pairs = [
    ["launcher.png", "1440x900-launcher-crop.png"],
    ["chat-panel.png", "1440x900-conversation-crop.png"],
    ["welcome.png", "1440x900-welcome-crop.png"],
  ];
  const sheet = await browser.newPage();
  for (const [ref, ours] of pairs) {
    const b64 = async (f) => (await readFile(f)).toString("base64");
    await sheet.setViewportSize({ width: 1400, height: 900 });
    await sheet.setContent(`<body style="margin:0;background:#888;font:600 14px system-ui;color:#fff">
      <div style="display:flex;gap:24px;align-items:flex-start;padding:12px">
        <figure style="margin:0"><figcaption>REFERENCE ${ref}</figcaption><img style="height:820px;display:block" src="data:image/png;base64,${await b64(`${REF}/${ref}`)}"></figure>
        <figure style="margin:0"><figcaption>OURS ${ours}</figcaption><img style="height:820px;display:block" src="data:image/png;base64,${await b64(`${OUT}/${ours}`)}"></figure>
      </div></body>`);
    await sheet.screenshot({ path: `${CMP}/${ref}`, fullPage: true });
  }
  await sheet.close();
  return null;
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
const compareBlocked = await compare(browser);
await browser.close();
await staticRows();
check(26, externalRequests.length === 0, "requests", externalRequests.slice(0, 5).join(" | "));
const noise = consoleProblems.filter((p) => !/Images loaded lazily/.test(p));
check(32, noise.length === 0, "console", noise.slice(0, 5).join(" | "));

const rows = Object.entries(ROWS).map(([id, name]) => {
  const r = results[id];
  if (["3", "4", "5"].includes(id)) {
    return [id, name, compareBlocked ? "BLOCKED" : "MANUAL", compareBlocked ?? `review ${CMP}/`];
  }
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
