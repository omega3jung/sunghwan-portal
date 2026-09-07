import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAuthToken: vi.fn() }));
const users = vi.hoisted(() => ({ getUserProfileDtoByUsername: vi.fn() }));
const tenants = vi.hoisted(() => ({
  getServiceDeskSettingsTenantContext: vi.fn(),
  getServiceDeskSettingsTenantContextByCompanyId: vi.fn(),
}));

vi.mock("@/server/portalApi/auth", () => auth);
vi.mock("@/server/data/users", () => users);
vi.mock("@/server/data/serviceDesk/tenant", () => tenants);

import {
  resolveAuthorizedSettingsTenant,
  resolveOperationalServiceDeskReadTarget,
  resolveServiceDeskRequestContext,
} from "./auth";

const request = {} as NextRequest;
const canonicalTarget = {
  id: "employee-2",
  username: "target",
  displayName: { en: "Target User" },
  email: "target@example.com",
  userScope: "CLIENT" as const,
  companyId: 22,
  permission: 3 as const,
  canUseSuperUser: false,
  canUseImpersonation: false,
};

describe("Service Desk server authorization context", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserves the audit identity but reloads the effective principal from trusted server data", async () => {
    auth.getAuthToken.mockResolvedValue({
      username: "original",
      dataScope: "REMOTE",
      permission: 9,
      companyId: 1,
      impersonation: {
        impersonatedUser: { username: "target" },
      },
    });
    users.getUserProfileDtoByUsername.mockResolvedValue(canonicalTarget);

    await expect(resolveServiceDeskRequestContext(request)).resolves.toEqual({
      originalUsername: "original",
      effectiveUsername: "target",
      dataScope: "REMOTE",
      principal: canonicalTarget,
    });
    expect(users.getUserProfileDtoByUsername).toHaveBeenCalledWith("target");
  });

  it("rejects an impersonated identity that has no canonical user profile", async () => {
    auth.getAuthToken.mockResolvedValue({
      username: "original",
      dataScope: "REMOTE",
      impersonation: {
        impersonatedUser: { username: "inactive" },
      },
    });
    users.getUserProfileDtoByUsername.mockResolvedValue(null);

    await expect(
      resolveServiceDeskRequestContext(request),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("prevents a client principal from selecting another company's tenant", async () => {
    tenants.getServiceDeskSettingsTenantContextByCompanyId.mockResolvedValue({
      id: "22",
      companyId: 22,
      isOwnerTenant: false,
      operational: true,
    });

    await expect(
      resolveOperationalServiceDeskReadTarget({
        principalContext: {
          principal: canonicalTarget,
          dataScope: "REMOTE",
          originalUsername: "target",
          effectiveUsername: "target",
        },
        requestedTenantId: "23",
        requestedScope: "PORTAL",
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(tenants.getServiceDeskSettingsTenantContext).not.toHaveBeenCalled();
  });

  it("pins a tenant administrator to the tenant resolved from the canonical company", async () => {
    users.getUserProfileDtoByUsername.mockResolvedValue({
      ...canonicalTarget,
      permission: 9,
    });
    auth.getAuthToken.mockResolvedValue({
      username: "target",
      dataScope: "REMOTE",
    });
    tenants.getServiceDeskSettingsTenantContextByCompanyId.mockResolvedValue({
      id: "22",
      companyId: 22,
      isOwnerTenant: false,
      operational: true,
    });

    await expect(
      resolveAuthorizedSettingsTenant({
        request,
        requestedTenantId: "23",
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(tenants.getServiceDeskSettingsTenantContext).not.toHaveBeenCalled();
  });

  it("allows an owner administrator to select an explicit tenant", async () => {
    const ownerAdmin = {
      ...canonicalTarget,
      userScope: "INTERNAL" as const,
      companyId: 1,
      permission: 9 as const,
    };
    const selectedTenant = {
      id: "23",
      companyId: 23,
      isOwnerTenant: false,
      operational: true,
    };
    users.getUserProfileDtoByUsername.mockResolvedValue(ownerAdmin);
    auth.getAuthToken.mockResolvedValue({ username: "owner", dataScope: "REMOTE" });
    tenants.getServiceDeskSettingsTenantContext.mockResolvedValue(selectedTenant);

    await expect(
      resolveAuthorizedSettingsTenant({ request, requestedTenantId: "23" }),
    ).resolves.toMatchObject({ tenant: selectedTenant, effectiveUsername: "owner" });
  });

  it("rejects customer INTERNAL operational reads for an owner principal", async () => {
    tenants.getServiceDeskSettingsTenantContextByCompanyId.mockResolvedValue({
      id: "1",
      companyId: 1,
      isOwnerTenant: true,
      operational: true,
    });
    tenants.getServiceDeskSettingsTenantContext.mockResolvedValue({
      id: "22",
      companyId: 22,
      isOwnerTenant: false,
      operational: true,
    });

    await expect(
      resolveOperationalServiceDeskReadTarget({
        principalContext: {
          principal: { ...canonicalTarget, userScope: "INTERNAL", companyId: 1 },
          dataScope: "REMOTE",
          originalUsername: "owner",
          effectiveUsername: "owner",
        },
        requestedTenantId: "22",
        requestedScope: "INTERNAL",
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
