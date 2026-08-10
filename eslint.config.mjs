import react from "@lynkflow/config/eslint/react";

/**
 * Thin extends of the shared React ESLint layer (@lynkflow/config/eslint/react).
 * Only two things are specific to this repo: the webpack DefinePlugin build
 * globals, and the jest.setup.ts default-project allowance. Everything else
 * (recommendedTypeChecked, react-hooks, .cjs/.config overrides, test-file
 * exceptions) now lives in @lynkflow/config -- don't re-add it here.
 */
export default react({
  tsconfigRootDir: import.meta.dirname,
  allowDefaultProject: ["jest.setup.ts"],
  // Injected by webpack DefinePlugin; typed in src/env.ts.
  buildGlobals: {
    __API_BASE_URL__: "readonly",
    __DEV_LANGUAGE__: "readonly",
  },
});
