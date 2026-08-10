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
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
