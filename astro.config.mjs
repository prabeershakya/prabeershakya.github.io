// @ts-check
import { defineConfig } from "astro/config";

/**
 * Canonical origin for the deployed site.
 *
 * Set the SITE_URL environment variable to override at build time. The
 * fallback is a placeholder — change it here (or via SITE_URL) when the site
 * has a real home. The value drives <link rel="canonical"> and the Open Graph
 * / Twitter card URLs, so everything that needs an absolute URL derives from
 * this one place.
 */
export const SITE_URL = process.env.SITE_URL || "https://example.com";

// https://astro.build/config
export default defineConfig({
	site: SITE_URL,
	trailingSlash: "ignore",
});
