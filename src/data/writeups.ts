/**
 * Writeups and research, shown in the Writeups panel.
 *
 * Two possible sources, in priority order:
 *
 * 1. `writeups.generated.json` — written by `npm run fetch:writeups`, which
 *    reads a private GitHub repo. That file is gitignored, so on a machine
 *    where the fetch has never run it simply does not exist.
 * 2. The `PLACEHOLDER` list below — what ships when there is no generated
 *    file. Delete it once you have real entries.
 *
 * The read happens at build time with `node:fs` rather than a static `import`.
 * That is deliberate: an `import` of a missing file is a hard build error,
 * and the whole point of gitignoring the generated file is that it is usually
 * absent. `existsSync` makes its absence a normal branch instead.
 *
 * The fetch script is `scripts/fetch-writeups.mjs`; it needs no build changes.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Writeup {
	/** Headline. Keep it specific — the reader skims these. */
	title: string;
	/** Where it was published, or what kind of thing it is. */
	source: string;
	/** Short summary of the finding or the idea. One or two sentences. */
	summary: string;
	/** Classes of issue or technique covered, e.g. "SQLi", "race condition". */
	tags: string[];
	/** Year, or a short date. Shown in the tile header. */
	date: string;
	/** Drives the tile fill. See `Severity`. */
	severity: Severity;
	/** Public link, when there is one. Omitted renders static, not a dead link. */
	url?: string;
}

/**
 * Shipped when nothing has been fetched. These are placeholders with realistic
 * shapes, not real claims — replace them or delete the array.
 */
const PLACEHOLDER: Writeup[] = [
	{
		title: "Prototype pollution to RCE in a Node CI runner",
		source: "Private disclosure",
		summary:
			"Merge keys in a build script let a fork overwrite the runner's own config, which executed on the next PR.",
		tags: ["prototype pollution", "CI/CD", "node"],
		date: "2026",
		severity: "critical",
	},
	{
		title: "IDOR across a multi-tenant GraphQL API",
		source: "Coordinated disclosure",
		summary:
			"Every resolver trusted a tenant ID from the request body, so enumeration returned another customer's invoices and PII.",
		tags: ["IDOR", "GraphQL", "access control"],
		date: "2026",
		severity: "high",
	},
	{
		title: "Race condition in a double-spend voucher flow",
		source: "Bug bounty",
		summary: "Two concurrent checkouts both read the same unused voucher before either spent it.",
		tags: ["race condition", "business logic"],
		date: "2025",
		severity: "medium",
	},
	{
		title: "What 'sanitised' actually means: five XSS filters, measured",
		source: "Personal research",
		summary:
			"Five widely-copied DOM XSS filters, one payload corpus, and the bypass that still beats each.",
		tags: ["XSS", "research"],
		date: "2025",
		severity: "info",
	},
	{
		title: "Exfiltrating JWTs through a permissive CSP",
		source: "Lab write-up",
		summary:
			"A wildcard host plus unsafe-eval was treated as a defence. It gives up the wall it was meant to build.",
		tags: ["CSP", "JWT", "misconfiguration"],
		date: "2025",
		severity: "low",
	},
	{
		title: "Burp extension for triaging GraphQL batching",
		source: "Open source tool",
		summary:
			"Splits a batched query into per-alias requests so each field can be tested on its own.",
		tags: ["tooling", "Burp", "GraphQL"],
		date: "2024",
		severity: "info",
	},
];

/**
 * Locates the generated file by walking up from the working directory to the
 * nearest `package.json`.
 *
 * Deliberately NOT `import.meta.url`. That looks like the obvious way to
 * resolve a sibling file and it silently produces the wrong path here: Vite
 * relocates this module into `dist/.prerender/chunks/`, so `import.meta.url`
 * resolved to `<build output>/chunks/writeups.generated.json` — a path that
 * never exists. The fetch wrote the real file, the read looked somewhere else,
 * and the build quietly fell back to the placeholders with no warning.
 *
 * The working directory is the reliable anchor: `npm run build` runs from the
 * project root, and walking up to `package.json` covers being invoked from a
 * subdirectory.
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

const GENERATED = join(projectRoot(), "src", "data", "writeups.generated.json");

/** Which source the current build used, for the panel's status chip. */
export const writeupSource: "fetched" | "placeholder" = existsSync(GENERATED)
	? "fetched"
	: "placeholder";

const VALID = new Set<Writeup["severity"]>(["critical", "high", "medium", "low", "info"]);

/**
 * Coerces one parsed entry into a `Writeup`.
 *
 * The file is external input, so nothing is trusted: a missing `tags` becomes
 * an empty array rather than crashing the build, and an unrecognised severity
 * falls back to `info` instead of landing as an undefined tile colour.
 */
function coerce(value: unknown): Writeup | null {
	if (typeof value !== "object" || value === null) return null;
	const raw = value as Record<string, unknown>;

	const title = typeof raw.title === "string" ? raw.title.trim() : "";
	// A tile with no title is not a writeup; drop it rather than render blank.
	if (!title) return null;

	const severity = String(raw.severity ?? "").toLowerCase() as Writeup["severity"];

	return {
		title,
		source: typeof raw.source === "string" ? raw.source : "",
		summary: typeof raw.summary === "string" ? raw.summary : "",
		tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : [],
		date: typeof raw.date === "string" ? raw.date : "",
		severity: VALID.has(severity) ? severity : "info",
		...(typeof raw.url === "string" && raw.url ? { url: raw.url } : {}),
	};
}

function load(): Writeup[] {
	if (!existsSync(GENERATED)) return PLACEHOLDER;

	try {
		const parsed: unknown = JSON.parse(readFileSync(GENERATED, "utf8"));
		if (!Array.isArray(parsed)) return PLACEHOLDER;
		const entries = parsed.map(coerce).filter((w): w is Writeup => w !== null);
		// An empty generated file means the fetch cleared the list. Fall back
		// rather than rendering an empty panel with a heading above it.
		return entries.length ? entries : PLACEHOLDER;
	} catch {
		// Malformed JSON: placeholders rather than a failed build.
		return PLACEHOLDER;
	}
}

export const writeups: Writeup[] = load();
