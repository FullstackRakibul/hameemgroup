# Ha-Meem Group website: project guide

Theme, code conventions, architecture, implementation details, status and plan for
the Ha-Meem Group corporate website. Snapshot of branch `alpha/production` at commit
`1f5811c` ("header update"), 31 Oct 2026.

---

## 1. Overview

| | |
|---|---|
| **What** | Corporate website for Ha-Meem Group, a vertically integrated apparel manufacturer in Bangladesh (est. 1984) |
| **Stack** | React 19, React Router 7, Vite 8, TypeScript 5.7, Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Runtime libraries** | `gsap` (preloader, motion paths), `lenis` (smooth scroll), `lucide-react` (UI icons) |
| **Tooling** | `oxfmt` (formatting), Playwright (local visual checks) |
| **Origin** | Scaffolded in Figma Make (see `AGENTS.md`). Deployed on Vercel. |
| **Working branch** | `alpha/production` |

### Commands

```bash
npm install
npm run dev       # Vite dev server (--host)
npm run build     # production build: run before every push
npm run preview   # serve the build locally
npm run format    # oxfmt
```

---

## 2. Project structure

```
src/
  main.tsx                 React entry, imports index.css
  App.tsx                  Router + Shell: preloader, header, page, footer,
                           smooth scroll, stitch scrollbar, back-to-top, AI assistant
  Preloader.tsx            GSAP wordmark draw + curtain (once per session)
  SiteHeader.tsx           Fixed header, mega sheet, mobile menu
  WorldRoutes.tsx          Export-routes world map
  index.css                Tokens, @theme, keyframes, cross-component CSS
  lib/scroll.ts            The single Lenis instance + scrollToTarget()
  components/
    Eyebrow.tsx            Animated "scroll ribbon" pre-title (plain variant too)
    SectionHeader.tsx      Eyebrow + h2 + intro, used across pages
    AwardSlider.tsx        Curved 3D award slider (home Recognition)
    PeopleSection.tsx      People accordion + sticky photo (home)
    FoundedOrbit.tsx       "Founded in 1984" orbit badge
    GarmentBackdrop.tsx    Site-wide floating garment icons (md+)
    GarmentIcons.tsx       Line-art garment SVG icons
    CountUp.tsx            Count-up number on view
    SmoothScroll.tsx       Creates/destroys Lenis, pauses it on scroll lock
    useInViewOnce.ts       IntersectionObserver hook (fires once)
    useReveal.ts           data-reveal / data-reveal-stagger scroll reveals
    Productcarousel .tsx   3D product coverflow (note: space in filename)
    …                      BuyerGrid, StatGrid, FactList, Gallery, PageHero,
                           PersonCard, UnitCard, Section, SmartLink, SiteFooter
  data/
    facts.ts               All figures and copy: F, stats, awards, people programmes
    navigation.ts          Mega menus, PLAIN_LINKS, footer columns
    gallery.ts             GALLERY items, categories, VR_TOURS, film
    buyers.ts, units.ts
  pages/                   HomePage, AboutPage, GalleryPage, ContactPage,
                           business pages (Woven, DenimMill, Laundry, Sweater,
                           DesignStudio, Embroidery, Ancillary), Merchandising,
                           Customers, NotFound
  features/ai-assistant/   Chat launcher + panel (own CSS file)
public/media/              All images (~36 MB on the branch, see §10)
```

### Routes

`/`, `/about`, `/merchandising`, `/customers`, `/contact`, `/gallery`,
`/businesses/{woven|denim-mill|laundry|sweater|design-studio|embroidery-printing-accessories|ancillary}`, `*` → NotFound.

### Home page sections (top to bottom)

Hero slider → Founded in 1984 → Where we are (world routes) → Our buyers →
Products (3D carousel) → Vertical integration (steps accordion) → Businesses →
Recognition & awards → Sustainability → People → Newsroom → Careers CTA.

---

## 3. Theme

### 3.1 Colour tokens (`src/index.css`, `:root`)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#5C2E23` | Main text and headings (warm brown). Earlier values `#111418` and `#5D2E24` are commented out. |
| `--navy` | `#1b3243` | Primary accent: eyebrows, stitches, active states, logo fill, buttons |
| `--red` | `#9b002b` | Secondary accent (headline highlights, a few legacy spots) |
| `--mist` | `#f6f6f4` | Light section background |
| `--mute` | `#61646a` | Secondary text |
| `--hair` | `#d9d9d6` | Hairlines, borders, dividers |

Per-topic accents are used only for small signals on the Sustainability cards:
solar `#f5a524`, water `#4fb3d9`, power `#f2c94c`, fibre `#6fbf73`.

Use them in Tailwind as `text-(--navy)`, `bg-(--mist)`, `border-(--hair)` and so on.

### 3.2 Typography

- **Headings:** `Fira Sans Condensed` (400–700, black via synthesis), usually
  `font-['Fira_Sans_Condensed'] font-black`.
- **Body:** `Fira Sans`. Both load from Google Fonts at the top of `index.css`.
- **Labels / nav / eyebrows:** uppercase, 11–12px, `tracking-[0.12em]`, semibold.
- **Type scale tokens** (Tailwind utilities): `text-hero`, `text-h2`, `text-statement`,
  `text-lead`, `text-card`, `text-intro`, `text-body`. Each steps up at 768px and
  1024px.

| Token | Phone | ≥768px | ≥1024px |
|---|---|---|---|
| `--fs-hero` | clamp(44px, 11vw, 56px) | clamp(56px, 8vw, 72px) | clamp(72px, 7vw, 98px) |
| `--fs-h2` | 36px | 46px | 56px |
| `--fs-statement` | 44px | 58px | 68px |
| `--fs-lead` | 26px | 34px | 42px |
| `--fs-intro` / `--fs-body` | 16 / 15px | 17 / 16px | 17 / 16px |

### 3.3 Spacing (compact pass)

Use them as utilities: `section-y`, `mt-section-head`, `gap-head-eyebrow`,
`mt-head-intro`, `gap-grid`, `mt-cta`, `px-gutter`. Don't hard-code large paddings.

| Token | Phone | ≥768px | ≥1024px |
|---|---|---|---|
| `--section-y` | 56px | 72px | 88px |
| `--section-head` | 28px | 36px | 44px |
| `--head-intro` | 16px | 18px | 18px |
| `--cta-gap` | 24px | 28px | 28px |
| `--header-h` | 88px on the branch (planned: 64px phone / 72px desktop) | | |

Layout width: `.wrap` = `min(1232px, 100% - 64px)` (40px gutter under 900px).

### 3.4 Corner radius (agreed rule)

- Cards, photos, panels, tiles, video frames: `rounded-sm` (4px).
- Chips, badges, tags, inputs, text buttons: `rounded-xs` (2px).
- Full-bleed images and sections: no radius.
- `rounded-full` only for real circles: dots, icon-only buttons, the round logo,
  the 360° badge, orbit rings and the chat launcher.
- **Status:** not applied yet. `rounded-[20–28px]` and `rounded-xl/2xl` still exist in
  AwardSlider, PeopleSection, GalleryPage and HomePage (see §9).

### 3.5 Brand motifs (keep these, they are the identity)

- **Stitched seam:** a dashed SVG rect that "sews" round a tile on hover, using an
  SVG mask whose `stroke-dashoffset` animates 1 → 0. It's always drawn on touch
  screens.
- **Selvedge:** a red line plus a dashed stitch at the top edge of a section (denim
  selvedge).
- **Dashed nav stitch:** a 2px repeating-gradient seam under nav items and
  mega-menu rows (`.nav-text::after`, `.row-stitch`), plus a sliding
  `.nav-indicator`.
- **Eyebrow scroll ribbon:** pre-titles on a small parchment ribbon with curled
  ends that unrolls once in view (`Eyebrow.tsx`).
- **Garment icons:** low-opacity line-art garment icons (needle, spool, scissors,
  button, hanger, iron, sewing machine) floating at the page edges.
- **Avoid the "AI template" look:** no gradient borders, no big soft shadows on
  cards, no oversized radius.

### 3.6 Motion principles

- Easing: `--ease-out: cubic-bezier(0.22, 0.61, 0.36, 1)`, plus
  `cubic-bezier(.22,1,.36,1)` and `cubic-bezier(.32,.72,0,1)` for sheets.
- Animate only `transform`, `opacity`, `clip-path` and `stroke-dashoffset`.
  Animate `grid-template-rows` for accordions and `flex-grow` for expanding rows.
- Every animation has a `prefers-reduced-motion` fallback (content shown, no
  travel).
- No animation libraries beyond GSAP (preloader) and Lenis (scroll).

---

## 4. Code conventions

From `AGENTS.md`, plus the rules agreed during this work.

1. **Tailwind first.** Style in JSX with Tailwind v4 utilities, including arbitrary
   values and variants (`data-[open]:`, `group-hover:`, `motion-reduce:`,
   `[@media(hover:none)]:`).
   - `index.css` is only for tokens, `@theme`, `@keyframes`, base resets,
     third-party hooks (Lenis) and pseudo-element or cross-component selectors.
   - No inline `<style>`. Use `style={}` only for runtime values (CSS variables,
     measured sizes, GSAP).
   - *(This rule still needs adding to `AGENTS.md`; it's part of the pending
     preloader prompt.)*
2. **Icons:** `lucide-react` for every UI icon, with `size={18} strokeWidth={1.75}
   aria-hidden="true"`. Brand graphics (stitches, logo, illustrations) stay custom
   SVG.
3. **Strings:** use double quotes for any string with an apostrophe (`"Kohl's"`).
4. **Components:** default exports. Close every JSX tag.
5. **Data:** figures and copy live in `src/data/*.ts`, never hard-coded in a
   component. Adding a gallery image or tour is one line.
6. **Images:** WebP/JPG, about 800–1600px wide, with explicit `width`/`height`,
   `loading="lazy"` and `decoding="async"`. No GIFs (use MP4 loops). Don't send
   images through Git LFS (§10).
7. **Accessibility:** buttons carry `aria-label`. Accordions use `aria-expanded`,
   `aria-controls` and `role="region"`. Closed panels are `inert`. Keep 44px touch
   targets.
8. **Before pushing:** run `npm run build` and check at 375, 768 and 1440px.

---

## 5. Core building blocks (code)

### 5.1 Scroll reveal

```tsx
<div data-reveal>…</div>                       {/* fades up once in view */}
<ul data-reveal-stagger>{items.map(…)}</ul>    {/* children 60ms apart, max 360ms */}
```

`useReveal(pathname, enabled)` in `App.tsx` marks off-screen blocks
`data-reveal="hidden"` and then `"shown"`. Blocks already in view on load are
`"static"` and never animate. That's why the Eyebrow uses its own
`useInViewOnce`.

### 5.2 Animate once in view

```tsx
const [ref, inView] = useInViewOnce<HTMLDivElement>(0.6);
<div ref={ref} data-play={inView || undefined} className="…data-[play]:opacity-100" />
```

### 5.3 Smooth scrolling

```ts
import { scrollToTarget, getLenis } from "../lib/scroll";
scrollToTarget(document.getElementById("film")!);        // eased, clears the header
scrollToTarget(0, { immediate: true });                   // instant jump
```

- `SmoothScroll.tsx` creates Lenis (`lerp 0.1`, touch stays native), skips it under
  reduced motion, and stops it while the body scroll is locked (mobile menu,
  dialogs).
- Inner scroll areas need `data-lenis-prevent`.
- Don't use `scroll-behavior: smooth` or `scrollIntoView({behavior:"smooth"})`;
  always go through `scrollToTarget`.

### 5.4 Stitched seam (hover)

```tsx
<svg aria-hidden className="pointer-events-none absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] overflow-visible">
  <defs>
    <mask id={`stitch-${i}`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="200%" height="200%">
      <rect width="100%" height="100%" pathLength={1} fill="none" stroke="white" strokeWidth="6"
        className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-500
                   group-hover:[stroke-dashoffset:0] [@media(hover:none)]:[stroke-dashoffset:0]
                   motion-reduce:transition-none" />
    </mask>
  </defs>
  <rect width="100%" height="100%" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.4"
        strokeWidth="1.5" strokeDasharray="8 6" mask={`url(#stitch-${i})`} />
</svg>
```

### 5.5 Accordion height without measuring

```tsx
<div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 data-[open]:grid-rows-[1fr]" data-open={open || undefined}>
  <div className="min-h-0 overflow-hidden" inert={!open || undefined}>…</div>
</div>
```

Used by the People cards, the Sustainability card details and the mega menu content.

### 5.6 Eyebrow

```tsx
<Eyebrow>RECOGNITION & AWARDS</Eyebrow>          // animated ribbon
<Eyebrow plain>LINKS OPEN THE ORIGINAL REPORT</Eyebrow>
<Eyebrow className="text-white!">SUSTAINABILITY</Eyebrow>   // on dark sections
```

The text is split into letter spans (`aria-hidden`); the full text sits in
`aria-label`.

---

## 6. Section implementation details

### Header (`SiteHeader.tsx`)

- Fixed. It's transparent with white text over the hero, and turns solid white
  (`.is-solid`) after 50px of scroll or when a menu opens.
- **Mega sheet:** always mounted on lg. A `ResizeObserver` writes `--mega-h`, and
  height transitions animate open, close and menu-to-menu morphs. Content slides
  in the direction of travel (`--dir`). Hover intent: 90ms to open, 180ms grace to
  close.
- `.nav-indicator` is a dashed line that slides between triggers. `.mega-scrim`
  dims the page behind.
- **Mobile:** a clip-path sheet reveals under the bar, stays mounted for its exit
  animation, and the burger morphs into an X. It has a focus trap, Escape and a
  scroll lock (which also pauses Lenis).
- **Pending:**
  - shorter header (64/72px) with a formal "HA-MEEM GROUP" lockup (no year)
  - align the plain links (`Sustainability`, `Gallery`, `Contact`, `Careers`)
    with the mega triggers. They sit higher because `SmartLink` doesn't get the
    same flex centring.

### Preloader (`Preloader.tsx` + `App.tsx`)

- Plays once per session (`sessionStorage["hm-preloader-seen"]`).
- `LOGO_D` is split into letter groups (counters merged by bbox containment).
  Outlines draw while a dot follows a guide curve, letters fill navy, then a
  clip-path curtain lifts.
- `onDone` waits for `document.fonts.ready`, with a safety timeout.
- **Pending:**
  - `fillRule="evenodd"` so the **O** shows its hole
  - a Catmull-Rom guide curve with no jolts
  - a longer fill crossfade (about 3.1s total)
  - Tailwind classes instead of inline styles; remove `.preloader-dot` from
    `index.css`
  - safety timeout 5500ms

### Founded in 1984 (HomePage)

- Mist background with a dot grid and floating garment icons.
- `FoundedOrbit` badge: dashed rings and four icon chips orbiting (CSS
  `orbitSpin` with counter-rotation).
- Statement with "Ha-Meem Group" highlighted and a stitched underline. Stats sit in
  a hairline grid with the stitched seam.

### Recognition & awards (`AwardSlider.tsx`, data `AWARD_TIMELINE`)

- 11 awards, oldest first (2009 → 2023). Starts on 2017 (Kohl's Greatness Award).
- Curved 3D wall. One rAF loop eases `pos → target` (factor 0.085) and writes
  transforms directly, so React doesn't re-render per frame. The active card is
  sharp; neighbours shrink and blur by class (filter isn't animated per frame).
- Input: drag/swipe, horizontal wheel only, arrows, Home/End, dots and prev/next.
- Autoplay every 4.5s, paused on hover, focus, drag, off-screen and hidden tab,
  with a play/pause button.
- Awards without a photo show a fallback card: lucide `Award` icon, issuer logo
  and year.

### Sustainability (HomePage, data `SUSTAINABILITY_STATS` + `ECO_LOOK`)

- Background photo with dark overlays. Heading: "Cleaner water." in blue gradient
  text, "Cleaner power." in amber, "Measured." outlined.
- Four glass cards (solar 29.1 MW, water 63%, co-generation 80%, fibre 1,560 MT a
  day). On lg the hovered or focused card widens (`flex-grow`) and reveals its
  detail and points. Details are always open on touch screens.
- Topic photo at low opacity, accent glow, slowly moving watermark icon.
- **Pending:** the topic loops are **GIFs totalling ~19 MB**, to be converted to MP4
  (~400 KB each) and played only on screen.

### People (`PeopleSection.tsx`, data `PEOPLE_PROGRAMS`)

- Heading counts up to `75,000+ people.`
- Five accordion cards, one open at a time:
  - Schools: M. A. Aziz High, M. A. Aziz Primary, Nurul Islam High, Refat Kowmi
    Madrasa
  - Scholarships
  - Dreams Beyond the Factory Floor (Asian University for Women)
  - Careers & universities
  - Environment: LED/solar, ETP, organic materials, tree plantation
- An open card turns dark (ink). On lg a sticky photo panel crossfades to the open
  card's image; on mobile the image sits inside the open card.
- Placeholder images: `biz/gate.jpg`, `people-knit.jpg`, `chain-sewing.jpg`,
  `cine/sewing.jpg`, `sustain-campus.jpg`.

### Gallery page (`GalleryPage.tsx`, data `gallery.ts`)

- **Intro:** centred "Inside Ha-Meem." with scattered floating photos on lg (a
  2×2 grid on mobile).
- **Category marquee:** big words with tilted thumbnails.
- **Bento photo wall:** a repeating wide + narrow, then 3-equal grid, with filters.
- **360° tours** (`VR_TOURS`): Tongi, Textile, That's It Knit, Humana. Each opens
  `https://360vr.hameemgroup.com/<id>/` in a new tab, with hover pan, a redrawing
  360° badge and click press/spin/ripple feedback.
- **Film:** the RFID video loads only when you press play.
- **Lightbox:** native `<dialog>` with keys and swipe.

### Global extras

- `GarmentBackdrop` (fixed, md+, about 5–7% opacity, multiply).
- Stitch scrollbar (right edge), back-to-top, AI assistant (lazy after the
  preloader).

---

## 7. Data reference (`src/data/facts.ts`)

- `F`: every figure, for example `employeesText "75,000+"`, `solar "29.1 MW"`,
  `waterRecycling "63%"`, `powerCogeneration "80%"`, `fiberRecyclingDay "1,560 MT"`,
  `established "1984"`.
- `VIRTUAL_TOUR_URL` = `https://hameemgroup.net/360vr.html`
- `GROUP_STATS`, `SUSTAINABILITY_STATS` (`Stat` with optional `detail` and `points`)
- `BUYER_AWARDS`, `NATIONAL_AWARDS`, `AWARD_TIMELINE` (photo awards plus the
  awards without photos, sorted)
- `CERTIFICATIONS`, `PEOPLE_PROGRAMS`, `FOUNDERS`, `HEAD_OFFICE`, `EMAIL`
- `navigation.ts`: `PLAIN_LINKS` (Sustainability, Gallery, Contact, Careers →
  jobs.hameemgroup.com), mega menus and footer.
- `gallery.ts`: `GALLERY`, `GALLERY_CATEGORIES`, `GALLERY_VIDEO`, `VR_TOURS`.

---

## 8. Media and performance

- **Location:** everything lives in `public/media/`, served as `/media/...`. Data
  paths are relative to it (`"gallery/campus"`, never `"media/…"` or a leading
  slash).
- **Gallery images:** two WebP sizes, `-800.webp` and `-1600.webp`, used through
  `srcSet`.
- **Heavy files to fix:**
  - `sustain/*.gif`: about 19 MB (`water.gif` alone is 9.4 MB). Convert to MP4.
  - `biz/gate.jpg`: about 1 MB. Recompress to about 200 KB.
  - Low-resolution sources (`tongi-zone-360`, `textile-zone-360` at 435px wide)
    look soft on desktop cards. Replace them with ~1600px versions.
- **Hero banner video:** planned. Cut 10–20s, H.264 + WebM, `-an`, `+faststart`,
  about 3–8 MB, with a poster image. Host it on a CDN rather than in Git.

```bash
ffmpeg -i water.gif -movflags +faststart -pix_fmt yuv420p \
  -vf "scale=640:-2:flags=lanczos,fps=20" -c:v libx264 -crf 30 -an water.mp4
```

---

## 9. Implementation status

| Area | Status |
|---|---|
| Round logo → formal lockup | Lockup in progress; old round-logo commit `09c9ddc` is superseded |
| Lucide icons + AGENTS.md icon rule | Done |
| Founded in 1984 redesign + orbit + garment icons | Done |
| Awards: curved slider, 2017 start, autoplay, fallback cards, SEO heading | Done |
| Awards UI polish (white background, no shadows, inverted curve, blur) | Done (verify) |
| Gallery page, nav item, bento, marquee, lightbox, film | Done |
| 360° VR tours section | Done |
| Git LFS fix for WebP (`.gitattributes` line commented out) | Done |
| Sustainability heading + glass cards + expand | Done |
| Eyebrow scroll-ribbon system | Done |
| People accordion + sticky photo + compact spacing tokens | Done |
| Smooth scroll (Lenis) + `scrollToTarget` | Done (section snap and dots not on branch) |
| Header mega sheet morph + mobile sheet + burger | Done |
| Preloader smooth + **O fix** + Tailwind-first rule | **Prompt ready, not applied** |
| Header height 64/72 + formal lockup + **menu alignment** | **Partly local, alignment fix pending** |
| Border-radius pass (2–4px) + de-"AI" cards | **Prompt ready, not applied** |
| Sustainability GIF → MP4 | **Pending** |
| Hero banner video | **Planned** |

---

## 10. Known issues and decisions

1. **Git LFS:** `.gitattributes` still routes `*.mp4` and other binaries through
   LFS. Vercel serves LFS pointers as broken files (the earlier 500 errors). Keep
   `*.webp`/`*.gif`/`*.jpg`/`*.png`/`*.mp4` out of LFS for anything under
   `public/`.
2. **Unpushed local commit `09c9ddc`** (round logo) exists only in a Claude cloud
   session that has no write access. It's superseded by the header lockup, so
   don't apply it.
3. **`--header-h`:** the branch says 88px, while the plan (and the local
   `index.css`) says 64px phone / 72px desktop. Settle on one value in `:root`;
   five TSX files read it.
4. **Copy to verify with the client:**
   - solar figure: the tile says 29.1 MW; a news item says 12.2 MWp
   - Sustainability detail text (drafted)
   - school names and spellings
   - People programme copy
5. **Placeholder images** in People and some Gallery titles were guessed from
   filenames. Edit them in `data/*.ts`.
6. **Filename with a space:** `src/components/Productcarousel .tsx`. It's left as
   is because it's imported that way; rename it carefully if needed.
7. **Two scroll systems:** with Lenis active, never add `scroll-behavior: smooth`
   back to `html`.

---

## 11. Plan (next steps, in order)

1. Apply the **preloader** prompt: evenodd "O", smooth curve, Tailwind-only, and
   the AGENTS.md "Tailwind first" rule.
2. Fix the **header**: align plain links with the mega triggers, keep the lockup
   to the company name only, and set `--header-h` to 64/72.
3. Run the **radius pass**: everything to 2–4px, no gradient borders or large card
   shadows, then a `grep` check.
4. **Media diet:** GIFs to MP4, recompress `gate.jpg`, replace the 435px 360°
   images.
5. **Hero video banner:** compressed loop with a poster, on a CDN.
6. **Copy review** with Ha-Meem (figures, names, sustainability claims).
7. **QA pass:**
   - 375 / 768 / 1440px
   - reduced motion
   - keyboard navigation (menus, sliders, accordions, lightbox)
   - Lighthouse: performance, LCP image and total page weight
8. Consider route-level code splitting: the build warns about chunk size.
