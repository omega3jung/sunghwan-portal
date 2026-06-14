import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { TenantCategoryTree } from "@/domain/serviceDesk";

import { MAX_SUB_CATEGORY_PER_CATEGORY } from "../constants";
import { CategoryData, SubCategoryData } from "../types";

export const mapCategoryData = (
  categories: TenantCategoryTree[],
  tenantId: string,
): CategoryData[] => {
  if (!categories?.length) {
    return [];
  }

  const current = categories.find((category) => category.id === tenantId);

  if (!current) {
    return [];
  }

  return current.categories.map((cat): CategoryData => {
    return {
      ...cat,
      isCreated: false,
      subCategories: cat.subCategories.map((sub): SubCategoryData => {
        return {
          ...sub,
          isCreated: false,
        };
      }),
    };
  });
};

export const categoryToTree = (
  categories: CategoryData[],
): TreeNodes<CategoryData | SubCategoryData> => {
  return categories.map((main) => ({
    id: main.id,
    data: main,
    collapsed: false,
    maximum: MAX_SUB_CATEGORY_PER_CATEGORY,
    children: main.subCategories.map((sub) => ({
      id: sub.id,
      data: sub,
      children: [],
    })),
  }));
};
