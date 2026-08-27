import { describe, expect, it } from "vitest";

import {
  createTenantSchema,
  saveApprovalStepTreeSchema,
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
