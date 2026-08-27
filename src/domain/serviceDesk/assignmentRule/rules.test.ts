import { describe, expect, it } from "vitest";

import type { AssignmentRule } from "./model";
import {
  canActivateCategory,
  hasAssignmentRuleSelection,
  resolveEffectiveAssignmentRule,
} from "./rules";

const tenantCompanyId = "tenant";
const ownerCompanyId = "owner";
const internalCategoryContext = {
  scope: "INTERNAL" as const,
  tenantCompanyId,
  ownerCompanyId,
};
const activeJobFields = [
  { id: "10", active: true, companyId: tenantCompanyId },
];
const activeEmployees = [
  {
    username: "active.user",
    active: true,
    companyId: tenantCompanyId,
  },
];

describe("assignment readiness", () => {
  it("rejects an empty assignment selection", () => {
    expect(
      hasAssignmentRuleSelection({ jobFieldIds: [], assigneeUsernames: [] }),
    ).toBe(false);
  });

  it("allows either an active Job Field or an active Employee reference", () => {
    const jobFieldRule: AssignmentRule = {
      categoryId: "1",
      assignee: { jobFieldIds: ["10"], assigneeUsernames: [] },
    };
    const employeeRule: AssignmentRule = {
      categoryId: "2",
      assignee: {
        jobFieldIds: [],
        assigneeUsernames: ["active.user"],
      },
    };

    expect(
      canActivateCategory({
        ...internalCategoryContext,
        assignmentRules: [jobFieldRule],
        categoryId: "1",
        jobFields: activeJobFields,
        employees: [],
      }),
    ).toBe(true);
    expect(
      canActivateCategory({
        ...internalCategoryContext,
        assignmentRules: [employeeRule],
        categoryId: "2",
        jobFields: [],
        employees: activeEmployees,
      }),
    ).toBe(true);
  });

  it("rejects missing rules and inactive references", () => {
    const inactiveRule: AssignmentRule = {
      categoryId: "1",
      assignee: {
        jobFieldIds: ["10"],
        assigneeUsernames: ["inactive.user"],
      },
    };

    expect(
      canActivateCategory({
        ...internalCategoryContext,
        assignmentRules: [],
        categoryId: "1",
        jobFields: activeJobFields,
        employees: activeEmployees,
      }),
    ).toBe(false);
    expect(
      canActivateCategory({
        ...internalCategoryContext,
        assignmentRules: [inactiveRule],
        categoryId: "1",
        jobFields: [
          { id: "10", active: false, companyId: tenantCompanyId },
        ],
        employees: [
          {
            username: "inactive.user",
            active: false,
            companyId: tenantCompanyId,
          },
        ],
      }),
    ).toBe(false);
  });

  it("uses a parent rule only when the subcategory has no own rule", () => {
    const parentRule: AssignmentRule = {
      categoryId: "1",
      assignee: { jobFieldIds: ["10"], assigneeUsernames: [] },
    };
    const invalidOwnRule: AssignmentRule = {
      categoryId: "2",
      assignee: { jobFieldIds: ["99"], assigneeUsernames: [] },
    };

    expect(resolveEffectiveAssignmentRule([parentRule], "2", "1")).toBe(
      parentRule,
    );
    expect(
      resolveEffectiveAssignmentRule([parentRule, invalidOwnRule], "2", "1"),
    ).toBe(invalidOwnRule);
    expect(
      canActivateCategory({
        ...internalCategoryContext,
        assignmentRules: [parentRule, invalidOwnRule],
        categoryId: "2",
        mainCategoryId: "1",
        jobFields: activeJobFields,
        employees: [],
      }),
    ).toBe(false);
  });
});
