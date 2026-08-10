/**
 * Module Federation entry point: `./Routes`
 *
 * This MFE's nested route tree. The Shell mounts it under whatever prefix it
 * chooses, e.g. <Route path="/example/*" element={<ExampleRoutes />} />.
 *
 * IMPORTANT: every path here is RELATIVE. This MFE must never hardcode its own
 * outer prefix, so the Shell can remap the domain's URL without touching this
 * repo (.claude/rules/routing-loading-errors.md).
 *
 * Each route is wrapped in `RouteBoundary` (`components/RouteBoundary`) --
 * ErrorBoundary + Suspense with configurable fallbacks, so one broken page or
 * failed lazy chunk doesn't blank the whole MFE. It's a real, importable
 * component (not something redefined inline per file), so a specific route
 * can override its fallback/onError without touching shared code.
 *
 * There is exactly one placeholder route below. Replace it with your first
 * real feature:
 *   1. Create `src/features/{domain}/pages/{Name}Page.tsx` (ExamplePage
 *      already shows this exact placement -- see its own docblock).
 *   2. `lazy(() => import(...))` it here, the same way ExamplePage is loaded.
 *   3. Delete ExamplePage once you have a real index route.
 * See README.md §1-3 for the full "turn this template into a real MFE" guide.
 */
import { lazy } from "react";
import { Route, Routes as RouterRoutes } from "react-router-dom";

import { RouteBoundary } from "./components/RouteBoundary/index";

const ExamplePage = lazy(() => import("./features/example/pages/ExamplePage"));

export default function Routes() {
  return (
    <RouterRoutes>
      <Route
        index
        element={
          <RouteBoundary>
            <ExamplePage />
          </RouteBoundary>
        }
      />
    </RouterRoutes>
  );
}
