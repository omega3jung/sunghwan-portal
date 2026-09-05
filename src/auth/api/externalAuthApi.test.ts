import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requestExternalAuthApi } from "./externalAuthApi";

describe("External Auth API transport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.AUTH_API_BASE_URL = "https://auth.example.com/";
  });
  afterEach(() => delete process.env.AUTH_API_BASE_URL);

  it("forwards repeated query values, headers, and a JSON body", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 1 } }), { status: 201 }),
    );

    const response = await requestExternalAuthApi({
      method: "POST",
      path: "auth/login",
      query: { companyId: [1, 2], active: true },
      headers: { "X-Trace": "trace" },
      body: { username: "employee.one" },
      errorMessage: "failed",
      mapData: (payload) => ({ wrapped: payload }),
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://auth.example.com/auth/login?companyId=1&companyId=2&active=true",
    );
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify({ username: "employee.one" }));
    await expect(response.json()).resolves.toEqual({
      wrapped: { data: { id: 1 } },
    });
  });

  it("preserves 204 responses without invoking the mapper", async () => {
    const mapData = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    const response = await requestExternalAuthApi({
      path: "/auth/logout",
      errorMessage: "failed",
      mapData,
    });

    expect(response.status).toBe(204);
    expect(mapData).not.toHaveBeenCalled();
  });

  it("preserves upstream error status and does not map error payloads", async () => {
    const mapData = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("upstream unavailable", { status: 503 }),
    );

    const response = await requestExternalAuthApi({
      path: "/auth/login",
      errorMessage: "fallback",
      mapData,
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ message: "upstream unavailable" });
    expect(mapData).not.toHaveBeenCalled();
  });
});
