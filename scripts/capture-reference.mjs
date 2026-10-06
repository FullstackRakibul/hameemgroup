// Step 0 of the header redesign: screenshot the reference demo and our site
// before changes, and record the demo's computed header styles.
//
//   node scripts/capture-reference.mjs [ourUrl]
//
// Uses the system Edge/Chrome through Playwright (no browser download).
// Set PW_BROWSER to a browser executable to override.
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const DEMO = "https://hameemgroup-demo.reliabuilds.com";
const OURS = process.argv[2] || "http://localhost:5199/";
const WIDTHS = [375, 768, 1024, 1280, 1440, 1920, 2560];
const OUT = "screenshots/before";

function browserPath() {
  const candidates = [
    process.env.PW_BROWSER,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates.find((p) => p && existsSync(p));
}

const navItem = (page, name) =>
  page.locator("header nav").getByRole("button", { name }).or(page.locator("header nav").getByRole("link", { name })).first();

async function settle(page, site) {
  await page.waitForTimeout(site === "ours" ? 3600 : 2500); // ours has a 2.8s preloader
}

async function capture(browser, site, url) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await settle(page, site);
    const shot = (state) => page.screenshot({ path: `${OUT}/${site}-${width}-${state}.png`, clip: { x: 0, y: 0, width, height: 700 } });

    await shot("top");
    const desktop = await navItem(page, /^company$/i).isVisible();
    if (desktop) {
      for (const key of ["company", "businesses", "products"]) {
        await navItem(page, new RegExp(`^${key}$`, "i")).hover();
        await page.waitForTimeout(600);
        await shot(`mega-${key}`);
      }
      await page.mouse.move(width / 2, 600);
      await page.waitForTimeout(500);
    } else {
      const menu = page.getByRole("button", { name: /open menu|^menu$/i }).first();
      if (await menu.isVisible()) {
        await menu.click();
        await page.waitForTimeout(700);
        await shot("mobile-open");
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(700);
    await shot("scrolled");
    await page.close();
  }
}

async function measureDemo(browser) {
  const m = { url: DEMO, measuredAt: new Date().toISOString(), widths: {} };
  for (const width of [...WIDTHS, 1023, 3840]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(DEMO, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2000);
    const header = () =>
      page.evaluate(() => {
        const h = document.querySelector("header");
        const s = getComputedStyle(h);
        const row = h.firstElementChild;
        const nav = h.querySelector("nav");
        const menuBtn = h.querySelector("button[aria-label='Open menu']");
        const logo = h.querySelector("a img");
        return {
          height: row.getBoundingClientRect().height,
          background: s.backgroundColor,
          color: s.color,
          boxShadow: s.boxShadow,
          transform: s.transform,
          rowLeft: row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).paddingLeft),
          navVisible: !!nav && getComputedStyle(nav).display !== "none",
          menuButtonVisible: !!menuBtn && getComputedStyle(menuBtn).display !== "none",
          logo: logo && { w: logo.getBoundingClientRect().width, h: logo.getBoundingClientRect().height, src: logo.currentSrc },
        };
      });
    const w = { top: await header() };

    if (w.top.navVisible) {
      w.nav = await page.evaluate(() => {
        const nav = document.querySelector("header nav");
        const items = [...nav.children];
        const s = getComputedStyle(items[0]);
        const chev = items[0].querySelector("svg");
        return {
          gap: getComputedStyle(nav).columnGap,
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          letterSpacing: s.letterSpacing,
          textTransform: s.textTransform,
          color: s.color,
          chevron: { w: chev.getAttribute("width"), h: chev.getAttribute("height"), strokeWidth: chev.querySelector("path").getAttribute("stroke-width") },
          lastItemRight: items.at(-1).getBoundingClientRect().right,
        };
      });
      for (const key of ["Company", "Businesses", "Products"]) {
        await page.locator("header nav").getByRole("button", { name: key }).hover();
        await page.waitForTimeout(700);
        w[`mega-${key.toLowerCase()}`] = await page.evaluate((key) => {
          const h = document.querySelector("header");
          const btn = [...h.querySelectorAll("nav button")].find((b) => b.textContent.trim() === key);
          const other = [...h.querySelectorAll("nav > *")].find((b) => b !== btn);
          const panel = h.children[1];
          const grid = panel.querySelector(".wrap");
          const intro = grid.children[0];
          const list = grid.children[1];
          const rows = [...list.querySelectorAll("a")];
          const row = rows[0];
          // Company/Products rows nest title + sub in a span and add an arrow;
          // Businesses rows are two bare spans and no arrow.
          const leaves = [...row.querySelectorAll("span")].filter((s) => !s.children.length && !s.hasAttribute("aria-hidden"));
          const [title, sub] = leaves;
          const arrow = row.querySelector("[aria-hidden]");
          const head = intro.children[1];
          const eyebrow = intro.children[0];
          const cs = (el, k) => Object.fromEntries(k.map((p) => [p, getComputedStyle(el)[p]]));
          return {
            header: cs(h, ["backgroundColor", "color", "boxShadow"]),
            headerRowBottom: h.firstElementChild.getBoundingClientRect().bottom,
            activeButton: { ...cs(btn, ["color", "opacity"]), ariaExpanded: btn.getAttribute("aria-expanded"), chevronTransform: getComputedStyle(btn.querySelector("svg")).transform },
            otherItem: cs(other, ["color", "opacity"]),
            panel: { ...cs(panel, ["borderTop", "backgroundColor", "animationName", "animationDuration"]), top: panel.getBoundingClientRect().top, height: panel.getBoundingClientRect().height },
            grid: { ...cs(grid, ["paddingTop", "paddingBottom", "columnGap", "gridTemplateColumns"]), left: grid.getBoundingClientRect().left, right: grid.getBoundingClientRect().right },
            intro: { width: intro.getBoundingClientRect().width },
            eyebrow: { text: eyebrow.textContent, ...cs(eyebrow, ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "textTransform", "color"]) },
            headline: { ...cs(head, ["fontFamily", "fontSize", "fontWeight", "lineHeight", "maxWidth", "marginTop", "letterSpacing"]) },
            list: { ...cs(list, ["columnGap", "gridTemplateColumns"]), columns: new Set(rows.map((r) => Math.round(r.getBoundingClientRect().left))).size },
            row: { ...cs(row, ["paddingTop", "paddingBottom", "paddingLeft", "borderBottom"]), height: row.getBoundingClientRect().height, leftOffsetInColumn: row.getBoundingClientRect().left - list.getBoundingClientRect().left },
            title: cs(title, ["fontFamily", "fontSize", "fontWeight", "lineHeight", "color"]),
            sub: cs(sub, ["fontSize", "color", "marginTop", "lineHeight"]),
            arrow: arrow ? cs(arrow, ["fontSize", "color"]) : null,
          };
        }, key);
      }
      await page.mouse.move(width / 2, 700);
      await page.waitForTimeout(600);
      w.afterClose = (await header()).background;
    } else {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.waitForTimeout(800);
      w["mobile-open"] = await page.evaluate(() => {
        const d = document.querySelector("[role=dialog]");
        const close = d.querySelector("button");
        const rows = [...d.querySelectorAll("nav a")];
        const cs = (el, k) => Object.fromEntries(k.map((p) => [p, getComputedStyle(el)[p]]));
        return {
          layout: "full-screen dialog (fixed inset-0) with its own 88px top row",
          dialog: cs(d, ["backgroundColor", "position", "zIndex"]),
          closeButton: { label: close.textContent.trim(), ariaLabel: close.getAttribute("aria-label"), w: close.getBoundingClientRect().width, h: close.getBoundingClientRect().height },
          structure: [...d.querySelectorAll("nav > a, nav > div > p, nav > p")].map((e) => e.textContent.trim().replace(/→/, "").slice(0, 40)),
          accordion: false,
          topRow: { ...cs(rows[0], ["fontFamily", "fontSize", "paddingTop", "paddingBottom", "borderBottom"]), height: rows[0].getBoundingClientRect().height },
          subRow: { ...cs(rows[4], ["fontFamily", "fontSize", "fontWeight", "paddingTop", "paddingBottom"]), height: rows[4].getBoundingClientRect().height },
          groupLabel: cs(d.querySelector("nav p"), ["fontSize", "color", "letterSpacing", "fontWeight"]),
        };
      });
    }
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(900);
    w.scrolled = await header();
    m.widths[width] = w;
    await page.close();
  }

  // Font families behind the demo's utility classes.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(DEMO, { waitUntil: "networkidle", timeout: 60000 });
  m.fonts = await page.evaluate(() => {
    const ff = (sel) => document.querySelector(sel) && getComputedStyle(document.querySelector(sel)).fontFamily;
    return { brand: ff("header .font-brand"), display: ff(".display"), label: ff(".label"), body: getComputedStyle(document.body).fontFamily };
  });
  m.wordmark = await page.evaluate(() => {
    const [a, b] = document.querySelectorAll("header .font-brand");
    const cs = (el) => ({ fontSize: getComputedStyle(el).fontSize, fontWeight: getComputedStyle(el).fontWeight, letterSpacing: getComputedStyle(el).letterSpacing });
    return { line1: cs(a), line2: cs(b), mark: document.querySelector("header a span").getBoundingClientRect().width };
  });
  await page.close();
  return m;
}

const browser = await chromium.launch({ executablePath: browserPath() });
await mkdir(OUT, { recursive: true });
let demoReachable = true;
try {
  await writeFile("screenshots/demo-measurements.json", JSON.stringify(await measureDemo(browser), null, 2));
  await capture(browser, "demo", DEMO);
} catch (e) {
  demoReachable = false;
  console.error("Demo not reachable:", e.message);
}
await capture(browser, "ours", OURS);
await browser.close();
console.log(demoReachable ? "Captured demo and ours." : "Captured ours only.");
