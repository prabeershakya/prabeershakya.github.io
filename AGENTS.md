# AGENTS.md

Context for every session working on this repo. Read this first.

## What this is

Personal portfolio for **Prabeer Man Shakya** — cyber security learner and CTF
competitor. Static, single page, built with [Astro](https://astro.build).

Design language: **omarchy.org** — dark terminal-elegant, Geist + JetBrains
Mono, 0px radius, hairline `0 0 0 1px` elevation (never offset shadows), one
brand accent, mono smallcaps labels, procedural pixel-art scenes rendered as
SVG. A palette switcher (nav dropdown + `T` key) re-skins the whole site via
`--t-*` tokens.

Content and data are shared with the sibling project `../Web` (the
neo-brutalist variant of the same portfolio). Keep the two in sync when
profile facts change.

## Commands

```sh
npm install        # install dependencies
npm run dev        # dev server at localhost:4321
npm run build      # fetch:data + astro build  → ./dist/
npm run build:offline   # SKIP_FETCH=1 — build from committed snapshots
npm run verify     # format:check + astro check + offline build. Run before committing.
npm run fetch:data # refresh GitHub repos + CTFtime results into src/data/*.generated.json
```

`npm run build` fetches fresh data first by design — the user wants the site
current on every build. A failed fetch is NOT a failed build: the script warns
and the committed snapshots carry it. `GITHUB_TOKEN` (optional) raises the
GitHub ceiling from 60 to 5000 req/hr. `SKIP_FETCH=1` skips fetching entirely.

## Layout

```text
src/
├── components/
│   ├── sections/        one .astro file per page section
│   ├── Nav.astro        sticky status bar + theme picker + mobile menu
│   ├── Footer.astro
│   ├── Marquee.astro    skills ticker under the hero
│   ├── Bubbles.astro    ambient pixel bubbles rising in the hero background
│   ├── PongGame.astro   playable pixel pong easter egg — unlocked by the Konami code
│   ├── TerminalArt.astro  animated hero terminal: types commands, prints, loops
│   ├── MarkDraw.astro   omarchy's marker stroke that draws itself under a word
│   ├── Icon.astro       inline brand icons (mail, github, linkedin, htb, thm)
│   └── PixelArt.astro   pixel-art renderer: string map + palette → crisp SVG
├── lib/
│   └── pixel-font.ts    3x5 pixel font shared by SSR frames and client scripts
├── data/
│   ├── profile.ts       every profile/social link, single source of truth
│   ├── teams.ts         CTF results; merges CURATED with ctftime.generated.json
│   ├── writeups.ts      writeup entries; reads writeups.generated.json if present
│   ├── projects.ts      repo list; reads projects.generated.json if present
│   ├── themes.ts        the six palettes + chrome colours for the theme picker
│   ├── skills.ts        ticker entries
│   └── *.generated.json committed snapshots written by scripts/fetch-data.mjs
├── layouts/Base.astro   <head>, meta, JSON-LD, inline theme-restore script
├── pages/index.astro    composes the sections in order
└── styles/global.css    design tokens (six palettes) + shared primitives
```

## Conventions

**Theme = one attribute.** Every colour is a `--t-*` token in
`src/styles/global.css`, resolved by `[data-theme="<id>"]` on `<html>`.
Components use the resolved aliases (`--bg`, `--surface`, `--brand`, …), never
`--t-*` directly. Adding a palette means one `:root[data-theme=…]` block, an
entry in `src/data/themes.ts`, and the id in the inline script in `Base.astro`
(kept dependency-free on purpose, so its palette list is duplicated there —
update both together).

**Theme restore is inline and blocking** in `Base.astro`'s `<head>`. It must
run before first paint to avoid a wrong-palette flash. Do not move it into a
bundled script.

**Pixel art** is code, not images: draw a string map, pass a palette whose
values may be `var(--…)` tokens so the art re-tints with the theme. `c` cells
blink. User-supplied PNGs can replace scenes later — keep scenes in their own
constants so the swap is one component.

**The animated terminal** (`TerminalArt.astro`) draws text with the shared
3x5 font in `src/lib/pixel-font.ts`. The frontmatter renders the static first
frame (so no-JS and reduced-motion users see full art); the bundled script
only takes over the typing cycle when motion is allowed. The sequence is
declared in BOTH the frontmatter and the script — the frontmatter throws the
build if a glyph is missing, so a bad character fails loudly, but keep the two
`SEQUENCE` arrays identical. `COLS`/`ROWS`/`PAD` are duplicated the same way.

**Icons** render in `currentColor` via `Icon.astro` (`mail`, `github`,
`linkedin`, `hackthebox`, `tryhackme`); hover colour comes from the parent
link, never set on the icon.

**Motion**: every animation gates on `prefers-reduced-motion` — typing, the
mark-draw stroke, the ticker, reveal. Nothing may park content at opacity 0
when motion is reduced or JS is off.

**The background bubbles** (`Bubbles.astro`) are the hero's default ambient
layer: hollow pixel-circle bubbles (precomputed ring masks) rising with a sine
wobble, popping into a sparkle at the surface. ~20% wear the brand colour.
The wobble is `sin(t * freq)` with `t` in SECONDS — the one time milliseconds
were passed here, the field vibrated at ~70 Hz like a shaken soda.

**Hero readability over animation**: the hero's two content columns
(`.hero-left`, `.hero-right`) sit on frosted panels — 90% `color-mix` of
`--surface` plus `backdrop-filter: blur(8px)` — with the house hairline
elevation. Any new hero decoration must keep those panels between it and the
text.

**The background pong** (`PongGame.astro`) is an easter egg, locked until the
Konami code (↑↑↓↓←→←→ B A) sets `data-pong="on"` on `<html>` — then it plays
over the bubbles (which stand down via the same attribute) until the code is
entered again. Plain canvas at ~4 CSS px per game pixel, upscaled with
`image-rendering: pixelated`; no physics or rendering libraries. Colours are
re-read from the theme tokens whenever `data-theme` changes. Gameplay: AI
paddle right, reader's paddle left — mouse/touch anywhere on the hero, or
W/S/arrow keys while the hero is hovered (the hover gate is what keeps arrow
keys scrolling the page elsewhere). The loop stops via IntersectionObserver +
`visibilitychange` when the hero is off-screen or the tab hidden, and never
starts under reduced motion. The Konami detector never calls preventDefault
and ignores editable targets. The canvas is `pointer-events: none`; pointer
tracking lives on the hero section.

**Hairlines, not shadows.** Depth is `var(--elevation)` (a 1px outline); hover
steps to `--elevation-hover` plus a 2px lift. No offset shadows, no blur
glows, radius is 0 everywhere.

**Fonts**: Geist Variable (display/UI) and JetBrains Mono Variable (labels,
data, code), self-hosted via Fontsource, imported once in `Base.astro`. The
mono voice is for metadata: `.sec-label`, `.chip`, `.tag`, stats, statuses.

**Shared primitives** (`.card`, `.chip`, `.tag`, `.btn`, `.sec-label`,
`.section`, `.reveal`) live in `src/styles/global.css`. Add variants there
instead of restating rules in a section's scoped style.

**Scroll reveal** is opt-in via `.reveal`; the observer in `Base.astro` adds
`.is-visible` once. Everything is forced visible under reduced motion and
`.no-js`, so no element is ever parked at opacity 0.

**Never style a child component from its parent** — Astro scopes styles per
component, so a parent's rule never matches a child's root. Cross-component
behaviour is props, not selectors.

**Generated JSON is committed on purpose**: fresh clones and offline machines
must build. The fetch scripts only overwrite a file when the whole fetch
succeeds — a partial or empty result never clobbers good data. If CTFtime's
markup changes, parsing returns nothing, the script keeps the old file, and
`teams.ts` falls back to its curated list with a "curated" badge instead of
"live from ctftime".

## Known context

- `../Web` holds the original (neo-brutalist) site; `profile.ts`, `teams.ts`
  and `writeups.ts` were copied from there and their data model kept
  identical so content edits port both ways.
- CTFtime has no results API; per-event placements are scraped from the team
  page HTML (`scripts/fetch-data.mjs`). It is the fragile link — see the
  comments in that script before touching the parser.
- No deploy config yet (no Docker, no CI). Output is `dist/`. When a deploy
  target exists, set `SITE_URL` (env var or `astro.config.mjs`) — it drives
  canonical + OG URLs.
