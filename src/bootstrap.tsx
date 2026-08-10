/**
 * Standalone dev entry -- used ONLY when running this MFE on its own
 * (`npm run dev`). In production the Shell imports `./App` (and `./Routes`)
 * over Module Federation and this file never runs.
 *
 * The Shell normally provides `language` as a runtime prop at mount
 * (.claude/rules/i18n.md), decided from the logged-in user's profile
 * preference. There's no Shell (and no user, and no profile) here, so this
 * harness renders in a FIXED language instead: `env.devLanguage`, a
 * build-time constant baked in by webpack.config.mjs from `.env`'s
 * DEV_LANGUAGE. To see this MFE in Arabic/RTL, set DEV_LANGUAGE=ar in `.env`
 * and restart `npm run dev` -- there is no in-app switcher, on purpose: a
 * fixed, restart-to-change value is simpler than runtime UI state for
 * something only ever used while developing this one MFE in isolation.
 *
 * `public/index.html`'s `<html lang>/<dir>` are baked from the same
 * `.env` value at build time (via HtmlWebpackPlugin's `templateParameters`),
 * so there's nothing to reconcile here -- unlike the real Shell, which sets
 * `<html lang>/<dir>` at runtime and has to avoid a flash of the wrong
 * direction before its JS loads (see i18n.md's "Avoiding a flash of the
 * wrong direction on first paint" -- that concern doesn't apply here since
 * this value never changes after a build).
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Standalone-only: in the real app the Shell imports the ui-kit stylesheet
// once, globally. See .claude/rules/ui-kit.md. This MFE's OWN stylesheet is
// imported by App.tsx instead, so it travels with the federated module.
import "@lynkflow/ui-kit/styles.css";

import App from "./App";
import { env } from "./env";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App language={env.devLanguage} />
    </BrowserRouter>
  </StrictMode>,
);
