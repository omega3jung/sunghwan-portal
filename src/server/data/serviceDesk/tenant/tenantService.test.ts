import { beforeEach, describe, expect, it, vi } from "vitest";

const companyService = vi.hoisted(() => ({
  getActiveCompanies: vi.fn(),
}));
const repository = vi.hoisted(() => ({
  createTenantRow: vi.fn(),
  deactivateTenantRowById: vi.fn(),
  findActiveTenantRowByCompanyId: vi.fn(),
  findActiveTenantRowById: vi.fn(),
  findActiveTenantRows: vi.fn(),
  findTenantRowById: vi.fn(),
  findTenantRows: vi.fn(),
  hasLiveOperationalTicketsForTenant: vi.fn(),
  updateTenantRowById: vi.fn(),
}));

vi.mock("@/server/data/organization/company", () => companyService);
vi.mock("./tenantRepository", () => repository);

import {
  assertPortalOwnerTenantRemainsActive,
  createTenant,
  deactivateTenantById,
  getServiceDeskSettingsTenantContext,
  getServiceDeskSettingsTenantContextByCompanyId,
  getServiceDeskSettingsTenantContexts,
  updateTenantById,
} from "./tenantService";

const row = (id: number, companyId: number, active = true) => ({
  tn_id: id,
  tn_company_id: companyId,
  tn_name: { en: `Tenant ${id}` },
  tn_color: "#123456",
  tn_active: active,
});

const input = (companyId: number, active = true) => ({
  tenant_company_id: companyId,
  tenant_name: { en: `Tenant ${companyId}` },
  tenant_color: "#123456",
  tenant_active: active,
});

describe("Service Desk tenant lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository.findTenantRows.mockResolvedValue([]);
    repository.hasLiveOperationalTicketsForTenant.mockResolvedValue(false);
  });

  it("derives operational state from both tenant and active company state", async () => {
    repository.findTenantRows.mockResolvedValue([
      row(10, 1),
      row(20, 2),
      row(30, 3, false),
    ]);
    companyService.getActiveCompanies.mockResolvedValue([
      { company_id: 1 },
      { company_id: 3 },
    ]);

    await expect(getServiceDeskSettingsTenantContexts()).resolves.toEqual([
      expect.objectContaining({
        id: "10",
        companyId: 1,
        isOwnerTenant: true,
        active: true,
        operational: true,
      }),
      expect.objectContaining({
        id: "20",
        companyId: 2,
        isOwnerTenant: false,
        active: true,
        operational: false,
      }),
      expect.objectContaining({
        id: "30",
        companyId: 3,
        active: false,
        operational: false,
      }),
    ]);
  });

  it("looks up canonical contexts by tenant or company id", async () => {
    repository.findTenantRows.mockResolvedValue([row(10, 1), row(20, 2)]);
    companyService.getActiveCompanies.mockResolvedValue([
      { company_id: 1 },
      { company_id: 2 },
    ]);

    await expect(getServiceDeskSettingsTenantContext("20")).resolves.toEqual(
      expect.objectContaining({ id: "20", companyId: 2 }),
    );
    await expect(
      getServiceDeskSettingsTenantContextByCompanyId("1"),
    ).resolves.toEqual(expect.objectContaining({ id: "10", companyId: 1 }));
    await expect(
      getServiceDeskSettingsTenantContext("missing"),
    ).resolves.toBeNull();
  });

  it("rejects a duplicate tenant for the same company before writing", async () => {
    repository.findTenantRows.mockResolvedValue([row(10, 2)]);

    await expect(createTenant(input(2))).rejects.toMatchObject({ status: 409 });
    expect(repository.createTenantRow).not.toHaveBeenCalled();
  });

  it("maps a successful create and reports a persistence failure", async () => {
    repository.createTenantRow.mockResolvedValueOnce(row(20, 2));

    await expect(createTenant(input(2))).resolves.toEqual(
      expect.objectContaining({ tenant_id: 20, tenant_company_id: 2 }),
    );
    expect(repository.createTenantRow).toHaveBeenCalledWith(
      expect.objectContaining({ tn_company_id: 2, tn_active: true }),
    );

    repository.createTenantRow.mockResolvedValueOnce(null);
    await expect(createTenant(input(3))).rejects.toThrow(
      "Failed to create tenant.",
    );
  });

  it("distinguishes a missing tenant from a company mismatch on update", async () => {
    repository.findTenantRowById.mockResolvedValueOnce(null);
    await expect(updateTenantById(20, input(2))).rejects.toMatchObject({
      status: 404,
    });

    repository.findTenantRowById.mockResolvedValueOnce(row(20, 2));
    await expect(updateTenantById(20, input(3))).rejects.toMatchObject({
      status: 400,
    });
    expect(repository.updateTenantRowById).not.toHaveBeenCalled();
  });

  it("blocks deactivation while live operational tickets exist", async () => {
    repository.findTenantRowById.mockResolvedValue(row(20, 2));
    repository.hasLiveOperationalTicketsForTenant.mockResolvedValue(true);

    await expect(updateTenantById(20, input(2, false))).rejects.toMatchObject({
      status: 409,
    });
    await expect(deactivateTenantById(20)).rejects.toMatchObject({
      status: 409,
    });
    expect(repository.updateTenantRowById).not.toHaveBeenCalled();
    expect(repository.deactivateTenantRowById).not.toHaveBeenCalled();
  });

  it("rechecks live tickets when a concurrent update loses its target", async () => {
    repository.findTenantRowById.mockResolvedValue(row(20, 2));
    repository.hasLiveOperationalTicketsForTenant
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    repository.updateTenantRowById.mockResolvedValue(null);

    await expect(updateTenantById(20, input(2, false))).rejects.toMatchObject({
      status: 409,
    });
    expect(repository.hasLiveOperationalTicketsForTenant).toHaveBeenCalledTimes(
      2,
    );
  });

  it("returns not-found when a concurrent update disappears without live tickets", async () => {
    repository.findTenantRowById.mockResolvedValue(row(20, 2));
    repository.updateTenantRowById.mockResolvedValue(null);

    await expect(updateTenantById(20, input(2))).rejects.toMatchObject({
      status: 404,
    });
  });

  it("rechecks live tickets when a concurrent deactivation loses its target", async () => {
    repository.findTenantRowById.mockResolvedValue(row(20, 2));
    repository.hasLiveOperationalTicketsForTenant
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    repository.deactivateTenantRowById.mockResolvedValue(null);

    await expect(deactivateTenantById(20)).rejects.toMatchObject({
      status: 409,
    });
  });

  it("maps successful updates and deactivations", async () => {
    repository.findTenantRowById.mockResolvedValue(row(20, 2));
    repository.updateTenantRowById.mockResolvedValue(row(20, 2));
    repository.deactivateTenantRowById.mockResolvedValue(row(20, 2, false));

    await expect(updateTenantById(20, input(2))).resolves.toEqual(
      expect.objectContaining({ tenant_id: 20, tenant_active: true }),
    );
    await expect(deactivateTenantById(20)).resolves.toEqual(
      expect.objectContaining({ tenant_id: 20, tenant_active: false }),
    );
  });
});

describe("portal-owner tenant protection", () => {
  it("rejects PUT/DELETE deactivation for the owner tenant", () => {
    expect(() => assertPortalOwnerTenantRemainsActive(1, false)).toThrow();
    expect(() => assertPortalOwnerTenantRemainsActive(1, true)).not.toThrow();
    expect(() => assertPortalOwnerTenantRemainsActive(2, false)).not.toThrow();
  });
});
