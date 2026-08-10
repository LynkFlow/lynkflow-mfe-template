import type { FallbackProps } from "react-error-boundary";
import { Button } from "@lynkflow/ui-kit";

/**
 * TEMPORARY LOCAL COPY.
 *
 * Per .claude/rules/routing-loading-errors.md this component belongs in
 * @lynkflow/ui-kit so every MFE and the Shell render the same failure state.
 * It lives here only because ui-kit@0.1.0 doesn't ship it yet. When the ui-kit
 * publishes `ErrorFallback`, delete this folder and import it from the package
 * instead -- do not let this local copy become the permanent version.
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div
      role="alert"
      className="rounded-md border border-danger/30 bg-danger/5 p-6 text-start"
    >
      <h2 className="mb-1 text-lg font-semibold text-neutral-900">
        Something went wrong
      </h2>
      <p className="mb-4 text-sm text-neutral-700">{message}</p>
      <Button variant="secondary" size="sm" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}
