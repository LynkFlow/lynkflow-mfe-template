export default {
  // Formatting: every staged file Prettier understands.
  "*.{ts,tsx,js,jsx,mjs,cjs,json,md,css}": ["prettier --write"],

  // Lint + type-check + run only the tests related to staged TS/TSX files.
  // ESLint is scoped to staged files; tsc --noEmit can't be (TypeScript needs
  // the whole program), so it always runs in full.
  //
  // The coverage step (test:coverage:warn) is advisory, not a gate -- see
  // the matching comment in lynkflow-ui-kit's lint-staged.config.mjs for
  // the full reasoning. Short version: Jest's exit code can't tell "a test
  // failed" apart from "coverage dipped," so making coverage non-blocking
  // means this step can't block on anything else either -- --findRelatedTests
  // above still catches a real regression in what changed; CI (once
  // ci-cd.md's pipeline exists) is where the full suite is a real gate.
  "*.{ts,tsx}": (stagedFiles) => [
    `eslint --max-warnings=0 ${stagedFiles.map((f) => `"${f}"`).join(" ")}`,
    `jest --bail --findRelatedTests --passWithNoTests ${stagedFiles.map((f) => `"${f}"`).join(" ")}`,
    "tsc --noEmit",
    "npm run test:coverage:warn",
  ],
};
