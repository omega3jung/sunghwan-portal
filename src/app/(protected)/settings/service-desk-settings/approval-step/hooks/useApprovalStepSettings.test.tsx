// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CategoryApprovalSettings,
  MainCategory,
  TenantCategoryTree,
} from "@/domain/serviceDesk";

import { createApprovalStepTree } from "../utils/mapper";
import { useApprovalStepSettings } from "./useApprovalStepSettings";

const mocks = vi.hoisted(() => ({
  acceptSavedTree: vi.fn(),
  approvalRefetch: vi.fn(),
  categoryRefetch: vi.fn(),
  mutationToast: vi.fn(),
  saveTree: vi.fn(),
  useApprovalQuery: vi.fn(),
  useApprovalTree: vi.fn(),
  useCategoryQuery: vi.fn(),
  useEditorState: vi.fn(),
  usePageContext: vi.fn(),
  useSaveTree: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/feature/serviceDesk/approvalStep/client", () => ({
  useServiceDeskApprovalStepListQuery: mocks.useApprovalQuery,
  useSaveServiceDeskApprovalStepTree: mocks.useSaveTree,
}));

vi.mock("@/lib/client/toast", () => ({
  useMutationToast: () => mocks.mutationToast,
}));

vi.mock("../../hooks/useServiceDeskSettingsCategoryListQuery", () => ({
  useServiceDeskSettingsCategoryListQuery: mocks.useCategoryQuery,
}));

vi.mock("../../hooks/useServiceDeskSettingsEditorState", () => ({
  useServiceDeskSettingsEditorState: mocks.useEditorState,
}));

vi.mock("../../hooks/useServiceDeskSettingsPageContext", () => ({
  useServiceDeskSettingsPageContext: mocks.usePageContext,
}));

vi.mock("./useApprovalStepTree", () => ({
  useApprovalStepTree: mocks.useApprovalTree,
}));

const category: MainCategory = {
  id: "category-1",
  name: { en: "Account" },
  index: 1,
  active: true,
  scope: "PORTAL",
  defaultPriority: "medium",
  defaultRiskLevel: "medium",
  defaultSlaDays: 3,
  subCategories: [],
};

const approvalSettings: CategoryApprovalSettings[] = [
  {
    ...category,
    approvalSteps: [
      {
        id: "approval-1",
        name: { en: "Manager approval" },
        index: 1,
        categoryId: category.id,
        stepAssignee: { type: "MANAGER", managerDistance: 1 },
      },
    ],
  },
];

const categoryData: TenantCategoryTree[] = [
  {
    id: "tenant-1",
    companyId: "22",
    name: { en: "Customer" },
    color: "#222222",
    active: true,
    categories: [category],
  },
];

const approvalTree = createApprovalStepTree(categoryData[0].categories, approvalSettings);

afterEach(cleanup);

describe("useApprovalStepSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePageContext.mockReturnValue({
      access: "manage",
      availableScopes: ["PORTAL"],
      canManage: true,
      canRead: true,
      contextKey: "tenant-1:PORTAL",
      isTenantSelectionLoading: false,
      language: "en",
      selectedScope: "PORTAL",
      selectedTenant: "tenant-1",
      selectedTenantData: { companyId: "22" },
      selectScope: vi.fn(),
      setLanguage: vi.fn(),
    });
    mocks.useCategoryQuery.mockReturnValue({
      data: categoryData,
      error: null,
      isLoading: false,
      refetch: mocks.categoryRefetch,
    });
    mocks.useApprovalQuery.mockReturnValue({
      data: approvalSettings,
      error: null,
      isLoading: false,
      refetch: mocks.approvalRefetch,
    });
    mocks.useApprovalTree.mockReturnValue({
      acceptSavedTree: mocks.acceptSavedTree,
      isDirty: true,
      isReady: true,
      reset: vi.fn(),
      selectedNode: null,
      tree: approvalTree,
    });
    mocks.useEditorState.mockReturnValue({
      canReset: true,
      canSave: true,
      hasError: false,
      isLoading: false,
      onReset: vi.fn(),
      toolbar: {},
    });
    mocks.useSaveTree.mockReturnValue({
      isPending: false,
      mutateAsync: mocks.saveTree,
    });
  });

  it("loads active categories and approval steps in the selected tenant scope", () => {
    renderHook(() => useApprovalStepSettings());

    expect(mocks.useCategoryQuery).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      scope: "PORTAL",
      enabled: true,
      active: true,
    });
    expect(mocks.useApprovalQuery).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      settings: true,
      context: "settings",
      scope: "PORTAL",
    });
  });

  it("saves the draft and replaces its baseline with persisted approval steps", async () => {
    mocks.saveTree.mockResolvedValue(approvalSettings);
    const { result } = renderHook(() => useApprovalStepSettings());

    act(() => result.current.onSave());

    await waitFor(() => expect(mocks.saveTree).toHaveBeenCalledOnce());
    expect(mocks.saveTree).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      categories: [
        expect.objectContaining({
          id: "category-1",
          approvalSteps: [expect.objectContaining({ id: "approval-1", index: 1 })],
        }),
      ],
    });
    await waitFor(() => expect(mocks.acceptSavedTree).toHaveBeenCalledOnce());
    expect(mocks.acceptSavedTree.mock.calls[0][0][0].children[0].data).toMatchObject({
      approvalId: "approval-1",
    });
  });

  it("retries both data sources after an orchestration failure", () => {
    const { result } = renderHook(() => useApprovalStepSettings());

    act(() => result.current.onRetry());

    expect(mocks.categoryRefetch).toHaveBeenCalledOnce();
    expect(mocks.approvalRefetch).toHaveBeenCalledOnce();
  });
});
