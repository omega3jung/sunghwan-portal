import { describe, expect, it } from "vitest";

import type { AssignmentRule, MainCategory } from "@/domain/serviceDesk";

import { createAssignmentRuleTree } from "./mapper";

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
    subCategories: [
      {
        id: "subcategory-1",
        name: { en: "New account" },
        index: 1,
        active: true,
      },
    ],
  },
];

const assignmentRules: AssignmentRule[] = [
  {
    categoryId: "category-1",
    assignee: { jobFieldIds: ["field-1"], assigneeUsernames: [] },
  },
  {
    categoryId: "subcategory-1",
    assignee: { jobFieldIds: [], assigneeUsernames: ["employee-1"] },
  },
];

describe("createAssignmentRuleTree", () => {
  it("joins assignment rules to the supplied category collection", () => {
    const [category] = createAssignmentRuleTree(categories, assignmentRules);

    expect(category.data).toMatchObject({
      id: "category-1",
      jobFieldIds: ["field-1"],
      nodeType: "mainCategory",
    });
    expect(category.children[0].data).toMatchObject({
      id: "subcategory-1",
      assignmentRule: { assigneeUsernames: ["employee-1"] },
      nodeType: "subCategory",
    });
  });
});
