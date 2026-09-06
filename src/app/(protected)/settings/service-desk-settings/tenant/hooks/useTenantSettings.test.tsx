// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Company } from "@/domain/organization";
import type { Tenant } from "@/domain/serviceDesk";

import { useTenantSettings } from "./useTenantSettings";

const mocks = vi.hoisted(() => ({
  createTenant: vi.fn(),
  deleteTenant: vi.fn(),
  mutationToast: vi.fn(),
  updateTenant: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/feature/serviceDesk/tenant/client", () => ({
  useCreateServiceDeskTenant: () => ({ mutateAsync: mocks.createTenant }),
  useUpdateServiceDeskTenant: () => ({ mutateAsync: mocks.updateTenant }),
  useDeleteServiceDeskTenant: () => ({ mutateAsync: mocks.deleteTenant }),
}));

vi.mock("@/lib/client/toast", () => ({
  useMutationToast: () => mocks.mutationToast,
}));

const companies: Company[] = [
  {
    id: "1",
    name: { en: "Owner" },
    code: "OWNER",
    isPortalOwner: true,
    active: true,
  },
  {
    id: "22",
    name: { en: "Customer A" },
    code: "A",
    isPortalOwner: false,
    active: true,
  },
  {
    id: "33",
    name: { en: "Customer B" },
    code: "B",
    isPortalOwner: false,
    active: true,
  },
  {
    id: "44",
    name: { en: "Customer C" },
    code: "C",
    isPortalOwner: false,
    active: true,
  },
];

const sourceTenants: Tenant[] = [
  {
    id: "tenant-owner",
    companyId: "1",
    name: { en: "Owner" },
    color: "#111111",
    active: true,
  },
  {
    id: "tenant-a",
    companyId: "22",
    name: { en: "Customer A" },
    color: "#222222",
    active: true,
  },
  {
    id: "tenant-b",
    companyId: "33",
    name: { en: "Customer B" },
    color: "#333333",
    active: true,
  },
];

afterEach(cleanup);

describe("useTenantSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTenant.mockImplementation(async (payload) => ({
      id: "tenant-c",
      ...payload,
    }));
    mocks.updateTenant.mockImplementation(async (payload) => payload);
    mocks.deleteTenant.mockResolvedValue(undefined);
  });

  it("never makes the portal owner tenant removable", () => {
    const { result } = renderHook(() =>
      useTenantSettings({ companies, sourceTenants }),
    );
    const owner = result.current.tenantList.tenants.find(
      (tenant) => tenant.companyId === "1",
    );

    act(() => result.current.tenantList.onSelectTenant(owner!));

    expect(result.current.tenantList.focusedTenantId).toBe("tenant-owner");
    expect(result.current.tenantList.selectedTenantIds).toEqual([]);
    expect(result.current.transferControls.canRemoveTenants).toBe(false);
  });

  it("preserves a dirty local edit when refreshed source data arrives", () => {
    let refreshedTenants = sourceTenants;
    const { result, rerender } = renderHook(() =>
      useTenantSettings({ companies, sourceTenants: refreshedTenants }),
    );

    act(() =>
      result.current.settingInfo.onTenantNameChange(
        "tenant-a",
        "en",
        "Local customer name",
      ),
    );
    refreshedTenants = sourceTenants.map((tenant) =>
      tenant.id === "tenant-a"
        ? { ...tenant, name: { en: "Server customer name" } }
        : tenant,
    );
    rerender();

    expect(
      result.current.tenantList.tenants.find(
        (tenant) => tenant.id === "tenant-a",
      )?.name.en,
    ).toBe("Local customer name");
    expect(result.current.pageHeader.canSave).toBe(true);
  });

  it("coordinates create, update, and delete mutations into one persisted draft", async () => {
    const { result } = renderHook(() =>
      useTenantSettings({ companies, sourceTenants }),
    );

    act(() => result.current.companyList.onSelectCompany("44"));
    act(() => result.current.transferControls.onAddTenants());
    act(() =>
      result.current.settingInfo.onTenantNameChange(
        "tenant-a",
        "en",
        "Customer A updated",
      ),
    );
    const tenantB = result.current.tenantList.tenants.find(
      (tenant) => tenant.id === "tenant-b",
    );
    act(() => result.current.tenantList.onSelectTenant(tenantB!));
    act(() => result.current.transferControls.onRemoveTenants());

    expect(result.current.pageHeader.canSave).toBe(true);
    await act(async () => result.current.pageHeader.onSave());

    expect(mocks.createTenant).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: "44", active: true }),
    );
    expect(mocks.updateTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "tenant-a",
        companyId: "22",
        name: expect.objectContaining({ en: "Customer A updated" }),
      }),
    );
    expect(mocks.deleteTenant).toHaveBeenCalledWith("tenant-b");
    await waitFor(() => expect(result.current.pageHeader.canSave).toBe(false));
    expect(result.current.tenantList.tenants.map((tenant) => tenant.id)).toEqual([
      "tenant-owner",
      "tenant-a",
      "tenant-c",
    ]);
    expect(mocks.mutationToast).toHaveBeenCalledWith(
      expect.any(Promise),
      "save",
      "serviceDeskSettings.common.tenant",
    );
  });
});
