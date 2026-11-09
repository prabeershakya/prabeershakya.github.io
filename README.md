# Pixel-theme

Personal portfolio for **Prabeer Man Shakya** — cyber security learner and CTF
competitor. Static, single page, built with [Astro](https://astro.build).

Design language borrowed from [omarchy.org](https://omarchy.org): dark
terminal-elegant surfaces, hairline elevation, Geist + JetBrains Mono,
procedural pixel art, and a palette switcher (nav dropdown or press `T`) that
re-skins the whole site — Tokyo Night, Gruvbox, Catppuccin Mocha, Nord,
Hackerman, Catppuccin Latte.

## Commands

| Command                 | Action                                                        |
| :---------------------- | :------------------------------------------------------------ |
| `npm install`           | Install dependencies                                          |
| `npm run dev`           | Dev server at `localhost:4321`                                |
| `npm run build`         | Fetch fresh data, then build to `./dist/`                     |
| `npm run build:offline` | Build from the committed data snapshots                       |
| `npm run preview`       | Serve the built site locally                                  |
| `npm run check`         | `astro check` — types and Astro diagnostics                   |
| `npm run format`        | Format with Prettier                                          |
| `npm run verify`        | Format check + type check + offline build. Before committing. |
| `npm run fetch:data`    | Refresh GitHub repos + CTFtime results                        |

`GITHUB_TOKEN` is optional; it raises the GitHub API ceiling from 60 to 5000
requests/hour.

## Content

Profile, socials, CTF results, certifications and writeups live in
`src/data/`. `scripts/fetch-data.mjs` refreshes GitHub repos and CTFtime team
results at build time; the generated JSON files are committed, so the build
never depends on the network.

The sibling repo `../Web` is the same portfolio in a neo-brutalist theme;
profile data files are kept identical between the two.

See `AGENTS.md` for the full design system and conventions.
