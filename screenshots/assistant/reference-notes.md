# Ayesha · Ha-Meem Assist: reference notes

## Reference images

`design/ai-assistant/launcher.png`, `chat-panel.png` and `welcome.png` were **not in the repository** when this was built, so nothing could be measured from them. Every value below is the brief's Part 2 fallback, checked against the rendered build at 1440×900 with `getComputedStyle` and `getBoundingClientRect`. When the references are added, run `node scripts/eval-assistant.mjs` to build `screenshots/assistant/compare/`, then re-measure.

## Launcher (desktop card)

| Property | Value used |
|---|---|
| Card | 340 px wide, 24 px padding, 24 px radius, 1 px `--hair`, shadow `0 12px 40px rgba(17,20,24,.12)` |
| Position | `right: 24px; bottom: 24px + safe-area` |
| Avatar | 56 px circle, `--ink` → `--red` diagonal gradient, white "H" (Fira Sans Condensed) |
| Title | "Need help?", Fira Sans Condensed 700, 24 px / 1.1, `--ink` |
| Subtitle | Fira Sans 14 px / 1.45, `--mute`, two lines ("Ayesha · Ha-Meem Assist ·" / "AI + human team") |
| Expand button | 18 px icon, `--mute`, **44×44** hit area (brief: 40×40) |
| Ask anything | 52 px tall pill, `--red`, Fira Sans Condensed 600 18 px, 20 px chat icon |
| Call | 52 px red circle, 20 px phone icon |

## Launcher (phones, under 640 px)

56 px tall white pill at `right: 16px; bottom: 16px + safe-area`, with a 40 px avatar, "Ask Ayesha" (Fira Sans Condensed 600, 16 px) and a 44 px red call circle.

## Panel header

| Property | Value used |
|---|---|
| Panel | 400 × min(680, 100dvh − 48), 20 px radius, 1 px `--hair`, shadow `0 24px 64px rgba(17,20,24,.18)`, z-index 1100 |
| Header | 76 px min-height, padding 12 px 12 px 12 px 16 px, 1 px `--hair` bottom border |
| Avatar | 48 px circle |
| Name | "Ayesha", Fira Sans Condensed 700, 22 px |
| Meta | 8 px `--assist-online` dot + "Ha-Meem Assist · #HM-6821 · online", **12 px** `--mute` (brief: 13 px) |
| Buttons | 44 px call (1 px `--hair` ring) and 44 px close |

## Messages

| Property | Value used |
|---|---|
| Assistant label | "AYESHA", 11 px, 600, letter-spacing .12em, `--mute`; 14 px speaker icon in a 44×44 button |
| Assistant text | Fira Sans 16 px / 1.6, `--ink`, 12 px between paragraphs |
| Links | `--red`, 15 px 600, underlined, 44 px tall rows |
| User bubble | `--mist`, 16 px radius, 12 px 16 px padding, max 80% wide |
| Spacing | 20 px between messages, 24 px list padding |
| Typing | three 6 px `--mute` dots bouncing 0.15 s apart |

## Composer

| Property | Value used |
|---|---|
| Container | `--mist`, 16 px radius, min-height 56 px (60 px rendered with the 44 px buttons), padding 8 px 6 px, 16 px from the panel edges |
| Mic | 44 px button, `--mute` |
| Textarea | Fira Sans 16 px / 24 px, 1 to 4 lines |
| Send | 40 px circle inside a 44 px button; `--red` with a white arrow when enabled, transparent with a `--mute` arrow when disabled |
| Footer | shield icon + 12 px `--mute` text, 10 px vertical padding |

## Welcome chips

44 px tall, 14 px horizontal padding, 12 px radius, 1 px `--hair`, white; 18 px `--red` icon; Fira Sans Condensed 600 15 px `--ink`; 10 px gap. Hover: `--ink` border, `--mist` background. Follow-up chips are 36 px tall, with a 44 px hit area from an `::after` overlay.

## Departures from Part 2, and why

- **Expand button is 44×44 (not 40×40), and the send button is a 44 px target round a 40 px circle**, so every control meets the 44×44 rule (checklist row 21).
- **Header meta is 12 px, not 13 px.** At 13 px, "Ha-Meem Assist · #HM-6821 · online" needs 222 px; a 400 px panel with two 44 px buttons leaves 214 px. At 12 px it stays on one line. Below 380 px wide it is allowed to wrap.
- **The composer's focus ring wraps the whole composer**, not the bare textarea. It is still a 2 px `--red` outline.
- **On tablets (640–899 px) the panel uses 16 px offsets; from 900 px it uses 24 px.** The brief puts the 16 px offset on everything below 1024 px, but the site's stitch scrollbar becomes visible at 900 px and a 16 px panel offset would overlap it.
