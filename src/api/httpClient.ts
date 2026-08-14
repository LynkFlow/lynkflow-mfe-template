/**
 * Domain-agnostic HTTP client factory.
 *
 * Per .claude/rules/api-conventions.md, a thin, domain-agnostic HTTP wrapper
 * (base URL, error-envelope normalization) is the one legitimate candidate for
 * the future `@lynkflow/api-client` platform package. This file is the local
 * stand-in until that package exists -- when it ships, this file's contents
 * move there largely unchanged, and every `{domain}Client.ts` below switches
 * its import instead of reimplementing this logic.
 *
 * This file must stay domain-agnostic. The moment it grows a single
 * domain-specific type or endpoint, that logic belongs in this MFE's own
 * `api/{domain}Client.ts`, not here. A backend whose success responses come
 * wrapped in an envelope (e.g. `{ success, data, message }`) supplies its own
 * `unwrap` function via `CreateApiClientOptions` -- that's still generic
 * plumbing, not a domain-specific type.
 *
 * Usage (in a real MFE, once you've replaced the "example" placeholder):
 *
 *   // api/usersClient.ts
 *   import { createApiClient } from "./httpClient";
 *   import type { User } from "../features/users/users.types";
 *
 *   const apiClient = createApiClient(env.apiBaseUrl);
 *
 *   export const usersClient = {
 *     list: () => apiClient.get<User[]>(""),
 *     getById: (id: string) => apiClient.get<User>(`/${encodeURIComponent(id)}`),
 *   };
 */
import type { ApiError } from "@lynkflow/types";

/** Thrown by every request this client makes. Safe to `instanceof` check. */
export class ApiRequestError extends Error implements ApiError {
  code: string;
  status: number;
  fieldErrors?: Record<string, string>;
  details?: string[];

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.status = error.status;
    if (error.fieldErrors) this.fieldErrors = error.fieldErrors;
    if (error.details) this.details = error.details;
  }
}

export interface ApiClient {
  get<T>(path: string, init?: RequestInit): Promise<T>;
  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  delete<T>(path: string, init?: RequestInit): Promise<T>;
}

export interface CreateApiClientOptions {
  /**
   * Pulls the real payload out of a success response for a backend that
   * wraps it in its own envelope (e.g. `{ success, data, message }`).
   * Most domains return the resource directly and don't need this.
   */
  unwrap?: (body: unknown) => unknown;
}

/**
 * Creates an API client scoped to one domain's base URL.
 *
 * Services are expected to return a consistent error envelope
 * (`{ code, message, fieldErrors?, details? }`, matching `@lynkflow/types`'s
 * `ApiError`); this falls back gracefully when they don't (network errors,
 * proxies, HTML error pages) rather than throwing an unhelpful parse error.
 */
export function createApiClient(baseUrl: string, options: CreateApiClientOptions = {}): ApiClient {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as Partial<ApiError>;
      throw new ApiRequestError({
        code: body.code ?? "UNKNOWN_ERROR",
        status: response.status,
        message: body.message ?? `Request failed with status ${response.status}`,
        ...(body.fieldErrors ? { fieldErrors: body.fieldErrors } : {}),
        ...(body.details ? { details: body.details } : {}),
      });
    }

    if (response.status === 204) return undefined as T;
    const json: unknown = await response.json();
    return (options.unwrap ? options.unwrap(json) : json) as T;
  }

  function withBody<T>(
    method: string,
  ): (path: string, body?: unknown, init?: RequestInit) => Promise<T> {
    return (path, body, init) =>
      request<T>(path, {
        method,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        ...init,
      });
  }

  return {
    get: (path, init) => request(path, { method: "GET", ...init }),
    post: withBody("POST"),
    put: withBody("PUT"),
    patch: withBody("PATCH"),
    delete: (path, init) => request(path, { method: "DELETE", ...init }),
  };
}
