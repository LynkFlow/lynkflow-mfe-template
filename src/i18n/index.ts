/**
 * This MFE's own i18next instance.
 *
 * Per .claude/rules/i18n.md:
 *  - each MFE owns its own translation resources and its own instance;
 *  - the ACTIVE LANGUAGE is not decided here -- the Shell passes it in as a
 *    prop to `./App`, and App calls `setLanguage()` below;
 *  - this MFE never touches <html lang> / <html dir>; that's the Shell's job
 *    in production. (The standalone dev harness in `bootstrap.tsx` fakes this
 *    one piece, since there's no Shell yet -- see the comment there.)
 *
 * `en.json` / `ar.json` start EMPTY (`{}`). Translation content belongs to
 * whatever domain this template becomes, not to the template itself -- add
 * your own keys there, namespaced `{domain}.{module}.{key}` so they stay
 * traceable to the BRD module that owns them.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import ar from "./ar.json";

export type SupportedLanguage = "en" | "ar";

const instance = i18n.createInstance();

void instance.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setLanguage(language: SupportedLanguage) {
  if (instance.language !== language) {
    void instance.changeLanguage(language);
  }
}

/** Right-to-left languages in this app. Used by the dev harness and, later, the Shell. */
const RTL_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set(["ar"]);

export function getDirection(language: SupportedLanguage): "ltr" | "rtl" {
  return RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
}

export default instance;
