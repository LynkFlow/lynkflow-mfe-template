import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { PaginatedResponse } from "@lynkflow/types";

import { usePaginatedQuery } from "./usePaginatedQuery";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function page(pageNum: number): PaginatedResponse<{ id: number }> {
  return { items: [{ id: pageNum }], page: pageNum, pageSize: 10, total: 30 };
}

describe("usePaginatedQuery", () => {
  it("fetches the requested page", async () => {
    const fetchPage = jest.fn().mockResolvedValue(page(1));

    const { result } = renderHook(
      () => usePaginatedQuery(["widgets"], fetchPage, { page: 1, pageSize: 10 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(page(1));
    expect(fetchPage).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it("keeps the previous page's data visible while the next page loads", async () => {
    const fetchPage = jest.fn().mockImplementation((params: { page: number }) =>
      Promise.resolve(page(params.page)),
    );

    const { result, rerender } = renderHook(
      ({ pageNum }: { pageNum: number }) =>
        usePaginatedQuery(["widgets"], fetchPage, { page: pageNum, pageSize: 10 }),
      { wrapper, initialProps: { pageNum: 1 } },
    );

    await waitFor(() => expect(result.current.data).toEqual(page(1)));

    rerender({ pageNum: 2 });

    // Previous page's data stays available (isPlaceholderData) instead of
    // the hook going back to isLoading/undefined data.
    expect(result.current.data).toEqual(page(1));
    expect(result.current.isPlaceholderData).toBe(true);

    await waitFor(() => expect(result.current.data).toEqual(page(2)));
    expect(result.current.isPlaceholderData).toBe(false);
  });
});
