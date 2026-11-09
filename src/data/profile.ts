/**
 * Single source of truth for the profile links shown across the site.
 *
 * These were previously copy-pasted into Achievements, Contact and the JSON-LD
 * block in Base.astro, which is how they drifted apart in the first place.
 */
export const profile = {
	name: "Prabeer Man Shakya",
	email: "iamprabeershakya@gmail.com",
	github: "https://github.com/prabeershakya",
	linkedin: "https://www.linkedin.com/in/prabeer-shakya-7704962bb/",

	// The trailing period is intentional and part of the profile address.
	tryhackme: "https://tryhackme.com/p/PrabeerShakya.",

	hackthebox: "https://app.hackthebox.com/users/2178420",
	visored: "https://www.linkedin.com/company/team-visored",
} as const;

/** Compact handle used for the visible link text. */
export const handles = {
	github: "prabeershakya",
	linkedin: "prabeer-shakya",
	tryhackme: "PrabeerShakya",
} as const;
