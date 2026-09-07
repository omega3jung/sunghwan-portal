// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { CategoryApprovalSettings, MainCategory } from "@/domain/serviceDesk";

import { useApprovalStepTree } from "./useApprovalStepTree";

const categories: MainCategory[] = [
  {
    id: "category-1",
    name: { en: "Account" },
    index: 1,
    active: true,
    scope: "INTERNAL",
    defaultPriority: "medium",
    defaultRiskLevel: "medium",
    defaultSlaDays: 3,
    subCategories: [],
  },
];

const approvalSettings: CategoryApprovalSettings[] = [
  {
    ...categories[0],
    approvalSteps: [
      {
        id: "approval-1",
        name: { en: "Manager approval" },
        index: 1,
        categoryId: "category-1",
        stepAssignee: { type: "MANAGER", managerDistance: 1 },
      },
    ],
  },
];

afterEach(cleanup);

describe("useApprovalStepTree", () => {
  it("adds and removes approval steps only beneath category nodes", async () => {
    const { result } = renderHook(() =>
      useApprovalStepTree({
        contextKey: "tenant-1:INTERNAL",
        categories,
        approvalSteps: approvalSettings,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.addApprovalStep("category:category-1"));

    expect(result.current.tree[0].children).toHaveLength(2);
    expect(result.current.tree[0].children[1].data).toMatchObject({
      id: "newApproval:1",
      categoryId: "category-1",
      nodeType: "approvalStep",
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setSelectedId("newApproval:1");
      result.current.removeApprovalStep("newApproval:1");
    });

    expect(result.current.tree[0].children).toHaveLength(1);
    expect(result.current.selectedId).toBeNull();
  });

  it("does not add a child below an approval-step node", async () => {
    const { result } = renderHook(() =>
      useApprovalStepTree({
        contextKey: "tenant-1:INTERNAL",
        categories,
        approvalSteps: approvalSettings,
      }),
    );
    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.addApprovalStep("approval:approval-1"));

    expect(result.current.tree[0].children).toHaveLength(1);
    expect(result.current.isDirty).toBe(false);
  });
});
