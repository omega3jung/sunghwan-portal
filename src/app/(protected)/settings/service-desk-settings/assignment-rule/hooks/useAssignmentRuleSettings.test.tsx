// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AssignmentRule, MainCategory, TenantCategoryTree } from "@/domain/serviceDesk";

import { createAssignmentRuleTree } from "../utils/mapper";
import { useAssignmentRuleSettings } from "./useAssignmentRuleSettings";

const mocks = vi.hoisted(() => ({
  acceptSavedTree: vi.fn(),
  assignmentRefetch: vi.fn(),
  categoryRefetch: vi.fn(),
  mutationToast: vi.fn(),
  saveTree: vi.fn(),
  useAssignmentQuery: vi.fn(),
  useAssignmentTree: vi.fn(),
  useCategoryQuery: vi.fn(),
  useEditorState: vi.fn(),
  usePageContext: vi.fn(),
  useSaveTree: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/feature/serviceDesk/assignmentRule/client", () => ({
  useServiceDeskAssignmentRuleListQuery: mocks.useAssignmentQuery,
  useSaveServiceDeskAssignmentRuleTree: mocks.useSaveTree,
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

vi.mock("./useAssignmentRuleTree", () => ({
  useAssignmentRuleTree: mocks.useAssignmentTree,
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

const assignmentRules: AssignmentRule[] = [
  {
    categoryId: "category-1",
    assignee: {
      jobFieldIds: ["job-field-1"],
      assigneeUsernames: [],
      includeTenantCompany: true,
    },
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

const assignmentTree = createAssignmentRuleTree(categoryData[0].categories, assignmentRules);

afterEach(cleanup);

describe("useAssignmentRuleSettings", () => {
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
      ownerCompanyId: "1",
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
    mocks.useAssignmentQuery.mockReturnValue({
      data: assignmentRules,
      error: null,
      isLoading: false,
      refetch: mocks.assignmentRefetch,
    });
    mocks.useAssignmentTree.mockReturnValue({
      acceptSavedTree: mocks.acceptSavedTree,
      inheritedAssignee: null,
      isDirty: true,
      isReady: true,
      reset: vi.fn(),
      selectedNode: null,
      tree: assignmentTree,
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

  it("loads both category and assignment-rule data in the selected scope", () => {
    renderHook(() => useAssignmentRuleSettings());

    expect(mocks.useCategoryQuery).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      scope: "PORTAL",
      enabled: true,
    });
    expect(mocks.useAssignmentQuery).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      settings: true,
      context: "settings",
      scope: "PORTAL",
    });
  });

  it("saves normalized rules and accepts the persisted response as baseline", async () => {
    mocks.saveTree.mockResolvedValue(assignmentRules);
    const { result } = renderHook(() => useAssignmentRuleSettings());

    act(() => result.current.onSave());

    await waitFor(() => expect(mocks.saveTree).toHaveBeenCalledOnce());
    expect(mocks.saveTree).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      categories: [
        expect.objectContaining({
          id: "category-1",
          assignee: {
            jobFieldIds: ["job-field-1"],
            assigneeUsernames: [],
            includeTenantCompany: true,
          },
        }),
      ],
    });
    await waitFor(() => expect(mocks.acceptSavedTree).toHaveBeenCalledOnce());
    expect(mocks.acceptSavedTree.mock.calls[0][0][0].data).toMatchObject({
      id: "category-1",
      jobFieldIds: ["job-field-1"],
    });
  });

  it("retries category and assignment-rule queries together", () => {
    const { result } = renderHook(() => useAssignmentRuleSettings());

    act(() => result.current.onRetry());

    expect(mocks.categoryRefetch).toHaveBeenCalledOnce();
    expect(mocks.assignmentRefetch).toHaveBeenCalledOnce();
  });
});
