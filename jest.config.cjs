const react = require("@lynkflow/config/jest/react");

/** @type {import('jest').Config} */
module.exports = {
  ...react,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    ...react.collectCoverageFrom,
    // Test helpers/mocks (renderWithProviders, jest-dom types), not app
    // source -- there's nothing here for a consuming MFE to break.
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
    // exclusion -- there's nothing to assert beyond "the value is the value".
    "!src/env.ts",
  ],
  // @lynkflow/config/jest/react's floor (80/85/85/85) already matches what
  // this repo settled on -- no override needed. If this repo ever needs a
  // stricter bar than the shared default, that's a local addition here.
};
