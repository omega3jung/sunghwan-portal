// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MainCategory, TenantCategoryTree } from "@/domain/serviceDesk";

import type { CategoryData } from "../types";
import { useCategorySettings } from "./useCategorySettings";

// The factories passed to vi.mock are hoisted above imports. vi.hoisted makes
// these shared spies available when those factories are evaluated.
const mocks = vi.hoisted(() => ({
  acceptSavedTree: vi.fn(),
  assignmentRefetch: vi.fn(),
  categoryRefetch: vi.fn(),
  mutationToast: vi.fn(),
  saveCategoryTree: vi.fn(),
  useAssignmentRuleQuery: vi.fn(),
  useCategoryListQuery: vi.fn(),
  useCategoryTree: vi.fn(),
  useEditorState: vi.fn(),
  useOrganizationData: vi.fn(),
  usePageContext: vi.fn(),
  useSaveCategoryTree: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/feature/serviceDesk/assignmentRule/client", () => ({
  useServiceDeskAssignmentRuleListQuery: mocks.useAssignmentRuleQuery,
}));

vi.mock("@/feature/serviceDesk/category/client", () => ({
  useSaveServiceDeskCategoryTree: mocks.useSaveCategoryTree,
}));

vi.mock("@/lib/client/toast", () => ({
  useMutationToast: () => mocks.mutationToast,
}));

vi.mock("../../hooks/useServiceDeskSettingsCategoryListQuery", () => ({
  useServiceDeskSettingsCategoryListQuery: mocks.useCategoryListQuery,
}));

vi.mock("../../hooks/useServiceDeskSettingsEditorState", () => ({
  useServiceDeskSettingsEditorState: mocks.useEditorState,
}));

vi.mock("../../hooks/useServiceDeskSettingsOrganizationData", () => ({
  useServiceDeskSettingsOrganizationData: mocks.useOrganizationData,
}));

vi.mock("../../hooks/useServiceDeskSettingsPageContext", () => ({
  useServiceDeskSettingsPageContext: mocks.usePageContext,
}));

vi.mock("./useCategoryTree", () => ({
  useCategoryTree: mocks.useCategoryTree,
}));

const portalCategory: MainCategory = {
  id: "category-1",
  name: { en: "Account" },
  index: 1,
  active: false,
  scope: "PORTAL",
  defaultPriority: "medium",
  defaultRiskLevel: "medium",
  defaultSlaDays: 3,
  subCategories: [],
};

const internalCategory: MainCategory = {
  ...portalCategory,
  id: "category-2",
  name: { en: "Internal support" },
  scope: "INTERNAL",
};

const selectedNode: CategoryData = {
  id: portalCategory.id,
  name: portalCategory.name,
  index: portalCategory.index,
  active: portalCategory.active,
  scope: portalCategory.scope,
  defaultPriority: portalCategory.defaultPriority,
  defaultRiskLevel: portalCategory.defaultRiskLevel,
  defaultSlaDays: portalCategory.defaultSlaDays,
  nodeType: "category",
  isCreated: false,
};

const categoryTree = [
  {
    id: selectedNode.id,
    data: selectedNode,
    collapsed: false,
    maximum: 20,
    children: [],
  },
];

function createSavedTenant(categories: MainCategory[]): TenantCategoryTree {
  return {
    id: "tenant-1",
    companyId: "company-1",
    name: { en: "Customer tenant" },
    color: "#2563eb",
    active: true,
    categories,
  };
}

afterEach(cleanup);

describe("useCategorySettings", () => {
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
      selectedTenantData: { companyId: "company-1" },
      selectScope: vi.fn(),
      setLanguage: vi.fn(),
    });
    mocks.useCategoryListQuery.mockReturnValue({
      data: [createSavedTenant([portalCategory])],
      error: null,
      isLoading: false,
      refetch: mocks.categoryRefetch,
    });
    mocks.useAssignmentRuleQuery.mockReturnValue({
      data: [
        {
          categoryId: "category-1",
          assignee: { jobFieldIds: ["job-field-1"], assigneeUsernames: [] },
        },
      ],
      error: null,
      isLoading: false,
      refetch: mocks.assignmentRefetch,
    });
    mocks.useOrganizationData.mockReturnValue({
      employees: [],
      jobFields: [
        {
          id: "job-field-1",
          active: true,
          companyId: "1",
        },
      ],
    });
    mocks.useCategoryTree.mockReturnValue({
      acceptSavedTree: mocks.acceptSavedTree,
      isDirty: true,
      isReady: true,
      reset: vi.fn(),
      selectedNode,
      selectedParentCategory: null,
      tree: categoryTree,
    });
    mocks.useEditorState.mockReturnValue({
      canReset: true,
      canSave: true,
      hasError: false,
      isLoading: false,
      onReset: vi.fn(),
      toolbar: {
        scope: {
          value: "PORTAL",
          availableScopes: ["PORTAL"],
          onValueChange: vi.fn(),
        },
        language: { value: "en", onValueChange: vi.fn() },
      },
    });
    mocks.useSaveCategoryTree.mockReturnValue({
      isPending: false,
      mutateAsync: mocks.saveCategoryTree,
    });
  });

  it("retries both category and assignment-rule queries after a load failure", () => {
    // Arrange
    const { result } = renderHook(() => useCategorySettings());

    // Act
    act(() => result.current.onRetry());

    // Assert
    expect(mocks.categoryRefetch).toHaveBeenCalledOnce();
    expect(mocks.assignmentRefetch).toHaveBeenCalledOnce();
  });

  it("allows activation when the effective assignment rule has an active reference", () => {
    const { result } = renderHook(() => useCategorySettings());

    expect(result.current.tree.canActivateCategory).toBe(true);
  });

  it("saves the current scope and accepts the persisted tree as the new baseline", async () => {
    mocks.saveCategoryTree.mockResolvedValue(
      createSavedTenant([portalCategory, internalCategory]),
    );
    const { result } = renderHook(() => useCategorySettings());

    act(() => result.current.onSave());

    await waitFor(() => expect(mocks.saveCategoryTree).toHaveBeenCalledOnce());
    expect(mocks.saveCategoryTree).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      categories: [
        expect.objectContaining({
          id: "category-1",
          index: 1,
          scope: "PORTAL",
        }),
      ],
    });
    await waitFor(() => expect(mocks.acceptSavedTree).toHaveBeenCalledOnce());

    const [acceptedTree] = mocks.acceptSavedTree.mock.calls[0];
    expect(acceptedTree).toHaveLength(1);
    expect(acceptedTree[0].data).toMatchObject({
      id: "category-1",
      scope: "PORTAL",
    });
  });
});
