import { describe, expect, it } from "vitest";

import type { MainCategory } from "@/domain/serviceDesk";

import {
  formatTicketCategoryPath,
  getTicketCategoryParentId,
  getTicketCategoryRequestTemplate,
  mapTicketCategoriesToHierarchicalItems,
  resolveTicketCategoryMeta,
} from "./categorySelection";

const localize = (text: { en: string }) => text.en;

function createCategory(
  overrides: Partial<MainCategory> = {},
): MainCategory {
  return {
    id: "10",
    name: { en: "Hardware" },
    requestTemplate: { en: "Describe the hardware problem" },
    index: 0,
    active: true,
    scope: "PORTAL",
    defaultPriority: "medium",
    defaultRiskLevel: "medium",
    defaultSlaDays: 3,
    subCategories: [
      {
        id: "11",
        name: { en: "Laptop" },
        index: 0,
        active: true,
      },
      {
        id: "12",
        name: { en: "Retired device" },
        index: 1,
        active: false,
      },
    ],
    ...overrides,
  };
}

describe("ticket category selection", () => {
  it("exposes only effectively active categories and subcategories", () => {
    const categories = [
      createCategory(),
      createCategory({
        id: "20",
        name: { en: "Inactive parent" },
        active: false,
        subCategories: [
          {
            id: "21",
            name: { en: "Active child" },
            index: 0,
            active: true,
          },
        ],
      }),
    ];

    expect(mapTicketCategoriesToHierarchicalItems(categories, localize)).toEqual([
      {
        value: "10",
        label: "Hardware",
        children: [{ value: "11", label: "Laptop" }],
      },
    ]);
  });

  it("resolves a leaf category with its parent and display path", () => {
    const categories = [createCategory()];
    const meta = resolveTicketCategoryMeta(categories, "11");

    expect(meta.selected?.id).toBe("11");
    expect(meta.parentCategory?.id).toBe("10");
    expect(formatTicketCategoryPath(meta, localize)).toBe("Hardware / Laptop");
    expect(getTicketCategoryParentId(categories, "11")).toBe("10");
  });

  it("uses a leaf request template before falling back to its parent", () => {
    const categories = [
      createCategory({
        subCategories: [
          {
            id: "11",
            name: { en: "Laptop" },
            requestTemplate: { en: "Include the asset number" },
            index: 0,
            active: true,
          },
          {
            id: "13",
            name: { en: "Monitor" },
            index: 1,
            active: true,
          },
        ],
      }),
    ];

    expect(
      getTicketCategoryRequestTemplate(categories, "11", localize),
    ).toBe("Include the asset number");
    expect(
      getTicketCategoryRequestTemplate(categories, "13", localize),
    ).toBe("Describe the hardware problem");
  });

  it("returns an empty selection for an unknown category", () => {
    const categories = [createCategory()];
    const meta = resolveTicketCategoryMeta(categories, "missing");

    expect(meta).toEqual({ path: [] });
    expect(formatTicketCategoryPath(meta, localize, "Unknown")).toBe("Unknown");
    expect(getTicketCategoryParentId(categories, "missing")).toBeUndefined();
  });
});
