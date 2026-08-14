/**
 * Thin wrapper over TanStack Query's own documented pagination pattern --
 * `useQuery` + `placeholderData: keepPreviousData` -- so every domain's
 * paginated listing screen gets smooth page-to-page transitions (the old
 * page's data stays on screen while the next page loads, instead of a
 * flash to a loading state) without hand-rolling a pagination state
 * machine per domain. Not a new pagination system -- React Query's own,
 * given one canonical home.
 *
 * Keyed against `@lynkflow/types`'s `PaginatedResponse<T>`/`PaginationParams`
 * so every domain's listing endpoint returns the same shape this hook
 * expects (business-domain.md's server-side-pagination requirement).
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { PaginatedResponse, PaginationParams } from "@lynkflow/types";

export function usePaginatedQuery<T>(
  queryKey: readonly unknown[],
  fetchPage: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  params: PaginationParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<T>>, "queryKey" | "queryFn">,
): UseQueryResult<PaginatedResponse<T>> {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetchPage(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}
