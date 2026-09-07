import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  portalApiJson: vi.fn(),
  requireRoute: vi.fn(),
  requireResource: vi.fn(),
  localCategories: vi.fn(),
  localApproval: vi.fn(),
  localAssignment: vi.fn(),
  localTenants: vi.fn(),
  localCreateTenant: vi.fn(),
  getAuthToken: vi.fn(),
  isRemoteRequest: vi.fn(),
  resolveAdminContext: vi.fn(),
  resolveTenantAccess: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getAuthToken: mocks.getAuthToken,
  isRemoteRequest: mocks.isRemoteRequest,
  toApiErrorResponse: (error: Error) =>
    new Response(JSON.stringify({ message: error.message }), {
      status: "status" in error ? Number(error.status) : 500,
    }),
}));
vi.mock("@/app/api/_adapters/backend", () => ({ portalApiJson: mocks.portalApiJson }));
vi.mock("@/app/api/_adapters/serviceDesk", () => ({
  isServiceDeskSettingsRequest: () => true,
  parseCategoryScope: () => "PORTAL",
  requireServiceDeskSettingsRouteAccess: mocks.requireRoute,
  requireSettingsResourceAccess: mocks.requireResource,
  resolveAuthorizedSettingsTenant: vi.fn(),
  resolveOperationalServiceDeskReadTarget: vi.fn(),
  resolveServiceDeskRequestContext: vi.fn(),
  resolveServiceDeskSettingsAdminContext: mocks.resolveAdminContext,
  resolveTenantResourceAccess: mocks.resolveTenantAccess,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/settings/category", () => ({
  localListCategories: mocks.localCategories,
  localSaveCategoryTree: vi.fn(),
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/settings/approvalStep", () => ({
  getApprovalStepStore: vi.fn(),
  localListApprovalSteps: mocks.localApproval,
  localSaveApprovalStepTree: vi.fn(),
  normalizeCategoryApprovalSettings: vi.fn(),
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/settings/assignmentRule", () => ({
  localListAssignmentRules: mocks.localAssignment,
  localSaveAssignmentRuleTree: vi.fn(),
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/eligibility", () => ({
  assertApprovalAssigneeEligible: vi.fn(),
  assertAssignmentAssigneeEligible: vi.fn(),
  getServiceDeskCategoryContext: vi.fn(),
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/settings/tenant", () => ({
  localCreateTenant: mocks.localCreateTenant,
  localListTenants: mocks.localTenants,
}));

import { GET as getApproval } from "./approval-steps/route";
import { GET as getAssignment } from "./assignment-rules/route";
import { GET as getCategories } from "./categories/route";
import { GET as getTenants, POST as postTenant } from "./tenants/route";

const routes = [
  ["categories", getCategories, mocks.localCategories],
  ["approval-steps", getApproval, mocks.localApproval],
  ["assignment-rules", getAssignment, mocks.localAssignment],
] as const;

describe("Service Desk settings route orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireResource.mockResolvedValue(createAuthorization("LOCAL"));
    mocks.localCategories.mockReturnValue({ items: [] });
    mocks.localApproval.mockReturnValue({ items: [] });
    mocks.localAssignment.mockReturnValue({ items: [] });
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 204 }));
    mocks.getAuthToken.mockResolvedValue({ dataScope: "LOCAL" });
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.resolveAdminContext.mockResolvedValue({
      adminType: "TENANT_ADMIN",
      principal: { companyId: 2 },
    });
    mocks.resolveTenantAccess.mockReturnValue("manage");
    mocks.localTenants.mockReturnValue({
      items: [
        { id: "owner", companyId: 1 },
        { id: "customer", companyId: 2 },
      ],
    });
  });

  it.each(routes)(
    "pins LOCAL %s reads to the authorized tenant and category scope",
    async (resource, get, localList) => {
      const response = await get(createRequest(resource));

      expect(response.status).toBe(200);
      expect(mocks.requireRoute).toHaveBeenCalledOnce();
      expect(mocks.requireResource).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedTenantId: "requested-tenant",
          scope: "PORTAL",
        }),
      );
      const options = localList.mock.calls[0][0];
      expect(options.isInternal).toBe(false);
      expect(options.searchParams.get("tenantId")).toBe("authorized-tenant");
      expect(options.searchParams.get("scope")).toBe("PORTAL");
      expect(options.searchParams.get("isInternal")).toBe("false");
    },
  );

  it.each(routes)(
    "forwards the same authorized target for REMOTE %s reads",
    async (resource, get, localList) => {
      mocks.requireResource.mockResolvedValue(createAuthorization("REMOTE"));

      await get(createRequest(resource));

      expect(localList).not.toHaveBeenCalled();
      const options = mocks.portalApiJson.mock.calls[0][1];
      expect(options.path).toBe(`/service-desk/${resource}`);
      expect(options.query.get("tenantId")).toBe("authorized-tenant");
      expect(options.query.get("scope")).toBe("PORTAL");
      expect(options.query.get("isInternal")).toBe("false");
    },
  );

  it("pins a tenant administrator's tenant list to the canonical company", async () => {
    const response = await getTenants(
      new NextRequest("http://localhost/api/service-desk/tenants?context=settings"),
    );

    await expect(response.json()).resolves.toEqual({
      items: [{ id: "customer", companyId: 2 }],
      total: 1,
    });
  });

  it("rejects tenant creation before runtime selection when the principal cannot manage tenants", async () => {
    mocks.resolveTenantAccess.mockReturnValue("none");
    const response = await postTenant(
      new NextRequest("http://localhost/api/service-desk/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: 3, name: { en: "Customer" } }),
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
    expect(mocks.localCreateTenant).not.toHaveBeenCalled();
  });
});

function createAuthorization(dataScope: "LOCAL" | "REMOTE") {
  return {
    dataScope,
    effectiveUsername: "admin",
    principal: { username: "admin", userScope: "CLIENT", companyId: 2 },
    tenant: {
      id: "authorized-tenant",
      companyId: 2,
      isOwnerTenant: false,
      active: true,
      operational: true,
    },
  };
}

function createRequest(resource: string) {
  return new NextRequest(
    `http://localhost/api/service-desk/${resource}?context=settings&tenantId=requested-tenant&scope=PORTAL`,
  );
}
