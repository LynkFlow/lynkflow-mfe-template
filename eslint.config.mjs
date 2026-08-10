import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Type-aware linting. `recommendedTypeChecked` uses the TypeScript program
 * rather than just the syntax tree, so it catches what `tsc` alone won't --
 * floating promises, unsafe `any` propagation, misused async functions.
 *
 * Requires a TypeScript version typescript-eslint supports (currently
 * >=4.8.4 <6.1.0). Read tooling.md before bumping TypeScript.
 */
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      // Plain CJS stub with no logic; not part of the TS program.
      "src/test/styleMock.cjs",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["jest.setup.ts"] },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        // Injected by webpack DefinePlugin; typed in src/types/globals.d.ts.
        __API_BASE_URL__: "readonly",
        __DEV_LANGUAGE__: "readonly",
      },
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },

  // Build/tooling configs are Node ESM and live outside the src TS program.
  // NOTE: disableTypeChecked is spread FIRST -- it sets its own
  // languageOptions, so spreading it after would wipe out the globals below.
  {
    files: ["*.config.{js,mjs,cjs,ts}", "*.config.*.{js,mjs,cjs,ts}"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.commonjs },
    },
  },

  {
    // Tests: jsdom + Jest globals. Mock factories legitimately declare
    // `async` methods with no `await` (they stand in for promise-returning
    // APIs), and use loose typing for partial fixtures.
    files: ["**/*.test.{ts,tsx}", "jest.setup.ts", "src/test/**"],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
    rules: {
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
);
