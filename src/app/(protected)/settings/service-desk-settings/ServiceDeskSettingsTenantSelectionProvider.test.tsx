// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Tenant } from "@/domain/serviceDesk";

import {
  ServiceDeskSettingsTenantSelectionProvider,
  useTenantSelection,
} from "./ServiceDeskSettingsTenantSelectionProvider";

const mocks = vi.hoisted(() => ({
  useSettingsAccess: vi.fn(),
  useTenantListQuery: vi.fn(),
}));

vi.mock("@/feature/serviceDesk/tenant/client", () => ({
  useServiceDeskTenantListQuery: mocks.useTenantListQuery,
}));

vi.mock("../_providers", () => ({
  useSettingsAccess: mocks.useSettingsAccess,
}));

const ownerTenant: Tenant = {
  id: "tenant-owner",
  companyId: "1",
  name: { en: "Owner" },
  color: "#111111",
  active: true,
};

const customerTenant: Tenant = {
  id: "tenant-customer",
  companyId: "22",
  name: { en: "Customer" },
  color: "#222222",
  active: true,
};

const anotherTenant: Tenant = {
  id: "tenant-another",
  companyId: "33",
  name: { en: "Another" },
  color: "#333333",
  active: true,
};

function wrapper({ children }: PropsWithChildren) {
  return (
    <ServiceDeskSettingsTenantSelectionProvider>
      {children}
    </ServiceDeskSettingsTenantSelectionProvider>
  );
}

afterEach(cleanup);

describe("ServiceDeskSettingsTenantSelectionProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useTenantListQuery.mockReturnValue({
      data: [ownerTenant, customerTenant, anotherTenant],
      isLoading: false,
    });
  });

  it("pins a tenant administrator to their own company tenant", async () => {
    mocks.useSettingsAccess.mockReturnValue({
      type: "TENANT_ADMIN",
      principal: { companyId: 22 },
    });
    const { result, rerender } = renderHook(() => useTenantSelection(), {
      wrapper,
    });

    await waitFor(() =>
      expect(result.current.selectedTenant).toBe("tenant-customer"),
    );

    act(() => result.current.setSelectedTenant("tenant-another"));
    mocks.useTenantListQuery.mockReturnValue({
      data: [...[ownerTenant, customerTenant, anotherTenant]],
      isLoading: false,
    });
    rerender();

    await waitFor(() =>
      expect(result.current.selectedTenant).toBe("tenant-customer"),
    );
    expect(mocks.useTenantListQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        settings: true,
        settingsPrincipalKey: "TENANT_ADMIN:22",
      }),
    );
  });

  it("lets an owner administrator keep a valid explicit selection", async () => {
    mocks.useSettingsAccess.mockReturnValue({
      type: "OWNER_ADMIN",
      principal: { companyId: 1 },
    });
    const { result, rerender } = renderHook(() => useTenantSelection(), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.selectedTenant).toBe("tenant-owner"),
    );

    act(() => result.current.setSelectedTenant("tenant-another"));
    rerender();

    expect(result.current.selectedTenant).toBe("tenant-another");
  });

  it("resets the selection when the settings identity changes", async () => {
    let access = {
      type: "OWNER_ADMIN",
      principal: { companyId: 1 },
    };
    mocks.useSettingsAccess.mockImplementation(() => access);
    const { result, rerender } = renderHook(() => useTenantSelection(), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.selectedTenant).toBe("tenant-owner"),
    );
    act(() => result.current.setSelectedTenant("tenant-another"));

    access = {
      type: "TENANT_ADMIN",
      principal: { companyId: 22 },
    };
    rerender();

    await waitFor(() =>
      expect(result.current.selectedTenant).toBe("tenant-customer"),
    );
  });
});
