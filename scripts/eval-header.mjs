// Header / mega menu / mobile menu evaluation.
//
//   node scripts/eval-header.mjs [baseUrl] [--compare] [--skip-build]
//
// Walks every width × state against the running dev server, saves
// screenshots/after/{width}-{state}.png, asserts the checklist and prints a
// PASS/FAIL table. --compare also captures the reference demo and writes
// side-by-side images (demo left, ours right) to screenshots/compare/.
// Uses the system Edge/Chrome through Playwright; set PW_BROWSER to override.
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const BASE = args.find((a) => !a.startsWith("--")) || "http://localhost:5199/";
const COMPARE = args.includes("--compare");
const SKIP_BUILD = args.includes("--skip-build");
const DEMO = "https://hameemgroup-demo.reliabuilds.com";
const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920, 2560, 3840];
const HEIGHT = 900;
const DESKTOP = 1024;
const INK = "rgb(17, 20, 24)";
const WHITE = "rgb(255, 255, 255)";
const MEGA = ["company", "businesses", "products"];

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

/* ── Result bookkeeping ── */
const CHECKS = {
  1: "Header solid while mega open",
  2: "Nav text dark while mega open",
  3: "Active item marked",
  4: "Hairline under header",
  5: "Transparent at top",
  6: "Reverts after close",
  7: "Solid when scrolled",
  8: "Panel flush with header",
  9: "Panel aligned to .wrap",
  10: "Rows not indented",
  11: "Businesses columns",
  12: "Panel fits screen",
  13: "Keyboard open/close",
  14: "Breakpoint switch",
  15: "Menu button works",
  16: "Mobile menu groups",
  17: "Mobile closes",
  18: "Touch targets",
  19: "No horizontal overflow",
  20: "No nav wrap or overlap",
  21: "TV alignment",
  22: "Logo not distorted",
  23: "Reduced motion",
  24: "Visual match",
  25: "Build clean",
  26: "No console errors",
};
const results = Object.fromEntries(Object.keys(CHECKS).map((k) => [k, { runs: 0, fails: [] }]));
function check(id, ok, where, detail = "") {
  results[id].runs++;
  if (!ok) results[id].fails.push(`${where}${detail ? `: ${detail}` : ""}`);
}
const consoleErrors = [];

/* ── Page helpers ── */
async function openPage(browser, width, height = HEIGHT, opts = {}) {
  const context = await browser.newContext({ viewport: { width, height }, ...opts });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(`${width}: ${m.text()}`));
  page.on("pageerror", (e) => consoleErrors.push(`${width}: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && consoleErrors.push(`${width}: HTTP ${r.status()} ${r.url()}`));
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector("main")).opacity === "1", null, { timeout: 15000 });
  await page.waitForTimeout(300);
  return page;
}

const shot = (page, width, state) =>
  page.screenshot({ path: `screenshots/after/${width}-${state}.png`, clip: { x: 0, y: 0, width, height: 700 } });

const overflow = async (page) => {
  const measure = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  if (await measure()) return true;
  // Re-measure once after layout settles (e.g. straight after a viewport resize).
  await page.waitForTimeout(500);
  return measure();
};

const snapshot = (page) =>
  page.evaluate(() => {
    const vis = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
    const rect = (el) => el && el.getBoundingClientRect().toJSON();
    const wrapper = document.querySelector(".header-wrapper");
    const bar = document.querySelector(".header-bar");
    const nav = document.querySelector("nav[aria-label=Main]");
    const menuBtn = document.querySelector(".menu-btn");
    const logoImgs = [...document.querySelectorAll(".site-logo img")];
    const shownLogo = logoImgs.find((i) => getComputedStyle(i).opacity === "1");
    const links = nav ? [...nav.querySelectorAll(".nav-link")] : [];
    return {
      bg: getComputedStyle(wrapper).backgroundColor,
      color: getComputedStyle(wrapper).color,
      barBorder: getComputedStyle(bar).borderBottom,
      barRect: rect(bar),
      navVisible: vis(nav),
      navRect: rect(nav),
      menuVisible: vis(menuBtn),
      menuColor: menuBtn && getComputedStyle(menuBtn).color,
      menuRect: rect(menuBtn),
      logoRect: rect(document.querySelector(".site-logo")),
      pillBg: getComputedStyle(document.querySelector(".logo-pill")).backgroundColor,
      logoShown: shownLogo && {
        src: shownLogo.getAttribute("src"),
        ratio: shownLogo.getBoundingClientRect().width / shownLogo.getBoundingClientRect().height,
        natural: shownLogo.naturalWidth / shownLogo.naturalHeight,
      },
      links: links.map((l) => ({
        text: l.textContent.trim(),
        color: getComputedStyle(l).color,
        chevronColor: l.querySelector("svg") ? getComputedStyle(l.querySelector("svg")).color : null,
        chevronTransform: l.querySelector("svg") ? getComputedStyle(l.querySelector("svg")).transform : null,
        opacity: getComputedStyle(l).opacity,
        expanded: l.getAttribute("aria-expanded"),
        height: l.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(l).lineHeight),
        padY: parseFloat(getComputedStyle(l).paddingTop) + parseFloat(getComputedStyle(l).paddingBottom),
        right: l.getBoundingClientRect().right,
      })),
      siteHeaderRect: rect(document.querySelector(".site-header")),
      pageWrapRect: rect(document.querySelector("#company .wrap")),
      mistColor: (() => {
        const p = document.createElement("div");
        p.style.color = "var(--mist)";
        document.body.append(p);
        const c = getComputedStyle(p).color;
        p.remove();
        return c;
      })(),
      hairColor: (() => {
        const p = document.createElement("div");
        p.style.color = "var(--hair)";
        document.body.append(p);
        const c = getComputedStyle(p).color;
        p.remove();
        return c;
      })(),
    };
  });

const panelInfo = (page) =>
  page.evaluate(() => {
    const panel = document.querySelector(".mega-panel");
    if (!panel) return null;
    const wrap = panel.querySelector(".wrap");
    const eyebrow = wrap.children[0].children[0];
    const ul = panel.querySelector("ul");
    const rows = [...ul.querySelectorAll("a")];
    const first = rows[0];
    const title = first.querySelector("span");
    const headline = wrap.children[0].children[1];
    const titleText = [...first.querySelectorAll("span")].find((el) => !el.children.length);
    return {
      headlineMarginTop: getComputedStyle(headline).marginTop,
      headlineFontSize: getComputedStyle(headline).fontSize,
      titleFontSize: getComputedStyle(titleText).fontSize,
      rect: panel.getBoundingClientRect().toJSON(),
      scrollable: panel.scrollHeight > panel.clientHeight && getComputedStyle(panel).overflowY !== "visible",
      wrapRect: wrap.getBoundingClientRect().toJSON(),
      eyebrowLeft: eyebrow.getBoundingClientRect().left,
      ulRect: ul.getBoundingClientRect().toJSON(),
      firstRowLeft: first.getBoundingClientRect().left,
      titleLeft: title.getBoundingClientRect().left,
      columns: new Set(rows.map((r) => Math.round(r.getBoundingClientRect().left))).size,
      animationName: getComputedStyle(panel).animationName,
      id: panel.id,
      role: panel.getAttribute("role"),
    };
  });

const trigger = (page, key) => page.locator(`button[aria-controls="mega-${key}"]`);

/* ── Desktop walk ── */
async function desktop(browser, width) {
  const page = await openPage(browser, width);
  let s = await snapshot(page);
  await shot(page, width, "top");
  check(5, s.bg.endsWith(", 0)") || s.bg === "transparent", `${width} top`, s.bg);
  check(5, s.links.every((l) => l.color === WHITE), `${width} top nav text`, s.links.map((l) => l.color).join(" "));
  check(19, await overflow(page), `${width} top`);
  check(22, s.logoShown && Math.abs(s.logoShown.ratio / s.logoShown.natural - 1) <= 0.01, `${width} top`, JSON.stringify(s.logoShown));
  check(14, s.navVisible !== s.menuVisible, `${width}`, `nav ${s.navVisible} menu ${s.menuVisible}`);
  check(20, s.links.every((l) => l.height - l.padY < l.lineHeight * 1.5), `${width} wrap`, s.links.map((l) => l.height).join(","));
  check(20, s.navRect.left > s.logoRect.right + 24, `${width} overlap`, `${s.navRect.left} vs ${s.logoRect.right}`);
  if (width >= 1920) {
    check(21, Math.abs(s.barRect.width - width) < 1, `${width} bar full-bleed`, `${s.barRect.width}`);
    check(21, Math.abs(s.siteHeaderRect.left - s.pageWrapRect.left) <= 1 && Math.abs(s.siteHeaderRect.right - s.pageWrapRect.right) <= 1, `${width} header in .wrap`, `${s.siteHeaderRect.left}-${s.siteHeaderRect.right} vs ${s.pageWrapRect.left}-${s.pageWrapRect.right}`);
  }

  for (const key of MEGA) {
    await trigger(page, key).hover();
    await page.waitForTimeout(400);
    await shot(page, width, `mega-${key}`);
    s = await snapshot(page);
    const p = await panelInfo(page);
    const where = `${width} mega-${key}`;
    check(1, s.bg === WHITE, where, s.bg);
    const others = s.links.filter((l) => l.expanded !== "true");
    check(2, others.every((l) => l.color === INK && (l.chevronColor === null || l.chevronColor === INK)), where, others.map((l) => `${l.text}:${l.color}/${l.chevronColor}`).join(" "));
    const active = s.links.find((l) => l.expanded === "true");
    check(3, !!active && active.color === INK && active.opacity === "0.6" && active.chevronTransform === "matrix(-1, 0, 0, -1, 0, 0)", where, JSON.stringify(active));
    check(4, s.barBorder === `1px solid ${s.hairColor}`, where, s.barBorder);
    check(8, !!p && Math.abs(p.rect.top - s.barRect.bottom) <= 1, where, p && `${p.rect.top} vs ${s.barRect.bottom}`);
    check(9, !!p && Math.abs(p.eyebrowLeft - s.logoRect.left) <= 2, `${where} left`, p && `${p.eyebrowLeft} vs ${s.logoRect.left}`);
    check(9, !!p && Math.abs(p.ulRect.right - s.links.at(-1).right) <= 2, `${where} right`, p && `${p.ulRect.right} vs ${s.links.at(-1).right}`);
    check(10, !!p && Math.abs(p.firstRowLeft - p.ulRect.left) <= 1 && Math.abs(p.titleLeft - p.firstRowLeft) <= 1, where, p && `${p.ulRect.left} ${p.firstRowLeft} ${p.titleLeft}`);
    // Typography from the demo measurements (catches utilities lost to unlayered resets)
    const titleSize = key === "businesses" ? "18.4px" : "15.68px";
    check(10, !!p && p.headlineMarginTop === "12px" && p.headlineFontSize === "24px" && p.titleFontSize === titleSize, `${where} type`, p && `${p.headlineMarginTop} ${p.headlineFontSize} ${p.titleFontSize}`);
    check(19, await overflow(page), where);
    if (key === "businesses" && (width === 1024 || width === 1280)) {
      // Demo: 3 columns from 1024 (lg:grid-cols-3).
      check(11, p.columns === 3, `${width}`, `${p.columns} columns`);
    }
    if (width >= 1920) {
      check(21, Math.abs(p.wrapRect.left - s.pageWrapRect.left) <= 1 && Math.abs(p.wrapRect.right - s.pageWrapRect.right) <= 1, `${where} panel in .wrap`, `${p.wrapRect.left}-${p.wrapRect.right}`);
    }
  }

  // 6: move off the menu, header reverts to transparent at scrollY 0
  await page.mouse.move(width / 2, 650);
  await page.waitForTimeout(400);
  s = await snapshot(page);
  check(6, s.bg.endsWith(", 0)") || s.bg === "transparent", `${width}`, s.bg);

  // 13: keyboard — Tab to Company, Enter opens, Escape closes and refocuses
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => document.activeElement?.getAttribute("aria-controls") === "mega-company")) break;
  }
  await page.keyboard.press("Enter");
  await page.waitForTimeout(350);
  await shot(page, width, "keyboard");
  const opened = await trigger(page, "company").getAttribute("aria-expanded");
  const panelVisible = await page.locator("#mega-company").isVisible();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  const closed = await trigger(page, "company").getAttribute("aria-expanded");
  const refocused = await page.evaluate(() => document.activeElement?.getAttribute("aria-controls") === "mega-company");
  check(13, opened === "true" && panelVisible && closed === "false" && refocused, `${width}`, `open ${opened}/${panelVisible} closed ${closed} focus ${refocused}`);

  // Scrolled
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(500);
  await page.mouse.move(width / 2, 650);
  await page.waitForTimeout(300);
  s = await snapshot(page);
  await shot(page, width, "scrolled");
  check(7, s.bg === WHITE && s.links.every((l) => l.color === INK) && s.pillBg === s.mistColor, `${width} scrolled`, `${s.bg} pill ${s.pillBg}`);
  check(4, s.barBorder === `1px solid ${s.hairColor}`, `${width} scrolled`, s.barBorder);
  check(19, await overflow(page), `${width} scrolled`);
  await page.context().close();
}

/* ── Mobile walk ── */
async function mobile(browser, width) {
  const page = await openPage(browser, width);
  let s = await snapshot(page);
  await shot(page, width, "top");
  check(5, s.bg.endsWith(", 0)") || s.bg === "transparent", `${width} top`, s.bg);
  check(5, s.menuColor === WHITE, `${width} top menu text`, s.menuColor);
  check(14, s.navVisible !== s.menuVisible, `${width}`, `nav ${s.navVisible} menu ${s.menuVisible}`);
  check(19, await overflow(page), `${width} top`);
  check(22, s.logoShown && Math.abs(s.logoShown.ratio / s.logoShown.natural - 1) <= 0.01, `${width} top`, JSON.stringify(s.logoShown));

  const menuBtn = page.locator(".menu-btn");
  const panelState = () =>
    page.evaluate(() => ({
      panel: !!document.querySelector("#mobile-menu"),
      overflow: document.body.style.overflow,
      focusMenu: document.activeElement === document.querySelector(".menu-btn"),
    }));

  // 15 / 4 / 18 / 16
  await menuBtn.click();
  await page.waitForTimeout(350);
  await shot(page, width, "mobile-open");
  s = await snapshot(page);
  const m = await page.evaluate(() => {
    const panel = document.querySelector("#mobile-menu");
    const btn = document.querySelector(".menu-btn");
    const rows = panel ? [...panel.querySelectorAll("a")] : [];
    const groups = panel ? [...panel.querySelectorAll("nav > div")].map((g) => ({ label: g.querySelector("p").textContent, links: g.querySelectorAll("a").length })) : [];
    return {
      visible: !!panel && panel.getBoundingClientRect().height > 0,
      expanded: btn.getAttribute("aria-expanded"),
      label: btn.innerText.trim(),
      overflow: document.body.style.overflow,
      btn: btn.getBoundingClientRect().toJSON(),
      topFont: panel && getComputedStyle(panel.querySelector("nav > a span")).fontSize,
      subFont: panel && getComputedStyle(panel.querySelector("nav > div a span")).fontSize,
      rows: rows.map((r) => ({ text: r.textContent.replace("→", "").trim(), w: r.getBoundingClientRect().width, h: r.getBoundingClientRect().height })),
      groups,
    };
  });
  check(15, m.visible && m.expanded === "true" && m.label === "CLOSE" && s.bg === WHITE && m.overflow === "hidden", `${width}`, `${m.visible} ${m.expanded} ${m.label} ${s.bg} ${m.overflow}`);
  check(4, s.barBorder === `1px solid ${s.hairColor}`, `${width} mobile-open`, s.barBorder);
  check(18, m.btn.width >= 44 && m.btn.height >= 44, `${width} menu button`, `${m.btn.width}x${m.btn.height}`);
  const small = m.rows.filter((r) => r.w < 44 || r.h < 44);
  check(18, small.length === 0, `${width} rows`, small.map((r) => `${r.text} ${r.h}`).join(", "));
  // Demo has no accordion: Company and Products are listed in full under group labels.
  const company = m.groups.find((g) => g.label.toLowerCase() === "company");
  const products = m.groups.find((g) => g.label.toLowerCase() === "products");
  check(16, company?.links === 5 && products?.links === 4, `${width}`, JSON.stringify(m.groups));
  check(16, m.topFont === "30.4px" && m.subFont === "17.6px", `${width} type`, `${m.topFont} ${m.subFont}`);
  check(19, await overflow(page), `${width} mobile-open`);

  // 17a: Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  let st = await panelState();
  check(17, !st.panel && st.overflow === "" && st.focusMenu, `${width} Escape`, JSON.stringify(st));
  // 17b: click a link
  await menuBtn.click();
  await page.waitForTimeout(300);
  await page.locator("#mobile-menu a", { hasText: "News" }).click();
  await page.waitForTimeout(300);
  st = await panelState();
  check(17, !st.panel && st.overflow === "", `${width} link`, JSON.stringify(st));
  // 17c: resize to desktop
  await page.evaluate(() => window.scrollTo(0, 0));
  await menuBtn.click();
  await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1280, height: HEIGHT });
  await page.waitForTimeout(300);
  st = await panelState();
  check(17, !st.panel && st.overflow === "", `${width} resize`, JSON.stringify(st));
  await page.setViewportSize({ width, height: HEIGHT });
  await page.waitForTimeout(300);

  // Scrolled
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(600);
  s = await snapshot(page);
  await shot(page, width, "scrolled");
  check(7, s.bg === WHITE && s.menuColor === INK && s.pillBg === s.mistColor, `${width} scrolled`, `${s.bg} ${s.menuColor} pill ${s.pillBg}`);
  check(19, await overflow(page), `${width} scrolled`);
  await page.context().close();
}

/* ── Special cases ── */
async function specials(browser) {
  // 12: short laptop
  let page = await openPage(browser, 1280, 720);
  await trigger(page, "businesses").hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "screenshots/after/1280x720-mega-businesses.png" });
  const p = await panelInfo(page);
  check(12, p.rect.bottom <= 720 || p.scrollable, "1280x720", `bottom ${p.rect.bottom}`);
  await page.context().close();

  // 14: exactly one of nav / Menu button either side of the breakpoint
  for (const w of [DESKTOP - 1, DESKTOP]) {
    page = await openPage(browser, w);
    const s = await snapshot(page);
    check(14, s.navVisible !== s.menuVisible && s.navVisible === w >= DESKTOP, `${w}`, `nav ${s.navVisible} menu ${s.menuVisible}`);
    await page.context().close();
  }

  // 23: reduced motion — opacity-only animations
  page = await openPage(browser, 1280, HEIGHT, { reducedMotion: "reduce" });
  await trigger(page, "company").hover();
  await page.waitForTimeout(100);
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector(".mega-panel")).animationName);
  check(23, anim === "fadeIn", "1280 mega", anim);
  await page.context().close();
  page = await openPage(browser, 375, HEIGHT, { reducedMotion: "reduce" });
  await page.locator(".menu-btn").click();
  await page.waitForTimeout(100);
  const anim2 = await page.evaluate(() => getComputedStyle(document.querySelector("#mobile-menu")).animationName);
  check(23, anim2 === "fadeIn", "375 mobile", anim2);
  await page.context().close();
}

/* ── Demo capture + side-by-side ── */
async function demoAndCompare(browser) {
  await mkdir("screenshots/demo", { recursive: true });
  await mkdir("screenshots/compare", { recursive: true });
  const made = [];
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: HEIGHT } });
    const page = await context.newPage();
    await page.goto(DEMO, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2000);
    const save = async (state) => {
      await page.screenshot({ path: `screenshots/demo/${width}-${state}.png`, clip: { x: 0, y: 0, width, height: 700 } });
      made.push([width, state]);
    };
    await save("top");
    if (width >= DESKTOP) {
      for (const key of MEGA) {
        await page.locator("header nav").getByRole("button", { name: new RegExp(`^${key}$`, "i") }).hover();
        await page.waitForTimeout(600);
        await save(`mega-${key}`);
      }
      await page.mouse.move(width / 2, 650);
    } else {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.waitForTimeout(700);
      await save("mobile-open");
      await page.getByRole("button", { name: "Close menu" }).click();
    }
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(900);
    await save("scrolled");
    await context.close();
  }

  // One image per width/state: demo left, ours right.
  const page = await browser.newPage();
  for (const [width, state] of made) {
    const ours = `screenshots/after/${width}-${state}.png`;
    if (!existsSync(ours)) continue;
    const b64 = async (p) => (await readFile(p)).toString("base64");
    const scale = Math.min(1, 1600 / width);
    const w = Math.round(width * scale);
    const h = Math.round(700 * scale);
    await page.setViewportSize({ width: w * 2 + 24, height: h + 40 });
    await page.setContent(`<body style="margin:0;background:#888;font:600 14px system-ui;color:#fff">
      <div style="display:flex;gap:24px">
        <figure style="margin:0"><figcaption style="height:40px;line-height:40px;padding-left:8px">DEMO ${width} ${state}</figcaption><img style="width:${w}px;height:${h}px;display:block" src="data:image/png;base64,${await b64(`screenshots/demo/${width}-${state}.png`)}"></figure>
        <figure style="margin:0"><figcaption style="height:40px;line-height:40px;padding-left:8px">OURS ${width} ${state}</figcaption><img style="width:${w}px;height:${h}px;display:block" src="data:image/png;base64,${await b64(ours)}"></figure>
      </div></body>`);
    await page.screenshot({ path: `screenshots/compare/${width}-${state}.png` });
  }
  await page.close();
  return made.length;
}

/* ── Run ── */
await mkdir("screenshots/after", { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath() });
for (const width of WIDTHS) {
  process.stdout.write(`… ${width}\n`);
  if (width >= DESKTOP) await desktop(browser, width);
  else await mobile(browser, width);
}
await specials(browser);
check(26, consoleErrors.length === 0, "all runs", consoleErrors.slice(0, 5).join(" | "));

let compared = 0;
if (COMPARE) {
  try {
    compared = await demoAndCompare(browser);
  } catch (e) {
    console.log("Demo capture failed:", e.message);
  }
}
await browser.close();

if (!SKIP_BUILD) {
  for (const cmd of ["npx tsc --noEmit -p .", "npm run build"]) {
    try {
      const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      // The only warning allowed is the pre-existing __dirname one in vite.config.ts.
      const warnings = out.split("\n").filter((l) => /warn|\(!\)/i.test(l) && !/configLoader|__dirname|VITE_CONFIG_NATIVE/.test(l));
      check(25, warnings.length === 0, cmd, warnings.join(" | "));
    } catch (e) {
      check(25, false, cmd, (e.stdout || "") + (e.stderr || ""));
    }
  }
}

/* ── Report ── */
const rows = Object.entries(CHECKS).map(([id, name]) => {
  const r = results[id];
  if (id === "24") return [id, name, COMPARE ? "MANUAL" : "SKIPPED", COMPARE ? `${compared} images in screenshots/compare/` : "run with --compare"];
  if (id === "25" && SKIP_BUILD) return [id, name, "SKIPPED", "--skip-build"];
  const status = r.runs === 0 ? "NOT RUN" : r.fails.length ? "FAIL" : "PASS";
  return [id, name, status, r.fails.length ? r.fails.slice(0, 3).join(" ‖ ") : `${r.runs} assertions`];
});
const pad = (s, n) => String(s).padEnd(n);
console.log(`\n${pad("#", 4)}${pad("Check", 32)}${pad("Result", 9)}Detail`);
console.log("-".repeat(100));
for (const [id, name, status, detail] of rows) console.log(`${pad(id, 4)}${pad(name, 32)}${pad(status, 9)}${detail}`);
const failed = rows.filter((r) => r[2] === "FAIL" || r[2] === "NOT RUN");
console.log(`\n${failed.length ? `${failed.length} check(s) failing` : "All automated checks pass"}`);
process.exitCode = failed.length ? 1 : 0;
