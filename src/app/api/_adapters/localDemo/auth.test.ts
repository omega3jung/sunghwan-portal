import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CLIENT_DEMO_USER_IDS,
  clientAdminAuth,
  INTERNAL_DEMO_USER_IDS,
} from "@/mocks/domain/user";

import { getLocalDemoTenants } from "./serviceDesk/settings/state";

const auth = vi.hoisted(() => ({
  getAuthToken: vi.fn(),
}));

vi.mock("@/app/api/_adapters/auth/requestAuth", () => auth);

import {
  getCurrentLocalTicketAccessContext,
  getCurrentLocalUserRole,
  getCurrentLocalUserScope,
  isCurrentLocalUserInternal,
} from "./auth";

const request = new NextRequest("http://localhost/api/service-desk/tickets");

describe("LOCAL demo authentication context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the impersonated identity for role, scope, and tenant access", async () => {
    const clientTenant = getLocalDemoTenants().find(
      (tenant) => tenant.tenant_company_id === clientAdminAuth.companyId,
    )!;
    auth.getAuthToken.mockResolvedValue({
      username: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
      dataScope: "LOCAL",
      impersonation: {
        impersonatedUser: {
          username: CLIENT_DEMO_USER_IDS.ADMIN.USER_NAME,
        },
      },
    });

    await expect(getCurrentLocalUserRole(request)).resolves.toBe("ADMIN");
    await expect(getCurrentLocalUserScope(request)).resolves.toBe("CLIENT");
    await expect(isCurrentLocalUserInternal(request)).resolves.toBe(false);
    await expect(
      getCurrentLocalTicketAccessContext(request),
    ).resolves.toEqual({
      username: CLIENT_DEMO_USER_IDS.ADMIN.USER_NAME,
      userScope: "CLIENT",
      tenantId: String(clientTenant.tenant_id),
    });
  });

  it("does not expose LOCAL authorization for a REMOTE session", async () => {
    auth.getAuthToken.mockResolvedValue({
      username: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
      dataScope: "REMOTE",
    });

    await expect(getCurrentLocalUserRole(request)).resolves.toBe("NONE");
    await expect(getCurrentLocalUserScope(request)).resolves.toBeNull();
    await expect(isCurrentLocalUserInternal(request)).resolves.toBeNull();
    await expect(
      getCurrentLocalTicketAccessContext(request),
    ).resolves.toBeNull();
  });

  it("rejects an unknown impersonation target instead of falling back to the original user", async () => {
    auth.getAuthToken.mockResolvedValue({
      username: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
      dataScope: "LOCAL",
      impersonation: {
        impersonatedUser: { username: "missing-demo-user" },
      },
    });

    await expect(getCurrentLocalUserRole(request)).resolves.toBe("NONE");
    await expect(
      getCurrentLocalTicketAccessContext(request),
    ).resolves.toBeNull();
  });
});
