import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dispatchPortalApi = vi.hoisted(() => vi.fn());
const requestExternalPortalApi = vi.hoisted(() => vi.fn());

vi.mock("@/server/portalApi", () => ({ dispatchPortalApi }));
vi.mock("./externalPortalApi", () => ({ requestExternalPortalApi }));

import { portalApiJson } from "./portalApiJson";

const request = {} as NextRequest;
const options = { path: "/tickets", errorMessage: "failed" };

describe("Portal API topology boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.API_BASE_URL;
  });
  afterEach(() => delete process.env.API_BASE_URL);

  it("dispatches in-process when no external backend is configured", async () => {
    dispatchPortalApi.mockResolvedValue(
      new Response(JSON.stringify({ data: [1] }), { status: 200 }),
    );

    const response = await portalApiJson(request, options);

    expect(dispatchPortalApi).toHaveBeenCalledWith(request, options);
    expect(requestExternalPortalApi).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ data: [1] });
  });

  it("uses the external transport when configured", async () => {
    process.env.API_BASE_URL = "https://portal.example.com";
    requestExternalPortalApi.mockResolvedValue(new Response(null, { status: 204 }));

    await portalApiJson(request, options);

    expect(requestExternalPortalApi).toHaveBeenCalledWith(request, options);
    expect(dispatchPortalApi).not.toHaveBeenCalled();
  });

  it("maps only successful embedded response bodies", async () => {
    const mapData = vi.fn((payload) => ({ mapped: payload }));
    dispatchPortalApi
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "bad" }), { status: 400 }));

    const success = await portalApiJson(request, { ...options, mapData });
    const error = await portalApiJson(request, { ...options, mapData });

    await expect(success.json()).resolves.toEqual({ mapped: { id: 1 } });
    await expect(error.json()).resolves.toEqual({ message: "bad" });
    expect(mapData).toHaveBeenCalledOnce();
  });
});
