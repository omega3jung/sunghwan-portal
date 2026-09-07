import { describe, expect, it } from "vitest";

import type {
  CategoryApprovalSettings,
  MainCategory,
} from "@/domain/serviceDesk";

import { createApprovalStepTree } from "./mapper";

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
    id: "category-1",
    name: { en: "Account" },
    index: 1,
    active: true,
    scope: "INTERNAL",
    defaultPriority: "medium",
    defaultRiskLevel: "medium",
    defaultSlaDays: 3,
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

describe("createApprovalStepTree", () => {
  it("joins approval steps to the supplied category collection", () => {
    const [category] = createApprovalStepTree(categories, approvalSettings);

    expect(category.data).toMatchObject({
      categoryId: "category-1",
      nodeType: "category",
    });
    expect(category.data).not.toHaveProperty("subCategories");
    expect(category.children[0].data).toMatchObject({
      approvalId: "approval-1",
      nodeType: "approvalStep",
    });
  });
});
