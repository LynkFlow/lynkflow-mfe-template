import globals from "globals";
import tseslint from "typescript-eslint";

import react from "@lynkflow/config/eslint/react";

/**
 * Thin extends of the shared React ESLint layer (@lynkflow/config/eslint/react).
 * Only two things are specific to this repo: the webpack DefinePlugin build
 * globals, and the jest.setup.ts default-project allowance. Everything else
 * (recommendedTypeChecked, react-hooks, .cjs/.config overrides, test-file
 * exceptions) now lives in @lynkflow/config -- don't re-add it here.
 */
export default [
  ...react({
    tsconfigRootDir: import.meta.dirname,
    allowDefaultProject: ["jest.setup.ts"],
    // Injected by webpack DefinePlugin; typed in src/env.ts.
    buildGlobals: {
      __API_BASE_URL__: "readonly",
      __DEV_LANGUAGE__: "readonly",
    },
  }),

  // Belt-and-suspenders, matching lynkflow-ui-kit/lynkflow-types: this repo
  // currently resolves @lynkflow/config via a fresh file: link (locally) or
  // a sibling checkout of the live lynkflow-config repo (in CI, see
  // ci-cd.md), so it isn't actually stale today -- but scripts/*.mjs still
  // needs its own disableTypeChecked override rather than depending on
  // *how* @lynkflow/config happens to be resolved. See
  // .claude/rules/publishing.md's 12 Aug 2026 incident note for why
  // lynkflow-shell/scratch-test-ui (which resolve from the real, currently
  // stale, published registry version) needed this the hard way.
  {
    files: ["scripts/**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
];
