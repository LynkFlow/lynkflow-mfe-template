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
        message: "Validation failed.",
        fieldErrors: { email: "Email is required." },
      }),
    });
    const client = createApiClient("/api/widgets");

    await expect(client.get("/1")).rejects.toMatchObject({
      status: 422,
      message: "Validation failed.",
      fieldErrors: { email: "Email is required." },
    });
  });

  it("falls back to a generic message when the error body isn't JSON", async () => {
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
      status: 500,
      message: "Request failed with status 500",
    });
  });
});
