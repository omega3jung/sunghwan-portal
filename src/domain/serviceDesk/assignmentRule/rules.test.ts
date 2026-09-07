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

  it("rejects active assignment references outside the INTERNAL tenant company", () => {
    const rule: AssignmentRule = {
      categoryId: "1",
      assignee: { jobFieldIds: ["owner-field"], assigneeUsernames: [] },
    };

    expect(
      canActivateCategory({
        ...internalCategoryContext,
        assignmentRules: [rule],
        categoryId: "1",
        jobFields: [
          { id: "owner-field", active: true, companyId: ownerCompanyId },
        ],
        employees: [],
      }),
    ).toBe(false);
  });

  it("uses provider references by default for PORTAL and includes tenant references only when configured", () => {
    const providerRule: AssignmentRule = {
      categoryId: "1",
      assignee: { jobFieldIds: ["provider-field"], assigneeUsernames: [] },
    };
    const tenantRule: AssignmentRule = {
      categoryId: "1",
      assignee: { jobFieldIds: ["tenant-field"], assigneeUsernames: [] },
    };
    const portalContext = {
      scope: "PORTAL" as const,
      tenantCompanyId,
      ownerCompanyId,
      categoryId: "1",
      employees: [],
      jobFields: [
        { id: "provider-field", active: true, companyId: ownerCompanyId },
        { id: "tenant-field", active: true, companyId: tenantCompanyId },
      ],
    };

    expect(
      canActivateCategory({
        ...portalContext,
        assignmentRules: [providerRule],
      }),
    ).toBe(true);
    expect(
      canActivateCategory({
        ...portalContext,
        assignmentRules: [tenantRule],
      }),
    ).toBe(false);
    expect(
      canActivateCategory({
        ...portalContext,
        assignmentRules: [
          {
            ...tenantRule,
            assignee: {
              ...tenantRule.assignee,
              includeTenantCompany: true,
            },
          },
        ],
      }),
    ).toBe(true);
  });
});
