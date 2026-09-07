import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentUserName: vi.fn(),
  isRemoteRequest: vi.fn(),
  getLocalLeftMenu: vi.fn(),
  getLocalUserProfile: vi.fn(),
  portalApiJson: vi.fn(),
}));

vi.mock("@/app/api/_adapters/auth/requestAuth", () => ({
  checkAdmin: vi.fn(),
  checkAdminOrSelf: vi.fn(),
  requireCurrentUserName: mocks.requireCurrentUserName,
  isRemoteRequest: mocks.isRemoteRequest,
}));
vi.mock("@/app/api/_adapters/backend", () => ({
  portalApiJson: mocks.portalApiJson,
}));
vi.mock("@/app/api/_adapters/localDemo/user", () => ({
  getLocalLeftMenu: mocks.getLocalLeftMenu,
  getLocalUserProfile: mocks.getLocalUserProfile,
}));

import * as leftMenuRoute from "./navigation/left-menu/route";
import * as preferenceRoute from "./users/me/preference/route";
import * as profileRoute from "./users/me/profile/route";

const calls = [
  ["left menu GET", () => leftMenuRoute.GET(createRequest())],
  ["profile GET", () => profileRoute.GET(createRequest())],
  ["preference GET", () => preferenceRoute.GET(createRequest())],
  ["preference POST", () => preferenceRoute.POST(createRequest("POST"))],
  ["preference PUT", () => preferenceRoute.PUT(createRequest("PUT"))],
] as const;

describe("current account authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCurrentUserName.mockResolvedValue({
      ok: true,
      username: "current-user",
    });
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.getLocalLeftMenu.mockReturnValue({ items: [] });
    mocks.getLocalUserProfile.mockReturnValue({ id: "current-user" });
  });

  it.each(calls)(
    "returns the shared unauthorized response before runtime selection for %s",
    async (_label, call) => {
      mocks.requireCurrentUserName.mockResolvedValue({
        ok: false,
        status: 401,
      });

      const response = await call();

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        message: "Unauthorized",
      });
      expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
    },
  );

  it("uses the username returned by the authentication decision", async () => {
    await leftMenuRoute.GET(createRequest());
    await profileRoute.GET(createRequest());

    expect(mocks.getLocalLeftMenu).toHaveBeenCalledWith("current-user");
    expect(mocks.getLocalUserProfile).toHaveBeenCalledWith("current-user");
  });
});

function createRequest(method = "GET") {
  return new NextRequest("http://localhost/api/users/me/preference", {
    method,
    ...(method === "GET"
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: "system" }),
        }),
  });
}
