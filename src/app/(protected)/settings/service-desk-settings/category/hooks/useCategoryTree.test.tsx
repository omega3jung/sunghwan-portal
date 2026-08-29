// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { TenantCategoryTree } from "@/domain/serviceDesk";

import { useCategoryTree } from "./useCategoryTree";

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

function renderCategoryTreeHook() {
  return renderHook(() =>
    useCategoryTree({
      contextKey: "tenant-1:INTERNAL",
      categories: categories[0].categories,
    }),
  );
}

afterEach(cleanup);

describe("useCategoryTree", () => {
  it("selects a subcategory together with its parent category", async () => {
    // Arrange
    const { result } = renderCategoryTreeHook();
    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Act
    act(() => result.current.setSelectedId("subcategory-1"));

    // Assert
    expect(result.current.selectedNode?.id).toBe("subcategory-1");
    expect(result.current.selectedParentCategory?.id).toBe("category-1");
  });

  it("adds inactive categories in the selected scope and restores the source on reset", async () => {
    const { result } = renderCategoryTreeHook();
    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.addCategory("PORTAL"));

    expect(result.current.tree[0].data).toMatchObject({
      nodeType: "category",
      isCreated: true,
      scope: "PORTAL",
      active: false,
    });
    expect(result.current.isDirty).toBe(true);

    act(() => result.current.reset());

    expect(result.current.tree).toHaveLength(1);
    expect(result.current.tree[0].id).toBe("category-1");
    expect(result.current.isDirty).toBe(false);
  });

  it("adds a new inactive subcategory under the chosen main category", async () => {
    const { result } = renderCategoryTreeHook();
    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.addSubCategory("category-1"));

    expect(result.current.tree[0].children).toHaveLength(2);
    expect(result.current.tree[0].children[0].data).toMatchObject({
      nodeType: "subCategory",
      isCreated: true,
      active: false,
    });
  });
});
