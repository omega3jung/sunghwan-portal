import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkAdminOrSelf: vi.fn(),
  isRemoteRequest: vi.fn(),
  portalApiJson: vi.fn(),
  getLocalUserProfile: vi.fn(),
}));

vi.mock("@/app/api/_adapters/auth/requestAuth", () => ({
  checkAdmin: vi.fn(),
  checkAdminOrSelf: mocks.checkAdminOrSelf,
  isRemoteRequest: mocks.isRemoteRequest,
}));
vi.mock("@/app/api/_adapters/backend", () => ({
  portalApiJson: mocks.portalApiJson,
}));
vi.mock("@/app/api/_adapters/localDemo/user", () => ({
  getLocalUserProfile: mocks.getLocalUserProfile,
}));

import * as preferenceRoute from "./[userId]/preference/route";
import * as profileRoute from "./[userId]/profile/route";

const context = { params: Promise.resolve({ userId: "user-1" }) };

describe("User-scoped route authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.checkAdminOrSelf.mockResolvedValue({ ok: true, token: {} });
    mocks.getLocalUserProfile.mockReturnValue({ id: "user-1" });
  });

  it.each([
    ["profile GET", () => profileRoute.GET(createRequest(), context)],
    ["profile POST", () => profileRoute.POST(createRequest("POST"), context)],
    ["profile PUT", () => profileRoute.PUT(createRequest("PUT"), context)],
    ["preference GET", () => preferenceRoute.GET(createRequest(), context)],
    ["preference POST", () => preferenceRoute.POST(createRequest("POST"), context)],
    ["preference PUT", () => preferenceRoute.PUT(createRequest("PUT"), context)],
  ])("rejects unauthenticated LOCAL %s before reading local data", async (_label, call) => {
    mocks.checkAdminOrSelf.mockResolvedValue({ ok: false, status: 401 });

    const response = await call();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Unauthorized" });
    expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
    expect(mocks.getLocalUserProfile).not.toHaveBeenCalled();
  });

  it("returns 403 for another user's resource before selecting a runtime", async () => {
    mocks.checkAdminOrSelf.mockResolvedValue({ ok: false, status: 403 });

    const response = await profileRoute.GET(createRequest(), context);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: "Forbidden" });
    expect(mocks.checkAdminOrSelf).toHaveBeenCalledWith(
      expect.anything(),
      "user-1",
    );
    expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
  });

  it("keeps the authorized LOCAL profile path available to self or admin", async () => {
    const response = await profileRoute.GET(createRequest(), context);

    expect(response.status).toBe(200);
    expect(mocks.getLocalUserProfile).toHaveBeenCalledWith("user-1");
  });

  it("applies the same authorization before the REMOTE proxy", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 204 }));

    await profileRoute.GET(createRequest(), context);

    expect(mocks.checkAdminOrSelf.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.portalApiJson.mock.invocationCallOrder[0],
    );
  });
});

function createRequest(method = "GET") {
  return new NextRequest("http://localhost/api/users/user-1/profile", {
    method,
    ...(method === "GET"
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "user-1", key: "value" }),
        }),
  });
}
