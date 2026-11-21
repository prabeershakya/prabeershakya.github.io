// @ts-check
import { defineConfig } from "astro/config";

/**
 * Canonical origin for the deployed site.
 *
 * This repo is `prabeershakya.github.io`, so Pages serves it from the domain
 * root — no `base` path is needed. Set the SITE_URL environment variable to
 * override at build time (previews, a custom domain). The value drives
 * <link rel="canonical"> and the Open Graph / Twitter card URLs, so everything
 * that needs an absolute URL derives from this one place.
 */
export const SITE_URL = process.env.SITE_URL || "https://prabeershakya.github.io";

// https://astro.build/config
export default defineConfig({
	site: SITE_URL,
	trailingSlash: "ignore",
});
