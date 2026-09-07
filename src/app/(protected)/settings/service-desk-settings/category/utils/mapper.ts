import type { TreeNodes } from "@/components/custom/SortableTree";
import type { MainCategory } from "@/domain/serviceDesk";

import { MAX_SUB_CATEGORY_PER_CATEGORY } from "../constants";
import type { CategoryData, SubCategoryData } from "../types";

export function createCategoryTree(
  categories: readonly MainCategory[],
): TreeNodes<CategoryData | SubCategoryData> {
  return categories.map((category) => {
    const { subCategories, ...categoryData } = category;

    return {
      id: category.id,
      data: {
        ...categoryData,
        nodeType: "category" as const,
        isCreated: false,
      },
      collapsed: false,
      maximum: MAX_SUB_CATEGORY_PER_CATEGORY,
      children: subCategories.map((subCategory) => ({
        id: subCategory.id,
        data: {
          ...subCategory,
          nodeType: "subCategory" as const,
          isCreated: false,
        },
        children: [],
      })),
    };
  });
}
