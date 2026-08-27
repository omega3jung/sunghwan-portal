import { describe, expect, it } from "vitest";

import type { TenantCategoryTree } from "@/domain/serviceDesk";

import { createCategoryTree } from "./mapper";
import { buildCategoryTreeSavePayload } from "./tree";

const categories: TenantCategoryTree[] = [
  {
    id: "tenant-1",
    companyId: "company-1",
    name: { en: "Tenant" },
    color: "#2563eb",
    active: true,
    categories: [
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
    ],
  },
];

describe("createCategoryTree", () => {
  it("keeps child collections only in TreeNode.children", () => {
    const [category] = createCategoryTree(categories, "tenant-1");

    expect(category.data.nodeType).toBe("category");
    expect(category.data).not.toHaveProperty("subCategories");
    expect(category.children).toHaveLength(1);
    expect(category.children[0].data.nodeType).toBe("subCategory");
  });

  it("returns an empty tree for an unknown tenant", () => {
    expect(createCategoryTree(categories, "missing")).toEqual([]);
  });

  it("does not leak UI-only node metadata into the save payload", () => {
    const payload = buildCategoryTreeSavePayload({
      tenantId: "tenant-1",
      tree: createCategoryTree(categories, "tenant-1"),
    });

    expect(payload.categories[0]).not.toHaveProperty("nodeType");
    expect(payload.categories[0].subCategories[0]).not.toHaveProperty(
      "nodeType",
    );
  });
});
