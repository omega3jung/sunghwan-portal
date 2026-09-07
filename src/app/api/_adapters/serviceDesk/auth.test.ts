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
const backend = vi.hoisted(() => ({ portalApiJson: vi.fn() }));

vi.mock("@/app/api/_adapters/auth/requestAuth", () => requestAuth);
vi.mock("@/app/api/_adapters/backend", () => backend);

import {
  requireServiceDeskSettingsRouteAccess,
  requireSettingsResourceAccess,
  resolveAuthorizedSettingsTenant,
  resolveOperationalServiceDeskReadTarget,
  resolveServiceDeskRequestContext,
} from "./auth";

const request = new NextRequest("http://localhost/api/service-desk/settings");

describe("Service Desk adapter authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestAuth.getUserAccessLevel.mockResolvedValue(9);
  });

  it("requires authentication and an administrator permission for settings routes", async () => {
    requestAuth.getAuthToken.mockResolvedValueOnce(null);
    await expect(
      requireServiceDeskSettingsRouteAccess(request),
    ).rejects.toMatchObject({ status: 401 });

    requestAuth.getAuthToken.mockResolvedValueOnce({ username: "user" });
    requestAuth.getUserAccessLevel.mockResolvedValueOnce(3);
    await expect(
      requireServiceDeskSettingsRouteAccess(request),
    ).rejects.toMatchObject({ status: 403 });
  });

  it.each([
    null,
    { dataScope: "LOCAL", username: "" },
    {
      dataScope: "LOCAL",
      username: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
      impersonation: { impersonatedUser: { username: "  " } },
    },
  ])("fails closed when trusted identity is incomplete", async (token) => {
    requestAuth.getAuthToken.mockResolvedValue(token);

    await expect(resolveServiceDeskRequestContext(request)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("maps REMOTE canonical profile lookup outcomes without trusting token profile fields", async () => {
    requestAuth.getAuthToken.mockResolvedValue({
      username: "remote-admin",
      dataScope: "REMOTE",
      permission: 9,
      companyId: 999,
    });
    backend.portalApiJson.mockResolvedValueOnce(
      Response.json({}, { status: 404 }),
    );

    await expect(resolveServiceDeskRequestContext(request)).rejects.toMatchObject({
      status: 403,
    });

    backend.portalApiJson.mockResolvedValueOnce(
      Response.json({ message: "unavailable" }, { status: 503 }),
    );
    await expect(resolveServiceDeskRequestContext(request)).rejects.toMatchObject({
      status: 503,
    });
  });

  it("uses the REMOTE canonical profile as authorization truth", async () => {
    requestAuth.getAuthToken.mockResolvedValue({
      username: "remote-admin",
      dataScope: "REMOTE",
      permission: 9,
      companyId: 999,
      userScope: "INTERNAL",
    });
    backend.portalApiJson.mockResolvedValue(
      Response.json({
        data: {
          id: "canonical",
          username: "remote-admin",
          displayName: { en: "Remote Admin" },
          email: "remote@example.com",
          userScope: "CLIENT",
          companyId: 2,
          permission: 3,
          role: "USER",
        },
      }),
    );

    await expect(resolveServiceDeskRequestContext(request)).resolves.toEqual(
      expect.objectContaining({
        principal: expect.objectContaining({
          id: "canonical",
          companyId: 2,
          permission: 3,
          userScope: "CLIENT",
        }),
      }),
    );
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

  it("rejects an inactive own tenant and a non-operational selected tenant", async () => {
    const principalContext = {
      principal: {
        id: "admin",
        username: "admin",
        displayName: { en: "Admin" },
        email: "admin@example.com",
        userScope: "INTERNAL" as const,
        companyId: 1,
        permission: 9 as const,
        role: "ADMIN" as const,
        canUseSuperUser: null,
        canUseImpersonation: null,
      },
      dataScope: "REMOTE" as const,
      originalUsername: "admin",
      effectiveUsername: "admin",
    };
    backend.portalApiJson.mockResolvedValueOnce(
      Response.json({
        id: "1",
        companyId: 1,
        isOwnerTenant: true,
        active: false,
        operational: false,
      }),
    );

    await expect(
      resolveOperationalServiceDeskReadTarget({ request, principalContext }),
    ).rejects.toMatchObject({ status: 403 });

    backend.portalApiJson
      .mockResolvedValueOnce(
        Response.json({
          id: "1",
          companyId: 1,
          isOwnerTenant: true,
          active: true,
          operational: true,
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          id: "2",
          companyId: 2,
          isOwnerTenant: false,
          active: true,
          operational: false,
        }),
      );

    await expect(
      resolveOperationalServiceDeskReadTarget({
        request,
        principalContext,
        requestedTenantId: "2",
        requestedScope: "PORTAL",
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("forces a customer target to PORTAL and rejects customer INTERNAL scope", async () => {
    const principalContext = {
      principal: {
        id: "admin",
        username: "admin",
        displayName: { en: "Admin" },
        email: "admin@example.com",
        userScope: "INTERNAL" as const,
        companyId: 1,
        permission: 9 as const,
        role: "ADMIN" as const,
        canUseSuperUser: null,
        canUseImpersonation: null,
      },
      dataScope: "REMOTE" as const,
      originalUsername: "admin",
      effectiveUsername: "admin",
    };
    const ownerTenant = {
      id: "1",
      companyId: 1,
      isOwnerTenant: true,
      active: true,
      operational: true,
    };
    const customerTenant = {
      id: "2",
      companyId: 2,
      isOwnerTenant: false,
      active: true,
      operational: true,
    };
    backend.portalApiJson
      .mockResolvedValueOnce(Response.json(ownerTenant))
      .mockResolvedValueOnce(Response.json(customerTenant));

    await expect(
      resolveOperationalServiceDeskReadTarget({
        request,
        principalContext,
        requestedTenantId: "2",
      }),
    ).resolves.toEqual({ tenant: customerTenant, scope: "PORTAL" });

    backend.portalApiJson
      .mockResolvedValueOnce(Response.json(ownerTenant))
      .mockResolvedValueOnce(Response.json(customerTenant));
    await expect(
      resolveOperationalServiceDeskReadTarget({
        request,
        principalContext,
        requestedTenantId: "2",
        requestedScope: "INTERNAL",
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe("Service Desk settings resource orchestration", () => {
  const owner = {
    id: "owner-admin",
    username: "owner-admin",
    displayName: { en: "Owner Admin" },
    email: "owner@example.com",
    userScope: "INTERNAL",
    companyId: 1,
    permission: 9,
    role: "ADMIN",
  };
  const tenantAdmin = {
    ...owner,
    id: "tenant-admin",
    username: "tenant-admin",
    companyId: 2,
    userScope: "CLIENT",
  };
  const ownerTenant = {
    id: "1",
    companyId: 1,
    isOwnerTenant: true,
    active: true,
    operational: true,
  };
  const customerTenant = {
    id: "2",
    companyId: 2,
    isOwnerTenant: false,
    active: true,
    operational: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    requestAuth.getAuthToken.mockResolvedValue({
      username: owner.username,
      dataScope: "REMOTE",
    });
  });

  const useRemotePrincipal = (principal: typeof owner) => {
    requestAuth.getAuthToken.mockResolvedValue({
      username: principal.username,
      dataScope: "REMOTE",
    });
    backend.portalApiJson.mockImplementation(
      async (_request: NextRequest, options: { path: string }) => {
        if (options.path.startsWith("/users/")) {
          return Response.json({ data: principal });
        }
        if (options.path === "/service-desk/tenants/context") {
          return Response.json(
            principal.companyId === 1 ? ownerTenant : customerTenant,
          );
        }
        if (options.path.endsWith("/1/context")) {
          return Response.json(ownerTenant);
        }
        if (options.path.endsWith("/2/context")) {
          return Response.json(customerTenant);
        }
        return Response.json({}, { status: 404 });
      },
    );
  };

  it("pins a tenant administrator to the canonical own tenant", async () => {
    useRemotePrincipal(tenantAdmin);

    await expect(
      resolveAuthorizedSettingsTenant({ request, requestedTenantId: "2" }),
    ).resolves.toEqual(
      expect.objectContaining({
        adminType: "TENANT_ADMIN",
        tenant: customerTenant,
      }),
    );
    await expect(
      resolveAuthorizedSettingsTenant({ request, requestedTenantId: "1" }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it.each([
    ["CATEGORY", false, "manage"],
    ["APPROVAL_STEP", false, "read"],
    ["ASSIGNMENT_RULE", true, "manage"],
  ] as const)(
    "applies owner access to customer %s (manage=%s)",
    async (resource, manage, expectedAccess) => {
      useRemotePrincipal(owner);

      await expect(
        requireSettingsResourceAccess({
          request,
          requestedTenantId: "2",
          resource,
          scope: "PORTAL",
          manage,
        }),
      ).resolves.toEqual(expect.objectContaining({ access: expectedAccess }));
    },
  );

  it("enforces read-only customer approval access for an owner administrator", async () => {
    useRemotePrincipal(owner);

    await expect(
      requireSettingsResourceAccess({
        request,
        requestedTenantId: "2",
        resource: "APPROVAL_STEP",
        scope: "PORTAL",
        manage: true,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it.each([
    ["CATEGORY", false, "read"],
    ["APPROVAL_STEP", true, "manage"],
    ["ASSIGNMENT_RULE", false, "read"],
  ] as const)(
    "applies tenant-admin own PORTAL %s access",
    async (resource, manage, expectedAccess) => {
      useRemotePrincipal(tenantAdmin);

      await expect(
        requireSettingsResourceAccess({
          request,
          requestedTenantId: "2",
          resource,
          scope: "PORTAL",
          manage,
        }),
      ).resolves.toEqual(expect.objectContaining({ access: expectedAccess }));
    },
  );

  it("allows tenant-admin INTERNAL settings but denies tenant resource management", async () => {
    useRemotePrincipal(tenantAdmin);
    await expect(
      requireSettingsResourceAccess({
        request,
        requestedTenantId: "2",
        resource: "CATEGORY",
        scope: "INTERNAL",
        manage: true,
      }),
    ).resolves.toEqual(expect.objectContaining({ access: "manage" }));

    useRemotePrincipal(tenantAdmin);
    await expect(
      requireSettingsResourceAccess({
        request,
        requestedTenantId: "2",
        resource: "TENANT",
        scope: "PORTAL",
        manage: true,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("maps missing and failed REMOTE tenant context responses", async () => {
    useRemotePrincipal(owner);
    backend.portalApiJson.mockImplementationOnce(async () =>
      Response.json({ data: owner }),
    );
    backend.portalApiJson.mockImplementationOnce(async () =>
      Response.json({}, { status: 404 }),
    );
    await expect(
      resolveAuthorizedSettingsTenant({ request, requestedTenantId: "missing" }),
    ).rejects.toMatchObject({ status: 404 });

    useRemotePrincipal(owner);
    backend.portalApiJson.mockImplementationOnce(async () =>
      Response.json({ data: owner }),
    );
    backend.portalApiJson.mockImplementationOnce(async () =>
      Response.json({}, { status: 503 }),
    );
    await expect(
      resolveAuthorizedSettingsTenant({ request, requestedTenantId: "2" }),
    ).rejects.toMatchObject({ status: 503 });
  });
});
