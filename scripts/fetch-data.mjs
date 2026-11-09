#!/usr/bin/env node
/**
 * Fetch fresh data for the build into src/data/*.generated.json.
 *
 *   npm run fetch:data            (runs automatically before `astro build`)
 *   SKIP_FETCH=1 npm run build    (offline; the committed snapshots are used)
 *   GITHUB_TOKEN=... npm run build (raises the GitHub ceiling from 60/hr)
 *
 * Two sources:
 *
 * 1. GitHub public repos for the profile user -> projects.generated.json.
 * 2. CTFtime team pages -> ctftime.generated.json. CTFtime's REST API has no
 *    per-event results endpoint (`/api/v1/teams/<id>/results/` is a 404), so
 *    placements only exist in the team page HTML. That makes this the fragile
 *    link, which is why every step is all-or-nothing: on any failure the
 *    previous output is kept and the build falls back to the curated list in
 *    `src/data/teams.ts` rather than shipping a blank panel.
 *
 * Both generated files are committed, so a fresh clone builds offline and the
 * fetch only refreshes them when it fully succeeds.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "src", "data");

const GITHUB_USER = "prabeershakya";
const TEAMS = [
	{ id: 447690, key: "visored" },
	{ id: 368467, key: "blue-lock-eleven" },
];

const UA = "pixel-theme-fetch (personal portfolio build script)";
const log = (msg) => console.log(`[fetch] ${msg}`);
const warn = (msg) => console.warn(`[fetch] ${msg}`);

if (process.env.SKIP_FETCH === "1") {
	log("SKIP_FETCH=1 — using the committed snapshots.");
	process.exit(0);
}

/* ------------------------------ GitHub repos ------------------------------ */

async function fetchRepos() {
	const res = await fetch(
		`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`,
		{
			headers: {
				Accept: "application/vnd.github+json",
				...(process.env.GITHUB_TOKEN
					? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
					: {}),
			},
			signal: AbortSignal.timeout(8000),
		},
	);
	if (res.status === 403 || res.status === 429) {
		throw new Error(
			"GitHub rate limit hit (403). Set GITHUB_TOKEN to raise the limit from 60 to 5000/hr.",
		);
	}
	if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

	const data = await res.json();
	const list = Array.isArray(data) ? data : [];
	return list
		.filter((r) => !r.fork)
		.slice(0, 5)
		.map((r) => ({
			name: r.name,
			desc: r.description ?? "a work in progress.",
			url: r.html_url,
			lang: r.language ?? "code",
			tags: Array.isArray(r.topics) ? r.topics.slice(0, 2) : [],
			stars: r.stargazers_count ?? 0,
			forks: r.forks_count ?? 0,
		}));
}

/* ------------------------------- CTFtime ---------------------------------- */

/** Strips tags and collapses whitespace. */
const text = (html) =>
	(html ?? "")
		.replace(/<[^>]+>/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&nbsp;/g, " ")
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/\s+/g, " ")
		.trim();

/** Pulls the results table out of one `rating_<year>` tab pane. */
function parsePane(paneHtml, year) {
	const rows = paneHtml.match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
	const results = [];

	for (const row of rows) {
		const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1]));
		if (cells.length < 4) continue;

		const link = row.match(/<a[^>]*href="\/event\/(\d+)"[^>]*>([\s\S]*?)<\/a>/);
		if (!link) continue;

		const [, eventId, eventHtml] = link;
		const event = text(eventHtml);
		if (!event) continue;

		// Anchor on the event cell: rows are 4 or 5 cells wide depending on the
		// weight badge, so counting from the end lands on the wrong column.
		const eventIdx = cells.indexOf(event);
		if (eventIdx < 1) continue;

		const place = Number.parseInt(cells[eventIdx - 1], 10);
		if (!Number.isFinite(place) || place < 1) continue;

		const points = Number.parseFloat(cells[eventIdx + 1] ?? "");
		const rating = Number.parseFloat(cells[eventIdx + 2] ?? "");

		results.push({
			event,
			place,
			year,
			url: `https://ctftime.org/event/${eventId}/`,
			...(Number.isFinite(points) ? { points } : {}),
			...(Number.isFinite(rating) ? { rating } : {}),
		});
	}

	return results;
}

function parseTeamPage(html) {
	const title = text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(
		/^CTFtime\.org\s*\/\s*/,
		"",
	);

	const starts = [...html.matchAll(/id="rating_(\d{4})"/g)];
	const results = [];

	for (const [i, match] of starts.entries()) {
		const from = match.index + match[0].length;
		const nextPane = starts[i + 1]?.index ?? html.length;
		const footer = html.indexOf("<footer", from);
		const to = footer === -1 ? nextPane : Math.min(nextPane, footer);
		results.push(...parsePane(html.slice(from, to), Number(match[1])));
	}

	return { title: title || null, results };
}

async function fetchTeam(id) {
	const res = await fetch(`https://ctftime.org/team/${id}/`, {
		headers: { "User-Agent": UA, Accept: "text/html" },
		redirect: "follow",
		signal: AbortSignal.timeout(20000),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return parseTeamPage(await res.text());
}

/* -------------------------------- main ------------------------------------ */

let failed = 0;

try {
	const repos = await fetchRepos();
	if (repos.length < 2) throw new Error(`only ${repos.length} usable repo(s)`);
	mkdirSync(DATA, { recursive: true });
	writeFileSync(join(DATA, "projects.generated.json"), `${JSON.stringify(repos, null, "\t")}\n`);
	log(`github: wrote ${repos.length} repos -> src/data/projects.generated.json`);
} catch (err) {
	failed++;
	warn(`github fetch failed (${err.message}) — keeping the committed snapshot.`);
}

let ctftimeOk = true;
const out = {};
for (const team of TEAMS) {
	try {
		const { title, results } = await fetchTeam(team.id);
		// A parser that silently returns nothing is the dangerous failure: it
		// would overwrite good data with an empty list. Treat "fetched the page
		// but found no rows" as a failure and keep the existing file.
		if (results.length === 0) {
			warn(
				`ctftime: team ${team.id} returned no rows — markup probably changed, keeping snapshot.`,
			);
			ctftimeOk = false;
			break;
		}
		const best = results.reduce((a, b) => (b.place < a.place ? b : a));
		out[team.key] = {
			id: team.id,
			name: title,
			url: `https://ctftime.org/team/${team.id}/`,
			results,
		};
		log(`ctftime: ${team.key} — ${results.length} results, best #${best.place} (${best.event})`);
	} catch (err) {
		warn(`ctftime: team ${team.id} failed (${err.message}) — keeping the committed snapshot.`);
		ctftimeOk = false;
		break;
	}
	// Politeness gap. CTFtime is a volunteer-run site and this is unauthenticated.
	await new Promise((r) => setTimeout(r, 1200));
}

if (ctftimeOk && Object.keys(out).length > 0) {
	writeFileSync(join(DATA, "ctftime.generated.json"), `${JSON.stringify(out, null, "\t")}\n`);
	log("ctftime: wrote src/data/ctftime.generated.json");
} else {
	failed++;
}

// A failed fetch is not a failed build — the snapshots carry the build. Report
// the staleness so it is visible rather than silently implying freshness.
process.exit(0);
