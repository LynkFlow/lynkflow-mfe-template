/**
 * Build-time constants injected by webpack's DefinePlugin.
 *
 * Browser code has no `process.env` -- that's a Node global. Rather than
 * shimming Node into the bundle, each value the app needs at build time is
 * declared here (as an ambient global) and defined in webpack.config.mjs's
 * `DefinePlugin` call, which in turn reads it from `.env` (see `.env.example`
 * at the repo root -- that's where the actual configured value lives).
 *
 * NOT where domain types go. This file declares global CONSTANTS that don't
 * exist as real values until webpack's build step injects them -- it has
 * nothing to do with your domain's data shapes. A `User`, an `Order`, a
 * `Property` -- any real business type -- belongs in
 * `features/{domain}/{domain}.types.ts` instead (README.md §2's decision
 * table). Keep this file to build-time globals only; if you add another one
 * (a new `__SOMETHING__` in webpack.config.mjs's DefinePlugin), declare it
 * here too, right next to this one.
 */
declare const __API_BASE_URL__: string;

/**
 * Standalone dev harness only (`bootstrap.tsx`) -- the fixed language to
 * render in when running `npm run dev` on its own, set via `.env`'s
 * DEV_LANGUAGE. In production the Shell passes `language` into `./App` as a
 * runtime prop instead (.claude/rules/i18n.md); this global doesn't exist
 * outside this template's own dev build.
 */
declare const __DEV_LANGUAGE__: "en" | "ar";
