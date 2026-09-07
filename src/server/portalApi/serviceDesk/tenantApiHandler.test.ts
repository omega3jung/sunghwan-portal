import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PortalApiMethod, PortalApiQuery } from "../types";
import type { ServiceDeskPortalApiContext } from "./serviceDeskPortalApiUtils";

const service = vi.hoisted(() => ({
  createTenant: vi.fn(),
  deactivateTenantById: vi.fn(),
  getServiceDeskSettingsTenantContext: vi.fn(),
  getServiceDeskSettingsTenantContextByCompanyId: vi.fn(),
  getTenantById: vi.fn(),
  getTenants: vi.fn(),
  updateTenantById: vi.fn(),
}));

vi.mock("@/server/data/serviceDesk/tenant", () => service);

import { handleTenantPortalApi } from "./tenantApiHandler";

const tenant = (id: number, companyId: number, active = true) => ({
  tenant_id: id,
  tenant_company_id: companyId,
  tenant_name: { en: `Tenant ${id}` },
  tenant_color: "#123456",
  tenant_active: active,
});

describe("REMOTE tenant handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getTenants.mockResolvedValue([
      tenant(1, 1),
      tenant(2, 2),
      tenant(3, 2, false),
    ]);
  });

  it("filters tenant collections by canonical company and active query", async () => {
    const response = await handleTenantPortalApi(
      context("/service-desk/tenants", "GET", undefined, {
        companyId: "2",
        active: "false",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      items: [tenant(3, 2, false)],
      total: 1,
    });
  });

  it("reads active filtering from a rule-group contract", async () => {
    const response = await handleTenantPortalApi(
      context("/service-desk/tenants", "GET", undefined, {
        filter: JSON.stringify({
          rules: [{ field: "active", operator: "=", value: true }],
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      items: [tenant(1, 1), tenant(2, 2)],
      total: 2,
    });
  });

  it("requires companyId for context lookup and returns not-found for absent contexts", async () => {
    const missingInput = await handleTenantPortalApi(
      context("/service-desk/tenants/context", "GET"),
    );
    expect(missingInput.status).toBe(400);

    service.getServiceDeskSettingsTenantContextByCompanyId.mockResolvedValue(null);
    const missing = await handleTenantPortalApi(
      context("/service-desk/tenants/context", "GET", undefined, {
        companyId: "2",
      }),
    );
    expect(missing.status).toBe(404);
  });

  it("decodes tenant context ids and returns the canonical stored context", async () => {
    const stored = {
      id: "tenant 2",
      companyId: 2,
      isOwnerTenant: false,
      active: true,
      operational: true,
    };
    service.getServiceDeskSettingsTenantContext.mockResolvedValue(stored);

    const response = await handleTenantPortalApi(
      context("/service-desk/tenants/tenant%202/context", "GET"),
    );

    expect(service.getServiceDeskSettingsTenantContext).toHaveBeenCalledWith(
      "tenant 2",
    );
    await expect(response.json()).resolves.toEqual(stored);
  });

  it("maps create and update bodies before invoking lifecycle services", async () => {
    service.createTenant.mockResolvedValue(tenant(2, 2));
    service.updateTenantById.mockResolvedValue(tenant(2, 2, false));
    const body = {
      tenant_id: 999,
      tenant_company_id: "2",
      tenant_name: { en: "Customer" },
      tenant_color: undefined,
      tenant_active: false,
    };

    const created = await handleTenantPortalApi(
      context("/service-desk/tenants", "POST", body),
    );
    expect(created.status).toBe(201);
    expect(service.createTenant).toHaveBeenCalledWith({
      tenant_company_id: 2,
      tenant_name: { en: "Customer" },
      tenant_color: "",
      tenant_active: false,
    });

    await handleTenantPortalApi(
      context("/service-desk/tenants/2", "PUT", body),
    );
    expect(service.updateTenantById).toHaveBeenCalledWith("2", {
      tenant_company_id: 2,
      tenant_name: { en: "Customer" },
      tenant_color: "",
      tenant_active: false,
    });
  });

  it("routes deactivation and detail reads to the lifecycle service", async () => {
    service.getTenantById.mockResolvedValue(tenant(2, 2));
    service.deactivateTenantById.mockResolvedValue(tenant(2, 2, false));

    expect(
      (await handleTenantPortalApi(context("/service-desk/tenants/2", "GET")))
        .status,
    ).toBe(200);
    expect(
      (await handleTenantPortalApi(context("/service-desk/tenants/2", "DELETE")))
        .status,
    ).toBe(200);
    expect(service.getTenantById).toHaveBeenCalledWith("2");
    expect(service.deactivateTenantById).toHaveBeenCalledWith("2");
  });

  it("rejects missing bodies and unsupported methods or paths", async () => {
    await expect(
      handleTenantPortalApi(context("/service-desk/tenants", "POST")),
    ).rejects.toMatchObject({ status: 400 });
    expect(
      (await handleTenantPortalApi(context("/service-desk/tenants", "PATCH")))
        .status,
    ).toBe(404);
    expect(
      (await handleTenantPortalApi(context("/service-desk/unknown", "GET")))
        .status,
    ).toBe(404);
  });
});

function context(
  path: string,
  method: PortalApiMethod,
  body?: object,
  query?: PortalApiQuery,
): ServiceDeskPortalApiContext {
  return {
    request: new NextRequest("http://localhost/internal"),
    options: { path, method, body, query, errorMessage: "request failed" },
    path,
    method,
  };
}
