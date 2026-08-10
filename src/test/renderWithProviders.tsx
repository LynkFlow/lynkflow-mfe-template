/**
 * Test helper: renders a component with the same providers App.tsx supplies,
 * so tests exercise components the way they actually run.
 *
 * A fresh QueryClient per test keeps cache state from leaking between tests,
 * and retry:false makes error-path tests fail fast instead of retrying.
 */
import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import i18n from "../i18n/index";

export interface RenderOptions {
  /** Initial URL, relative to this MFE's own prefix. */
  route?: string;
  /** Route pattern, when the component under test reads route params. */
  path?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", path }: RenderOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          {path ? (
            <Routes>
              <Route path={path} element={children} />
            </Routes>
          ) : (
            children
          )}
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>
  );

  return render(ui, { wrapper });
}
