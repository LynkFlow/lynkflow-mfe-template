/**
 * The one place build-time configuration is read.
 *
 * Browsers have no `process.env` -- that's a Node global. Webpack's
 * DefinePlugin does a literal find-and-replace at build time, swapping the
 * `__NAME__` tokens below for string literals before the bundle ships. The
 * actual values come from `.env` (see `.env.example`), read by dotenv in
 * webpack.config.mjs. This is the same mechanism CRA's `REACT_APP_*` and
 * Vite's `import.meta.env.VITE_*` use -- they just pick the naming convention
 * for you.
 *
 * The `declare const` lines are FILE-SCOPED: because this file is a module
 * (it has imports/exports), they declare the constants for this file only and
 * don't leak into the global namespace. That's deliberate -- every other file
 * imports `env` from here rather than reaching for a magic global, so there's
 * one place to look, one place to change, and it's trivially mockable in
 * tests via `jest.mock("../env")`.
 *
 * Adding a new build-time value: declare it here, read it into `env` below,
 * and add it to DefinePlugin in webpack.config.mjs + `.env.example`.
 */
declare const __API_BASE_URL__: string;
declare const __DEV_LANGUAGE__: "en" | "ar";

export const env = {
  /** Base URL of this domain's backend service. */
  apiBaseUrl: __API_BASE_URL__,

  /**
   * Standalone dev harness only (`npm run dev`). In production the Shell
   * passes `language` into `./App` as a runtime prop instead -- see
   * `.claude/rules/i18n.md`.
   */
  devLanguage: __DEV_LANGUAGE__,
} as const;

export type Env = typeof env;
