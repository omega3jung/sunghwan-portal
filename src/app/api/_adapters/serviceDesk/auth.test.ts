import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CLIENT_DEMO_USER_IDS,
  INTERNAL_DEMO_USER_IDS,
} from "@/mocks/domain/user";

const requestAuth = vi.hoisted(() => ({
  getAuthToken: vi.fn(),
  getUserAccessLevel: vi.fn(),
}));

vi.mock("@/app/api/_adapters/auth/requestAuth", () => requestAuth);

import {
  resolveOperationalServiceDeskReadTarget,
  resolveServiceDeskRequestContext,
} from "./auth";

const request = new NextRequest("http://localhost/api/service-desk/settings");

describe("Service Desk adapter authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the original audit identity while authorizing the effective LOCAL identity", async () => {
    requestAuth.getAuthToken.mockResolvedValue({
      username: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
      dataScope: "LOCAL",
      impersonation: {
        impersonatedUser: {
          username: CLIENT_DEMO_USER_IDS.ADMIN.USER_NAME,
        },
      },
    });

    await expect(resolveServiceDeskRequestContext(request)).resolves.toEqual(
      expect.objectContaining({
        dataScope: "LOCAL",
        originalUsername: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
        effectiveUsername: CLIENT_DEMO_USER_IDS.ADMIN.USER_NAME,
        principal: expect.objectContaining({
          username: CLIENT_DEMO_USER_IDS.ADMIN.USER_NAME,
          userScope: "CLIENT",
        }),
      }),
    );
  });

  it("fails closed when the effective LOCAL profile is unavailable", async () => {
    requestAuth.getAuthToken.mockResolvedValue({
      username: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
      dataScope: "LOCAL",
      impersonation: {
        impersonatedUser: { username: "missing-demo-user" },
      },
    });

    await expect(resolveServiceDeskRequestContext(request)).rejects.toMatchObject(
      { status: 403 },
    );
  });

  it("prevents a client principal from selecting another tenant", async () => {
    requestAuth.getAuthToken.mockResolvedValue({
      username: CLIENT_DEMO_USER_IDS.ADMIN.USER_NAME,
      dataScope: "LOCAL",
    });
    const principalContext = await resolveServiceDeskRequestContext(request);

    await expect(
      resolveOperationalServiceDeskReadTarget({
        request,
        principalContext,
        requestedTenantId: "not-the-client-tenant",
        requestedScope: "PORTAL",
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
