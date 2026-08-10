/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
  moduleNameMapper: {
    // CSS imports carry no behavior in tests.
    "\\.css$": "<rootDir>/src/test/styleMock.cjs",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    // .d.ts files carry no executable code.
    "!src/**/*.d.ts",
    // Barrel re-export files -- tests import the component directly, not
    // through index.ts, so these always read as 0% despite the real file
    // being fully covered. See .claude/rules/testing.md.
    "!src/**/index.{ts,tsx}",
    // Test helpers/mocks (renderWithProviders, styleMock, jest-dom types),
    // not app source -- there's nothing here for a consuming MFE to break.
    "!src/test/**",
    // Scaffolding-only placeholder, documented to be deleted before this
    // template becomes a real MFE (see the file's own docblock). No branches,
    // nothing worth asserting on borrowed time.
    "!src/features/example/pages/ExamplePage.tsx",
    // Standalone dev-only entry point -- never runs in production (the Shell
    // imports ./App directly), same category as build tooling. See the
    // file's own docblock.
    "!src/bootstrap.tsx",
    // Build-time config passthrough: no branches, no logic, just reads the
    // constants webpack injected. Same rationale as the ui-kit's tokens
    // exclusion -- there's nothing to assert beyond "the value is the value",
    // and it's exercised indirectly by everything that imports it.
    "!src/env.ts",
  ],
  // Raised from 70 once the suite settled at ~95%. A floor well under the
  // current number still catches a real regression (someone deleting tests,
  // or landing a substantial untested file) without failing the build the
  // first time a modestly-tested file is added. See .claude/rules/testing.md.
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
