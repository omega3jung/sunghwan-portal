// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TenantPage } from "./TenantPage";

const mocks = vi.hoisted(() => ({
  companyListRender: vi.fn(),
  companyRefetch: vi.fn(),
  headerRender: vi.fn(),
  onReset: vi.fn(),
  onSave: vi.fn(),
  replace: vi.fn(),
  settingInfoRender: vi.fn(),
  tenantListRender: vi.fn(),
  tenantRefetch: vi.fn(),
  transferControlsRender: vi.fn(),
  useCompanyListQuery: vi.fn(),
  useCurrentSession: vi.fn(),
  useServiceDeskTenantListQuery: vi.fn(),
  useSettingsAccess: vi.fn(),
  useTenantSettings: vi.fn(),
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div>tenant data loading</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock("@/feature/auth/session/client", () => ({
  useCurrentSession: mocks.useCurrentSession,
}));

vi.mock("@/feature/organization/company/client", () => ({
  useCompanyListQuery: mocks.useCompanyListQuery,
}));

vi.mock("@/feature/serviceDesk/tenant/client", () => ({
  useServiceDeskTenantListQuery: mocks.useServiceDeskTenantListQuery,
}));

vi.mock("../../../_providers", () => ({
  useSettingsAccess: mocks.useSettingsAccess,
}));

vi.mock("../hooks/useTenantSettings", () => ({
  useTenantSettings: mocks.useTenantSettings,
}));

vi.mock("../../components/ServiceDeskSettingsPageHeader", () => ({
  ServiceDeskSettingsPageHeader: (props: {
    title: string;
    description: string;
    canReset: boolean;
    onReset: () => void;
    canSave: boolean;
    onSave: () => void;
    isSaving: boolean;
  }) => {
    mocks.headerRender(props);

    return (
      <header>
        <h1>{props.title}</h1>
        <p>{props.description}</p>
        <button type="button" disabled={!props.canReset} onClick={props.onReset}>
          reset tenant settings
        </button>
        <button type="button" disabled={!props.canSave} onClick={props.onSave}>
          save tenant settings
        </button>
      </header>
    );
  },
}));

vi.mock("../../components/ServiceDeskSettingsPageLoading", () => ({
  ServiceDeskSettingsPageLoading: () => <div>tenant access loading</div>,
}));

vi.mock("./CompanyList", () => ({
  CompanyList: (props: Record<string, unknown>) => {
    mocks.companyListRender(props);
    return <div>company list</div>;
  },
}));

vi.mock("./TenantList", () => ({
  TenantList: (props: Record<string, unknown>) => {
    mocks.tenantListRender(props);
    return <div>tenant list</div>;
  },
}));

vi.mock("./TenantSettingInfo", () => ({
  TenantSettingInfo: (props: Record<string, unknown>) => {
    mocks.settingInfoRender(props);
    return <div>tenant setting info</div>;
  },
}));

vi.mock("./TenantTransferControls", () => ({
  TenantTransferControls: (props: Record<string, unknown>) => {
    mocks.transferControlsRender(props);
    return <div>tenant transfer controls</div>;
  },
}));

const companies = [
  {
    id: "company-1",
    name: { en: "Customer" },
    code: "CUSTOMER",
    isPortalOwner: false,
    active: true,
  },
];

const tenants = [
  {
    id: "tenant-1",
    companyId: "company-1",
    name: { en: "Customer" },
    color: "#123456",
    active: true,
  },
];

function createQuery<T>(
  data: T,
  refetch: () => unknown,
  overrides: {
    data?: T;
    error?: Error | null;
    isLoading?: boolean;
  } = {},
) {
  return {
    data,
    error: null,
    isLoading: false,
    refetch,
    ...overrides,
  };
}

function createTenantSettings() {
  return {
    pageHeader: {
      canReset: true,
      onReset: mocks.onReset,
      canSave: true,
      onSave: mocks.onSave,
      isSaving: false,
    },
    companyList: {
      companies,
      selectedCompanyIds: [],
      canSelectCompanies: true,
      onSelectCompany: vi.fn(),
    },
    transferControls: {
      canAddTenants: true,
      canRemoveTenants: false,
      onAddTenants: vi.fn(),
      onRemoveTenants: vi.fn(),
    },
    tenantList: {
      tenants,
      selectedTenantIds: [],
      focusedTenantId: "tenant-1",
      canSelectTenants: true,
      onSelectTenant: vi.fn(),
    },
    settingInfo: {
      tenant: tenants[0],
      canEditTenant: true,
      onTenantNameChange: vi.fn(),
      onTenantColorChange: vi.fn(),
    },
  };
}

afterEach(cleanup);

describe("TenantPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSettingsAccess.mockReturnValue({ type: "OWNER_ADMIN" });
    mocks.useCurrentSession.mockReturnValue({ status: "authenticated" });
    mocks.useCompanyListQuery.mockReturnValue(
      createQuery(companies, mocks.companyRefetch),
    );
    mocks.useServiceDeskTenantListQuery.mockReturnValue(
      createQuery(tenants, mocks.tenantRefetch),
    );
    mocks.useTenantSettings.mockReturnValue(createTenantSettings());
    mocks.onSave.mockResolvedValue(undefined);
  });

  it("redirects non-owner administrators without starting owner-only queries", async () => {
    mocks.useSettingsAccess.mockReturnValue({ type: "TENANT_ADMIN" });

    render(<TenantPage />);

    expect(screen.getByText("tenant access loading")).toBeInTheDocument();
    expect(mocks.useCompanyListQuery).not.toHaveBeenCalled();
    expect(mocks.useServiceDeskTenantListQuery).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/settings");
    });
  });

  it.each([
    "session",
    "company query",
    "tenant query",
    "company data",
    "tenant data",
  ] as const)("keeps the settings hidden while %s is loading", (pendingSource) => {
    if (pendingSource === "session") {
      mocks.useCurrentSession.mockReturnValue({ status: "loading" });
    } else if (pendingSource === "company query") {
      mocks.useCompanyListQuery.mockReturnValue(
        createQuery(companies, mocks.companyRefetch, { isLoading: true }),
      );
    } else if (pendingSource === "tenant query") {
      mocks.useServiceDeskTenantListQuery.mockReturnValue(
        createQuery(tenants, mocks.tenantRefetch, { isLoading: true }),
      );
    } else if (pendingSource === "company data") {
      mocks.useCompanyListQuery.mockReturnValue(
        createQuery(companies, mocks.companyRefetch, { data: undefined }),
      );
    } else {
      mocks.useServiceDeskTenantListQuery.mockReturnValue(
        createQuery(tenants, mocks.tenantRefetch, { data: undefined }),
      );
    }

    render(<TenantPage />);

    expect(screen.getByText("tenant data loading")).toBeInTheDocument();
    expect(screen.queryByText("company list")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it.each(["company", "tenant"] as const)(
    "shows an error and retries both queries when the %s query fails",
    async (failedQuery) => {
      const user = userEvent.setup();
      const failedResult = {
        data: undefined,
        error: new Error("load failed"),
        isLoading: false,
      };

      if (failedQuery === "company") {
        mocks.useCompanyListQuery.mockReturnValue({
          ...failedResult,
          refetch: mocks.companyRefetch,
        });
      } else {
        mocks.useServiceDeskTenantListQuery.mockReturnValue({
          ...failedResult,
          refetch: mocks.tenantRefetch,
        });
      }

      render(<TenantPage />);

      expect(
        screen.getByText("Failed to load tenant settings."),
      ).toBeInTheDocument();
      expect(screen.queryByText("tenant data loading")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Retry" }));

      expect(mocks.companyRefetch).toHaveBeenCalledOnce();
      expect(mocks.tenantRefetch).toHaveBeenCalledOnce();
    },
  );

  it("composes the editable tenant settings from both query results", async () => {
    const user = userEvent.setup();
    const settings = createTenantSettings();
    mocks.useTenantSettings.mockReturnValue(settings);

    render(<TenantPage />);

    expect(mocks.useCompanyListQuery).toHaveBeenCalledWith({});
    expect(mocks.useServiceDeskTenantListQuery).toHaveBeenCalledWith({
      settings: true,
      context: "settings",
    });
    expect(mocks.useTenantSettings).toHaveBeenCalledWith({
      companies,
      sourceTenants: tenants,
    });
    expect(mocks.headerRender).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "serviceDeskSettings.common.tenant",
        description:
          "settingsNavigation.serviceDeskSettings.tenant.description",
        canReset: true,
        canSave: true,
        isSaving: false,
      }),
    );
    expect(mocks.companyListRender).toHaveBeenCalledWith(
      expect.objectContaining(settings.companyList),
    );
    expect(mocks.transferControlsRender).toHaveBeenCalledWith(
      expect.objectContaining(settings.transferControls),
    );
    expect(mocks.tenantListRender).toHaveBeenCalledWith(
      expect.objectContaining(settings.tenantList),
    );
    expect(mocks.settingInfoRender).toHaveBeenCalledWith(
      expect.objectContaining(settings.settingInfo),
    );

    await user.click(
      screen.getByRole("button", { name: "reset tenant settings" }),
    );
    await user.click(
      screen.getByRole("button", { name: "save tenant settings" }),
    );

    expect(mocks.onReset).toHaveBeenCalledOnce();
    expect(mocks.onSave).toHaveBeenCalledOnce();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("prevents reset while tenant settings are being saved", () => {
    const settings = createTenantSettings();
    settings.pageHeader.isSaving = true;
    mocks.useTenantSettings.mockReturnValue(settings);

    render(<TenantPage />);

    expect(mocks.headerRender).toHaveBeenCalledWith(
      expect.objectContaining({ canReset: false, isSaving: true }),
    );
    expect(
      screen.getByRole("button", { name: "reset tenant settings" }),
    ).toBeDisabled();
  });
});
