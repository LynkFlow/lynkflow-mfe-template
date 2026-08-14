import { ApiRequestError, createApiClient } from "./httpClient";

function mockFetchOnce(
  response: Partial<Response> & { json?: () => Promise<unknown> },
) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...response,
  });
}

describe("createApiClient", () => {
  afterEach(() => jest.resetAllMocks());

  it("prefixes every request with the configured base URL", async () => {
    mockFetchOnce({ json: async () => ({ id: "1" }) });
    const client = createApiClient("/api/widgets");

    await client.get("/1");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/widgets/1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("returns the parsed JSON body on success", async () => {
    mockFetchOnce({ json: async () => ({ id: "1", name: "Widget" }) });
    const client = createApiClient("/api/widgets");

    await expect(client.get("/1")).resolves.toEqual({ id: "1", name: "Widget" });
  });

  it("serializes the body and sets the method for write operations", async () => {
    mockFetchOnce({ json: async () => ({ id: "1" }) });
    const client = createApiClient("/api/widgets");

    await client.post("", { name: "New" });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/widgets",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "New" }),
      }),
    );
  });

  it("returns undefined for a 204 No Content response without parsing a body", async () => {
    const json = jest.fn();
    mockFetchOnce({ status: 204, json });
    const client = createApiClient("/api/widgets");

    await expect(client.delete("/1")).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("normalizes a service error envelope into ApiRequestError", async () => {
    mockFetchOnce({
      ok: false,
      status: 422,
      json: async () => ({
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        fieldErrors: { email: "Email is required." },
      }),
    });
    const client = createApiClient("/api/widgets");

    await expect(client.get("/1")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      status: 422,
      message: "Validation failed.",
      fieldErrors: { email: "Email is required." },
    });
  });

  it("falls back to a generic code and message when the error body isn't JSON", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });
    const client = createApiClient("/api/widgets");

    await expect(client.get("/1")).rejects.toBeInstanceOf(ApiRequestError);
    await expect(client.get("/1")).rejects.toMatchObject({
      code: "UNKNOWN_ERROR",
      status: 500,
      message: "Request failed with status 500",
    });
  });

  it("unwraps a response envelope when the domain supplies one", async () => {
    mockFetchOnce({ json: async () => ({ success: true, data: { id: "1" } }) });
    const client = createApiClient("/api/widgets", {
      unwrap: (body) => (body as { data: unknown }).data,
    });

    await expect(client.get("/1")).resolves.toEqual({ id: "1" });
  });

  it("parses a nested error envelope when the domain supplies parseError", async () => {
    mockFetchOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: "AUTH_INVALID_CREDENTIALS", message: "Bad credentials." } }),
    });
    const client = createApiClient("/api/widgets", {
      parseError: (body) => (body as { error?: Partial<import("@lynkflow/types").ApiError> }).error,
    });

    await expect(client.get("/1")).rejects.toMatchObject({
      code: "AUTH_INVALID_CREDENTIALS",
      status: 401,
      message: "Bad credentials.",
    });
  });

  it("passes the configured credentials mode through to fetch", async () => {
    mockFetchOnce({ json: async () => ({ id: "1" }) });
    const client = createApiClient("/api/widgets", { credentials: "include" });

    await client.get("/1");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/widgets/1",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
