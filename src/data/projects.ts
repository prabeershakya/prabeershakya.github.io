/**
 * GitHub repos for the Projects section.
 *
 * One source, two paths:
 *
 * 1. `projects.generated.json` — written by `npm run fetch:data`, which runs
 *    automatically before every `astro build`. Fresh on every build; the file
 *    is committed, so a fresh clone or an offline machine also builds.
 * 2. The `FALLBACK` list below — only when the generated file is missing or
 *    malformed. The build never fails for lack of data.
 *
 * The read happens at build time with `node:fs` rather than a static `import`:
 * an `import` of a missing file is a hard build error, while `existsSync`
 * makes its absence a normal branch.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface Repo {
	/** Repo name as shown on GitHub. */
	name: string;
	/** One-line description. GitHub leaves this empty sometimes. */
	desc: string;
	/** Absolute repo URL. */
	url: string;
	/** Primary language, or "code" when GitHub could not detect one. */
	lang: string;
	/** Up to two GitHub topics. */
	tags: string[];
	stars: number;
	forks: number;
}

const FALLBACK: Repo[] = [
	{
		name: "Lupin",
		desc: "Simple username OSINT tool.",
		url: "https://github.com/prabeershakya/Lupin",
		lang: "Python",
		tags: ["osint", "recon"],
		stars: 0,
		forks: 0,
	},
	{
		name: "Wallpapers",
		desc: "Collection of wallpapers.",
		url: "https://github.com/prabeershakya/Wallpapers",
		lang: "CSS",
		tags: ["misc"],
		stars: 0,
		forks: 0,
	},
	{
		name: "CVE-2023-0179-POC",
		desc: "Proof of concept for CVE-2023-0179.",
		url: "https://github.com/prabeershakya/CVE-2023-0179-POC-",
		lang: "C",
		tags: ["poc", "kernel"],
		stars: 0,
		forks: 0,
	},
	{
		name: "CVE-2022-0185-POC",
		desc: "Proof of concept for CVE-2022-0185.",
		url: "https://github.com/prabeershakya/CVE-2022-0185-POC",
		lang: "C",
		tags: ["poc"],
		stars: 0,
		forks: 0,
	},
];

/**
 * Locates the generated file by walking up to the nearest `package.json`.
 *
 * Deliberately NOT `import.meta.url`: Vite relocates this module into
 * `dist/.prerender/chunks/` during the build, so that pointed at the build
 * output and the file was never found. The working directory is the reliable
 * anchor — `npm run build` runs from the project root, and walking up to
 * `package.json` also covers being invoked from a subdirectory.
 */
function projectRoot(): string {
	let dir = process.cwd();
	for (;;) {
		if (existsSync(join(dir, "package.json"))) return dir;
		const parent = dirname(dir);
		// Reached the filesystem root without finding a manifest.
		if (parent === dir) return process.cwd();
		dir = parent;
	}
}

const GENERATED = join(projectRoot(), "src", "data", "projects.generated.json");

/** Which source the current build used, for the section's status line. */
export const reposSource: "fetched" | "fallback" = existsSync(GENERATED) ? "fetched" : "fallback";

/** Coerces one parsed entry into a `Repo`; drops anything unusable. */
function coerce(value: unknown): Repo | null {
	if (typeof value !== "object" || value === null) return null;
	const raw = value as Record<string, unknown>;
	if (typeof raw.name !== "string" || !raw.name) return null;
	if (typeof raw.url !== "string" || !raw.url) return null;

	return {
		name: raw.name,
		desc: typeof raw.desc === "string" ? raw.desc : "",
		url: raw.url,
		lang: typeof raw.lang === "string" ? raw.lang : "code",
		tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : [],
		stars: typeof raw.stars === "number" ? raw.stars : 0,
		forks: typeof raw.forks === "number" ? raw.forks : 0,
	};
}

function load(): Repo[] {
	if (!existsSync(GENERATED)) return FALLBACK;
	try {
		const parsed: unknown = JSON.parse(readFileSync(GENERATED, "utf8"));
		if (!Array.isArray(parsed)) return FALLBACK;
		const entries = parsed.map(coerce).filter((r): r is Repo => r !== null);
		return entries.length >= 2 ? entries : FALLBACK;
	} catch {
		return FALLBACK;
	}
}

export const repos: Repo[] = load();
