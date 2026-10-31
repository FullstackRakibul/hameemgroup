# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

Corner radius is square-ish and editorial (hairlines, stitched seams, Fira Sans Condensed). Use only 0, 2px or 4px:

- Cards, photos, panels, tiles, sheets, video frames, tooltips: `rounded-sm` (4px). An inner element in a rounded parent gets the same radius or none.
- Small chips, badges, tags, inputs, pagination pills, eyebrow ribbon body, and text CTA buttons and filter pills: `rounded-xs` (2px).
- Full-bleed images and section backgrounds: no radius.
- `rounded-full` only for genuinely circular things: dots, round icon buttons (slider prev/next/play, back-to-top, close), the round logo, the 360° badge, orbit rings, the chat launcher.
- Never `rounded-md` or larger. Cards use a plain 1px border (`var(--hair)` on light, `white/15` on dark), not gradient borders or large soft shadows; shadows are only for floating UI (mega sheet, dialogs, chat panel).

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Styling: Tailwind first

- Style in JSX with Tailwind v4 utilities, including arbitrary values (`[clip-path:…]`, `drop-shadow-[…]`, `bg-[radial-gradient(…)]`) and variants (`hover:`, `group-hover:`, `data-[open]:`, `motion-reduce:`, `[@media(hover:none)]:`).
- Use `src/index.css` only for what Tailwind can't express cleanly: design tokens (`:root` and `@theme`), `@keyframes`, base resets, third-party hooks (Lenis), and selectors on `::before`/`::after` or across components that utilities can't reach. Don't add per-component classes there when utilities can do the job.
- No inline `<style>` blocks. `style={}` only for runtime values (CSS variables, measured sizes, values driven by GSAP or JS).
- When you touch a component that still uses custom CSS classes, move what you can to utilities and delete the dead rules from `index.css`.
- Respect prefers-reduced-motion with `motion-reduce:` variants.

## Icons

- Use `lucide-react` for all UI icons (arrows, chevrons, play/pause, close, menu, external link, check, etc.). Don't hand-write SVG paths or use text glyphs like ← → ▶ for UI icons.
- Import named icons only: `import { ChevronRight } from "lucide-react"`.
- Defaults: `size={18}`, `strokeWidth={1.75}`, `aria-hidden="true"`. The button carries the `aria-label`. Colour comes from `currentColor`, so set it with Tailwind text classes.
- Decorative brand graphics (stitches, selvedge lines, logos, illustrations) stay as custom SVG.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
