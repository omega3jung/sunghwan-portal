// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Tenant } from "@/domain/serviceDesk";

import { useServiceDeskSettingsScopeAccess } from "./useServiceDeskSettingsScopeAccess";

const mocks = vi.hoisted(() => ({
  useSettingsAccess: vi.fn(),
  useTenantSelection: vi.fn(),
}));

vi.mock("../../_providers", () => ({
  useSettingsAccess: mocks.useSettingsAccess,
}));

vi.mock("../ServiceDeskSettingsTenantSelectionProvider", () => ({
  useTenantSelection: mocks.useTenantSelection,
}));

const tenants: Tenant[] = [
  {
    id: "tenant-owner",
    companyId: "1",
    name: { en: "Owner" },
    color: "#111111",
    active: true,
  },
  {
    id: "tenant-customer",
    companyId: "22",
    name: { en: "Customer" },
    color: "#222222",
    active: true,
  },
];

afterEach(cleanup);

describe("useServiceDeskSettingsScopeAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useTenantSelection.mockReturnValue({
      selectedTenant: "tenant-customer",
      tenantData: tenants,
    });
  });

  it("falls back to the only readable scope for an owner approval-step editor", async () => {
    mocks.useSettingsAccess.mockReturnValue({
      principal: { permission: 9, userScope: "INTERNAL", companyId: 1 },
    });

    const { result } = renderHook(() =>
      useServiceDeskSettingsScopeAccess("APPROVAL_STEP"),
    );

    await waitFor(() => expect(result.current.selectedScope).toBe("PORTAL"));
    expect(result.current).toMatchObject({
      availableScopes: ["PORTAL"],
      access: "read",
      canRead: true,
      canManage: false,
      contextKey: "tenant-customer:PORTAL",
      ownerCompanyId: "1",
    });
  });

  it("combines tenant identity, resource, and scope into capabilities", () => {
    mocks.useSettingsAccess.mockReturnValue({
      principal: { permission: 9, userScope: "CLIENT", companyId: 22 },
    });

    const { result } = renderHook(() =>
      useServiceDeskSettingsScopeAccess("CATEGORY"),
    );

    expect(result.current).toMatchObject({
      selectedScope: "INTERNAL",
      availableScopes: ["INTERNAL", "PORTAL"],
      access: "manage",
      canManage: true,
    });

    act(() => result.current.selectScope("PORTAL"));

    expect(result.current).toMatchObject({
      selectedScope: "PORTAL",
      access: "read",
      canRead: true,
      canManage: false,
    });
  });

  it("fails closed when a tenant administrator selects another company", () => {
    mocks.useSettingsAccess.mockReturnValue({
      principal: { permission: 9, userScope: "CLIENT", companyId: 33 },
    });

    const { result } = renderHook(() =>
      useServiceDeskSettingsScopeAccess("ASSIGNMENT_RULE"),
    );

    expect(result.current.availableScopes).toEqual([]);
    expect(result.current.canRead).toBe(false);
    expect(result.current.canManage).toBe(false);
  });
});
