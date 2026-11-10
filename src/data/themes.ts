/**
 * The six palettes of the theme switcher, in cycle order.
 *
 * `chrome` mirrors the palette's `--t-chrome` so the browser UI (address bar)
 * can be kept in step from the inline script in `Base.astro`, which cannot
 * import this module — it must stay dependency-free to run before first paint.
 */
export const themes = [
	{ id: "tokyo-night", label: "Tokyo Night", chrome: "#1a1b26", accent: "#9ece6a" },
	{ id: "gruvbox", label: "Gruvbox", chrome: "#282828", accent: "#fabd2f" },
	{ id: "catppuccin-mocha", label: "Catppuccin Mocha", chrome: "#1e1e2e", accent: "#a6e3a1" },
	{ id: "nord", label: "Nord", chrome: "#2e3440", accent: "#88c0d0" },
	{ id: "hackerman", label: "Hackerman", chrome: "#0a0f0a", accent: "#33ff66" },
	{ id: "catppuccin-latte", label: "Catppuccin Latte", chrome: "#eff1f5", accent: "#40a02b" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const DEFAULT_THEME: ThemeId = "tokyo-night";

export const isThemeId = (value: string): value is ThemeId => themes.some((t) => t.id === value);
