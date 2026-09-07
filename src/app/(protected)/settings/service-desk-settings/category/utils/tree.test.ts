import { describe, expect, it } from "vitest";

import type { TenantCategoryTree } from "@/domain/serviceDesk";

import { createCategoryTree } from "./mapper";
import {
  buildCategoryTreeSavePayload,
  createCategorySettingsSignatureFromTree,
} from "./tree";

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
        name: { ko: "계정", en: "Account" },
        index: 9,
        active: false,
        scope: "PORTAL",
        defaultPriority: "medium",
        defaultRiskLevel: "medium",
        defaultSlaDays: 3,
        subCategories: [
          {
            id: "subcategory-1",
            name: { en: "New account" },
            index: 7,
            active: false,
          },
        ],
      },
    ],
  },
];

describe("buildCategoryTreeSavePayload", () => {
  it("creates an ordered API payload without UI-only tree metadata", () => {
    // Arrange
    const tree = createCategoryTree(categories[0].categories);

    // Act
    const payload = buildCategoryTreeSavePayload({
      tenantId: "tenant-1",
      tree,
    });

    // Assert
    expect(payload.tenantId).toBe("tenant-1");
    expect(payload.categories[0]).toMatchObject({
      id: "category-1",
      index: 1,
      name: { en: "Account", ko: "계정" },
      description: undefined,
    });
    expect(payload.categories[0]).not.toHaveProperty("nodeType");
    expect(payload.categories[0]).not.toHaveProperty("isCreated");
    expect(payload.categories[0].subCategories[0]).toMatchObject({
      id: "subcategory-1",
      index: 1,
      requestTemplate: undefined,
    });
    expect(payload.categories[0].subCategories[0]).not.toHaveProperty(
      "nodeType",
    );
  });
});

describe("createCategorySettingsSignatureFromTree", () => {
  it("ignores stale persisted indexes when the visible tree order is unchanged", () => {
    const tree = createCategoryTree(categories[0].categories);
    const sameTreeWithDifferentIndexes = createCategoryTree(
      categories[0].categories.map((category) => ({
        ...category,
        index: 100,
        subCategories: category.subCategories.map((subCategory) => ({
          ...subCategory,
          index: 200,
        })),
      })),
    );

    expect(createCategorySettingsSignatureFromTree(tree)).toBe(
      createCategorySettingsSignatureFromTree(sameTreeWithDifferentIndexes),
    );
  });
});
