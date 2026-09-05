import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getAccessToken = vi.hoisted(() => vi.fn());

vi.mock("@/app/api/_adapters/auth/requestAuth", () => ({ getAccessToken }));

import { requestExternalPortalApi } from "./externalPortalApi";

const request = {} as NextRequest;

describe("External portal API transport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAccessToken.mockReset();
    getAccessToken.mockResolvedValue("trusted-session-token");
    process.env.API_BASE_URL = "https://portal.example.com/";
  });
  afterEach(() => delete process.env.API_BASE_URL);

  it("uses the server session token and forwards repeated query values and body", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { id: "ticket-1" } }), {
        status: 201,
      }),
    );

    const response = await requestExternalPortalApi(request, {
      method: "POST",
      path: "service-desk/tickets",
      query: { status: ["New", "Assigned"], page: 2 },
      headers: { Authorization: "Bearer browser-supplied" },
      body: { title: "Help" },
      errorMessage: "failed",
      mapData: (payload) => ({ mapped: payload }),
    });

    const [url, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(String(url)).toBe(
      "https://portal.example.com/service-desk/tickets?status=New&status=Assigned&page=2",
    );
    expect(headers.get("Authorization")).toBe("Bearer trusted-session-token");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify({ title: "Help" }));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      mapped: { data: { id: "ticket-1" } },
    });
  });

  it("returns 401 without contacting upstream when the session token is absent", async () => {
    getAccessToken.mockResolvedValue(null);
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await requestExternalPortalApi(request, {
      path: "/service-desk/tickets",
      errorMessage: "failed",
    });

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves 204 and upstream error responses without mapping them", async () => {
    const mapData = vi.fn();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "denied", result: "FORBIDDEN" }), {
          status: 403,
        }),
      );

    const noContent = await requestExternalPortalApi(request, {
      path: "/first",
      errorMessage: "failed",
      mapData,
    });
    const denied = await requestExternalPortalApi(request, {
      path: "/second",
      errorMessage: "failed",
      mapData,
    });

    expect(noContent.status).toBe(204);
    expect(denied.status).toBe(403);
    await expect(denied.json()).resolves.toEqual({
      message: "denied",
      code: "FORBIDDEN",
    });
    expect(mapData).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects GET bodies before contacting upstream", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await requestExternalPortalApi(request, {
      method: "GET",
      path: "/tickets",
      body: { invalid: true },
      errorMessage: "failed",
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "GET requests cannot include a body.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
