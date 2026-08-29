import { describe, expect, it } from "vitest";

import {
  createTenantSchema,
  saveApprovalStepTreeSchema,
  saveAssignmentRuleTreeSchema,
  saveCategoryTreeSchema,
} from "./requestSchemas";

describe("required localized canonical names", () => {
  it.each([
    createTenantSchema.safeParse({ companyId: "2", name: { en: "   " } }),
    saveCategoryTreeSchema.safeParse({
      tenantId: "1",
      categories: [
        {
          name: { en: "\t" },
          scope: "INTERNAL",
          index: 0,
          active: false,
          defaultPriority: "medium",
          defaultRiskLevel: "medium",
          defaultSlaDays: 1,
          subCategories: [],
        },
      ],
    }),
    saveApprovalStepTreeSchema.safeParse({
      tenantId: "1",
      categories: [
        {
          id: "10",
          approvalSteps: [
            {
              name: { en: "\n" },
              index: 0,
              stepAssignee: { type: "MANAGER", managerDistance: 1 },
            },
          ],
        },
      ],
    }),
  ])("rejects whitespace-only canonical names", (result) => {
    expect(result.success).toBe(false);
  });
});

describe("Service Desk settings request contracts", () => {
  it("applies force and assignment-company defaults to valid tree payloads", () => {
    const category = saveCategoryTreeSchema.parse({
      tenantId: "1",
      categories: [
        {
          name: { en: "Hardware" },
          description: { ko: "장비" },
          scope: "PORTAL",
          index: 0,
          active: true,
          defaultPriority: "medium",
          defaultRiskLevel: "medium",
          defaultSlaDays: 3,
          subCategories: [],
        },
      ],
    });
    const assignment = saveAssignmentRuleTreeSchema.parse({
      tenantId: "1",
      categories: [
        {
          id: "10",
          assignee: {
            jobFieldIds: ["20"],
            assigneeUsernames: [],
          },
          subCategories: [],
        },
      ],
    });

    expect(category.force).toBe(false);
    expect(category.categories[0].description).toEqual({
      en: "장비",
      ko: "장비",
    });
    expect(assignment.categories[0].assignee.includeTenantCompany).toBe(false);
  });

  it("rejects unsupported category values and negative boundaries", () => {
    const result = saveCategoryTreeSchema.safeParse({
      tenantId: "1",
      categories: [
        {
          name: { en: "Hardware" },
          scope: "EXTERNAL",
          index: -1,
          active: true,
          defaultPriority: "normal",
          defaultRiskLevel: "medium",
          defaultSlaDays: -1,
          subCategories: [],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid approval assignees and unsupported skip access levels", () => {
    const result = saveApprovalStepTreeSchema.safeParse({
      tenantId: "1",
      categories: [
        {
          id: "10",
          approvalSteps: [
            {
              name: { en: "Manager review" },
              index: 0,
              stepAssignee: { type: "MANAGER", managerDistance: 3 },
              skipAccessLevel: 8,
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("requires a main-category assignment target while allowing empty subcategory overrides", () => {
    const result = saveAssignmentRuleTreeSchema.safeParse({
      tenantId: "1",
      categories: [
        {
          id: "10",
          assignee: { jobFieldIds: [], assigneeUsernames: [] },
          subCategories: [
            {
              id: "11",
              assignee: { jobFieldIds: [], assigneeUsernames: [] },
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
