/**
 * CTF results grouped by team. The Achievements panel switches between these
 * with a tab strip, one tab per team.
 *
 * Two sources, merged:
 *
 * 1. `ctftime.generated.json`, written by `npm run fetch:ctftime`, which
 *    scrapes the public CTFtime team pages (no auth). This is the live source:
 *    real finishing positions, CTF points and rating points, current as of the
 *    last fetch. It wins for any event it knows about.
 * 2. The `CURATED` list below. Kept because CTFtime does not carry everything —
 *    notably Pentester Nepal 2026, where the team reported 2nd place itself and
 *    CTFtime has no record of it. Those entries carry a permalink to the
 *    announcement they came from.
 *
 * When the generated file is absent (fresh clone, or the fetch failed), the
 * curated list is used alone and the site still builds. `ctftimeFetched` lets
 * the panel say which it is showing rather than silently implying freshness.
 *
 * CTFtime's REST API is reachable without a key but has no results endpoint —
 * `/api/v1/teams/<id>/results/` is a 404 — so per-event placements exist only
 * in the team page HTML. That makes the scraper the fragile link in this chain,
 * which is why it is all-or-nothing and falls back rather than writing an empty
 * list over good data.
 *
 * Every entry is a real result. `place` is the finishing position; `scale` is
 * the field size where the source stated one.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface TeamResult {
	/** Event name as published. */
	event: string;
	/** Finishing position, 1-indexed. */
	place: number;
	/** Field size, e.g. "of 284 teams". Omitted where the source gave none. */
	scale?: string;
	/** CTF points earned, as shown by the source. */
	points?: string;
	/** Deep link to the result. Falls back to the team's page. */
	url?: string;
}

export interface Team {
	id: string;
	name: string;
	/** Short label for the tab strip. */
	short: string;
	/** One-line standing shown under the team name. */
	standing: string;
	/** Team page / announcement feed. */
	url: string;
	/**
	 * Curated to the strongest results that fit the panel. The footer links to
	 * the full record on CTFtime, so nothing is hidden by the trim.
	 */
	results: TeamResult[];
	/** How many events the team has entered in total, for the "+N more" line. */
	totalEvents: number;
}

const CURATED: Team[] = [
	{
		id: "visored",
		name: "Team Visored",
		short: "Visored",
		standing: "Pentester Nepal 2026 · 2nd place",
		url: "https://ctftime.org/team/447690/",
		totalEvents: 8,
		/*
			Five of these are the team's CTFtime record (team 447690), which only
			lists 2026 events — it has no 2025 tab, so Trinity CTF 2025 does not
			appear there. Pentester Nepal and PwnSec are absent from CTFtime
			entirely and come from the team's own announcements. CTFtime shows
			no accumulated rating for this team, so there is no global rank to
			quote the way Blue Lock Eleven has one.

			Roster on CTFtime: MonsterDuckky, Spydomain (Bikash Sarraf),
			hellospyder, Skai, ItsPratyh.
		*/
		results: [
			{
				event: "Pentester Nepal CTF 2026",
				place: 2,
				scale: "of 100+ teams",
				// No `points`. Neither announcement published a points figure, and
				// the previous `points: "—"` rendered as a literal em dash trailing
				// the field size — "of 100+ teams —" — which read as a broken
				// separator rather than as an absent value. Omitting the key lets
				// the tile show the field size alone, which is what there is.
				url: "https://www.linkedin.com/posts/softwarica-college-of-it-and-e-commerce_softwaricacollege-cybersecurity-ctf-activity-7496089139826798593-1Ece",
			},
			{
				event: "Trinity CTF 2025",
				place: 11,
				// CTFtime does not list this event for the team and no points were
				// ever published, so this tile carries the placement alone. Same
				// reasoning as above.
			},
			{
				event: "CSAW CTF Qualifiers 2026",
				place: 63,
				points: "5,179",
				url: "https://ctftime.org/event/3355/",
			},
			{
				event: "D-CTF 2026 Quals",
				place: 71,
				points: "704",
				url: "https://ctftime.org/event/3392/",
			},
			{
				event: "K17 CTF 2026",
				place: 76,
				points: "3,722",
				url: "https://ctftime.org/event/3145/",
			},
			{
				event: "PwnSec CTF 2026",
				place: 95,
				scale: "of 284 teams",
				points: "55 flags",
				url: "https://www.linkedin.com/posts/team-visored_teamvisored-pwnsecctf2026-pwnsec-activity-7508731856175931392-HS2Z",
			},
			{
				event: "07CTF 2026",
				place: 110,
				points: "200",
				url: "https://ctftime.org/event/3365/",
			},
			{
				event: "NullOrigin CTF Qualifiers",
				place: 229,
				points: "1,710",
				url: "https://ctftime.org/event/3346/",
			},
		],
	},
	{
		id: "blue-lock-eleven",
		name: "Blue Lock Eleven",
		short: "Blue Lock",
		standing: "#216 worldwide 2026 · #3 in Nepal",
		url: "https://ctftime.org/team/368467/",
		totalEvents: 94,
		results: [
			{
				event: "RIFFHACK: Black Market Break-In",
				place: 11,
				points: "5,850",
			},
			{
				event: "UTCTF 2026",
				place: 39,
				points: "6,580",
			},
			{
				event: "boroCTF 2026",
				place: 46,
				points: "14,100",
			},
			{
				event: "Eschaton CTF 2026 Quals",
				place: 55,
				points: "1,930",
			},
			{
				event: "0xL4ugh CTF v5",
				place: 62,
				points: "810",
			},
			{
				event: "Midnight Flag CTF — EXECUTION",
				place: 69,
				points: "2,378",
			},
			{
				event: "Lexington Informatics Tournament 2026",
				place: 79,
				points: "3,881",
			},
			{
				event: "ApoorvCTF 2026",
				place: 83,
				points: "3,119",
			},
			{
				event: "BYUCTF 2026",
				place: 94,
				points: "4,865",
			},
			{
				event: "EHAX CTF 2026",
				place: 104,
				points: "2,272",
			},
			{
				event: "LA CTF 2026",
				place: 133,
				scale: "#1 in Nepal",
				points: "3,171",
			},
			{
				event: "OmniCTF 2026 Quals",
				place: 135,
				points: "641",
			},
		],
	},
];

interface FetchedResult {
	event: string;
	place: number;
	year: number;
	url: string;
	points?: number;
	rating?: number;
}

interface FetchedTeam {
	id: number;
	name: string | null;
	url: string;
	results: FetchedResult[];
}

type FetchedTeams = Record<string, FetchedTeam>;

/**
 * Resolves the generated file by walking up to the nearest `package.json`.
 *
 * Not `import.meta.url`: Vite relocates this module into
 * `dist/.prerender/chunks/` during the build, so that pointed at the build
 * output and the file was never found — the fetch succeeded, the read looked
 * elsewhere, and the site silently served curated data claiming to be live.
 */
function projectRoot(): string {
	let dir = process.cwd();
	for (;;) {
		if (existsSync(join(dir, "package.json"))) return dir;
		const parent = dirname(dir);
		if (parent === dir) return process.cwd();
		dir = parent;
	}
}

const GENERATED = join(projectRoot(), "src", "data", "ctftime.generated.json");

/**
 * Words that are noise for the purpose of matching one event written two ways.
 *
 * `finals` is deliberately absent. CTFtime lists ASIS CTF Quals 2025
 * (`/event/2612/`) and ASIS CTF Finals 2025 (`/event/2613/`) as two separate
 * events, so collapsing "finals" would merge two real results into one and
 * lose a placing. Quals and finals are not synonyms here, however similar they
 * sound.
 */
const EVENT_NOISE = /^(?:ctf|quals?|qualifiers?|qualifications?|rounds?)$/;

/**
 * Reduces an event name to a comparison key.
 *
 * Two spellings of the same event have to collapse to one key, and the panel
 * shows one tile per event — so a failed match is a visible duplicate row.
 *
 * Matching is word-based, deleting whole noise words, rather than substring
 * deletion on the squashed name. Substring deletion got "CSAW CTF
 * Qualification Round 2026" and "CSAW CTF Qualifiers 2026" wrong: the
 * alternation consumed `qualifier` but left the plural "s", giving `csaws2026`
 * against `csaw2026`. The two never matched, the curated entry survived the
 * merge, and the panel rendered the same competition twice at #63. Splitting on
 * non-alphanumerics first means `qualifiers` is removed whole.
 *
 * A loose match is acceptable *because* of how it is used: it only decides
 * whether a curated entry is already covered by a fetched one, and the fetched
 * record is the one that wins. The worst a wrong match can do is swap a
 * hand-typed entry for fresher data on a similarly-named event — it can never
 * invent a result that no source reported.
 */
const normaliseEvent = (name: string) =>
	name
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((word) => word.length > 0 && !EVENT_NOISE.test(word))
		.join("");

/** Whether a build used freshly fetched CTFtime data. */
export const ctftimeFetched: boolean = existsSync(GENERATED);

function loadFetched(): FetchedTeams | null {
	if (!existsSync(GENERATED)) return null;
	try {
		const parsed: unknown = JSON.parse(readFileSync(GENERATED, "utf8"));
		if (typeof parsed !== "object" || parsed === null) return null;
		return parsed as FetchedTeams;
	} catch {
		// Malformed JSON: curated only, rather than a failed build.
		return null;
	}
}

/**
 * Merges fetched results into the curated teams.
 *
 * For each team the fetched results are authoritative; curated entries are
 * added only when CTFtime has no record of that event. `totalEvents` becomes
 * whichever is larger, and the standing line is refreshed from CTFtime's name
 * when it differs from the curated spelling.
 */
function merge(fetched: FetchedTeams | null): Team[] {
	if (!fetched) return CURATED;

	return CURATED.map((team) => {
		const live = fetched[team.id];
		if (!live || !Array.isArray(live.results) || live.results.length === 0) return team;

		const liveKeys = new Set(live.results.map((r) => normaliseEvent(r.event)));

		const results: TeamResult[] = [
			...live.results
				.map((r) => ({
					event: r.event,
					place: r.place,
					// `points` is the panel's existing field; CTFtime's own
					// "CTF points" column, not the rating delta.
					...(r.points !== undefined ? { points: String(r.points) } : {}),
					url: r.url,
				}))
				.sort((a, b) => a.place - b.place),
			// Curated-only: events CTFtime has no record of.
			...team.results.filter((r) => !liveKeys.has(normaliseEvent(r.event))),
		];

		return {
			...team,
			name: live.name ?? team.name,
			url: live.url ?? team.url,
			results,
			totalEvents: Math.max(team.totalEvents, results.length),
		};
	});
}

export const teams: Team[] = merge(loadFetched());

/** Ordinal suffix for a finishing position, e.g. 1 -> "1st". */
export const ordinal = (n: number): string => {
	const rem100 = n % 100;
	if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
	switch (n % 10) {
		case 1:
			return `${n}st`;
		case 2:
			return `${n}nd`;
		case 3:
			return `${n}rd`;
		default:
			return `${n}th`;
	}
};

/** Compact badge text for a placement, e.g. "2nd" or "#133". */
export const placeLabel = (n: number): string => (n <= 3 ? ordinal(n) : `#${n}`);
