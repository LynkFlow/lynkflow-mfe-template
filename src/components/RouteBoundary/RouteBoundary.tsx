import { Suspense } from "react";
import type { ComponentType, ErrorInfo, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";

import { ErrorFallback } from "../ErrorFallback/index";
import { PageLoadingSkeleton } from "../PageLoadingSkeleton/index";

export interface RouteBoundaryProps {
  children: ReactNode;
  /**
   * Defaults to the shared `ErrorFallback`. Override per-route when a page
   * needs a different failure UI (e.g. a full-page redirect prompt instead of
   * an inline message) -- nothing here is hardcoded to a single fallback.
   */
  fallback?: ComponentType<FallbackProps>;
  /** Defaults to the shared `PageLoadingSkeleton`. */
  loadingFallback?: ReactNode;
  /**
   * Optional hook for error reporting/monitoring (e.g. Sentry, an analytics
   * event). Not wired to anything by default -- this is the extension point
   * for whoever adds that later, instead of them having to edit this
   * component or duplicate the boundary per route.
   */
  onError?: (error: unknown, info: ErrorInfo) => void;
}

/**
 * The route-level error/loading boundary every entry in `Routes.tsx` wraps
 * itself in. This is the coarser of the two boundary layers this template
 * ships (see `components/QueryBoundary` for the finer, per-query one,
 * README.md §3): it catches a page crashing outright, or its lazy chunk
 * failing to load, so one broken page doesn't blank the whole MFE.
 *
 * Previously this was a function defined inline inside `Routes.tsx` with
 * `ErrorFallback` hardcoded as its only possible fallback. Pulling it out
 * into its own component with `fallback`/`loadingFallback`/`onError` props
 * makes it something a specific route CAN configure without editing shared
 * code, while every route that doesn't need anything special still gets the
 * same consistent defaults for free.
 */
export function RouteBoundary({
  children,
  fallback = ErrorFallback,
  loadingFallback = <PageLoadingSkeleton />,
  onError,
}: RouteBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={fallback} {...(onError ? { onError } : {})}>
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
