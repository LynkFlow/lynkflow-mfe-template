import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RouteBoundary } from "./RouteBoundary";

function Thrower(): never {
  throw new Error("boom");
}

function Suspender(): never {
  // A promise that never resolves keeps the boundary suspended for the
  // duration of the test -- enough to assert the loading fallback renders.
  // Throwing a promise (not an Error) is exactly how React Suspense works,
  // so the usual only-throw-error rule doesn't apply here.
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new Promise(() => {});
}

describe("RouteBoundary", () => {
  it("renders children when nothing errors or suspends", () => {
    render(
      <RouteBoundary>
        <p>content</p>
      </RouteBoundary>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders the shared PageLoadingSkeleton while a child suspends", () => {
    render(
      <RouteBoundary>
        <Suspender />
      </RouteBoundary>,
    );

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders a custom loadingFallback when provided", () => {
    render(
      <RouteBoundary loadingFallback={<p>custom loading</p>}>
        <Suspender />
      </RouteBoundary>,
    );

    expect(screen.getByText("custom loading")).toBeInTheDocument();
  });

  it("renders the default ErrorFallback when a child throws", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <RouteBoundary>
        <Thrower />
      </RouteBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    consoleError.mockRestore();
  });

  it("renders a custom fallback component when provided", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <RouteBoundary fallback={() => <p>custom error UI</p>}>
        <Thrower />
      </RouteBoundary>,
    );

    expect(screen.getByText("custom error UI")).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it("calls onError when a child throws", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const onError = jest.fn();

    render(
      <RouteBoundary onError={onError}>
        <Thrower />
      </RouteBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    consoleError.mockRestore();
  });

  it("lets the default fallback's retry button call resetErrorBoundary without crashing", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <RouteBoundary>
        <Thrower />
      </RouteBoundary>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    // Thrower always throws again, so the boundary should still show the
    // error state after the retry -- this just proves clicking doesn't crash.
    expect(screen.getByRole("alert")).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
