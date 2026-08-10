/**
 * Module Federation entry point: `./App`
 *
 * This is the boundary the Shell mounts. Everything this MFE needs to run --
 * its query client, its i18n instance -- is set up here, because a remote
 * can't assume the host wired those up for it.
 *
 * What the Shell owns and passes IN (never re-derived here):
 *  - `language`  -> .claude/rules/i18n.md  (Shell owns <html lang>/<dir>)
 *  - auth/session -> .claude/rules/auth.md (Shell owns login/logout + tokens)
 */
import { useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";

import i18n, { setLanguage, type SupportedLanguage } from "./i18n/index";
import Routes from "./Routes";

// This MFE's OWN compiled Tailwind utilities. It must be imported here, in the
// federated entry point -- not in bootstrap.tsx -- because bootstrap only runs
// in standalone dev. In production the Shell imports `./App` directly, so
// anything imported only by bootstrap never loads and the MFE renders
// unstyled. (The ui-kit's global stylesheet is a separate concern: the Shell
// imports that once for the whole app -- see .claude/rules/ui-kit.md.)
import "./styles.css";

export interface AppProps {
  /** Active language, owned by the Shell. */
  language?: SupportedLanguage;
}

export default function App({ language = "en" }: AppProps) {
  // One QueryClient per MFE instance. Defaults here rather than per-call so
  // every query in this domain behaves consistently (api-conventions.md).
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Routes />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
