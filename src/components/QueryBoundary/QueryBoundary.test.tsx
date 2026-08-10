import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QueryBoundary } from "./QueryBoundary";
import type { QueryLike } from "./QueryBoundary";

function makeQuery<T>(overrides: Partial<QueryLike<T>>): QueryLike<T> {
  return {
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe("QueryBoundary", () => {
  it("renders the loading fallback while isLoading", () => {
    render(
      <QueryBoundary query={makeQuery<string[]>({ isLoading: true })}>
        {() => <p>content</p>}
      </QueryBoundary>,
    );

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders the default error state and calls refetch on retry", async () => {
    const refetch = jest.fn();
    render(
      <QueryBoundary
        query={makeQuery<string[]>({
          isError: true,
          error: new Error("network down"),
          refetch,
        })}
      >
        {() => <p>content</p>}
      </QueryBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("network down");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders a custom error fallback when provided", () => {
    render(
      <QueryBoundary
        query={makeQuery<string[]>({ isError: true, error: new Error("boom") })}
        errorFallback={(error) => <p>custom: {String(error)}</p>}
      >
        {() => <p>content</p>}
      </QueryBoundary>,
    );

    expect(screen.getByText(/custom: Error: boom/)).toBeInTheDocument();
  });

  it("renders the empty fallback when isEmpty matches", () => {
    render(
      <QueryBoundary
        query={makeQuery<string[]>({ data: [] })}
        isEmpty={(data) => data.length === 0}
        emptyFallback={<p>nothing here</p>}
      >
        {() => <p>content</p>}
      </QueryBoundary>,
    );

    expect(screen.getByText("nothing here")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders children with the data on success", () => {
    render(
      <QueryBoundary query={makeQuery<string[]>({ data: ["a", "b"] })}>
        {(data) => <p>{data.join(",")}</p>}
      </QueryBoundary>,
    );

    expect(screen.getByText("a,b")).toBeInTheDocument();
  });
});
