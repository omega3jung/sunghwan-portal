import { describe, expect, it } from "vitest";

import type { DbCategory } from "@/lib/application/contracts/serviceDesk";

import { buildSynchronizedCategory } from "./treeSync";

const categoryInput = {
  id: "new_category_1",
  name: { en: "Category" },
  index: 1,
  active: true,
  scope: "INTERNAL" as const,
  defaultPriority: "medium" as const,
  defaultRiskLevel: "medium" as const,
  defaultSlaDays: 3,
  subCategories: [
    {
      id: "new_sub_category_1",
      name: { en: "Subcategory" },
      index: 1,
      active: true,
    },
  ],
};

describe("LOCAL category tree synchronization", () => {
  it("forces new main and subcategories inactive", () => {
    const result = buildSynchronizedCategory({
      category: categoryInput,
      assignId: (() => {
        let id = 100;
        return () => id++;
      })(),
    });

    expect(result.category_active).toBe(false);
    expect(result.sub_category[0]?.category_active).toBe(false);
  });

  it("preserves a subcategory stored active state when its parent is deactivated", () => {
    const previousCategory: DbCategory = {
      category_id: 1,
      category_name: { en: "Category" },
      category_description: null,
      category_request_template: null,
      category_scope: "INTERNAL",
      category_index: 1,
      category_active: true,
      default_priority: "medium",
      default_risk_level: "medium",
      default_sla_days: 3,
      sub_category: [
        {
          category_id: 2,
          category_name: { en: "Subcategory" },
          category_description: null,
          category_request_template: null,
          category_index: 1,
          category_active: true,
          default_priority: null,
          default_risk_level: null,
          default_sla_days: null,
        },
      ],
    };
    const result = buildSynchronizedCategory({
      category: {
        ...categoryInput,
        id: "1",
        active: false,
        subCategories: [{ ...categoryInput.subCategories[0], id: "2" }],
      },
      previousCategory,
      assignId: () => 999,
    });

    expect(result.category_active).toBe(false);
    expect(result.sub_category[0]?.category_active).toBe(true);
  });
});
