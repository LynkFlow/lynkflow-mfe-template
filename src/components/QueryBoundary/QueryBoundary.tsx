import type { ReactNode } from "react";

import { ErrorFallback } from "../ErrorFallback/index";
import { PageLoadingSkeleton } from "../PageLoadingSkeleton/index";

/**
 * The subset of TanStack Query's `UseQueryResult` this component needs.
 * Structural, not `UseQueryResult` itself, so any query-like object (a real
 * query, a test double, a future non-TanStack source) can be passed in
 * without importing `@tanstack/react-query`'s types here.
 */
export interface QueryLike<T> {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: T | undefined;
  refetch: () => unknown;
}

export interface QueryBoundaryProps<T> {
  /** The result of a `useQuery`/`useSuspenseQuery`-style hook call. */
  query: QueryLike<T>;
  /** Renders once data is available. This is the ONLY thing a page should write. */
  children: (data: T) => ReactNode;
  /** Defaults to the shared PageLoadingSkeleton. */
  loadingFallback?: ReactNode;
  /** Defaults to the shared ErrorFallback with a "try again" that calls `refetch`. */
  errorFallback?: (error: unknown, retry: () => unknown) => ReactNode;
  /** When provided, renders `emptyFallback` instead of `children` for empty data. */
  isEmpty?: (data: T) => boolean;
  emptyFallback?: ReactNode;
}

/**
 * The single, global way to render a query's loading / error / empty /
 * success states, so no page hand-rolls its own
 * `if (isLoading) ... if (isError) ...` branching (.claude/rules/api-conventions.md,
 * .claude/rules/routing-loading-errors.md).
 *
 * A page becomes:
 *
 *   const query = useUsers();
 *   return (
 *     <QueryBoundary query={query} isEmpty={(users) => users.length === 0}
 *       emptyFallback={<p>{t("users.list.empty")}</p>}>
 *       {(users) => <UserList users={users} />}
 *     </QueryBoundary>
 *   );
 *
 * The page component only ever implements the success view.
 */
export function QueryBoundary<T>({
  query,
  children,
  loadingFallback = <PageLoadingSkeleton />,
  errorFallback,
  isEmpty,
  emptyFallback,
}: QueryBoundaryProps<T>) {
  if (query.isLoading) return <>{loadingFallback}</>;

  if (query.isError) {
    if (errorFallback) return <>{errorFallback(query.error, query.refetch)}</>;
    const error =
      query.error instanceof Error ? query.error : new Error(String(query.error));
    return <ErrorFallback error={error} resetErrorBoundary={query.refetch} />;
  }

  if (query.data === undefined) return <>{loadingFallback}</>;

  if (isEmpty?.(query.data)) return <>{emptyFallback ?? null}</>;

  return <>{children(query.data)}</>;
}
