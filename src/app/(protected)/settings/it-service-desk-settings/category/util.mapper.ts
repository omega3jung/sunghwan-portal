import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { ClientCategoryTree } from "@/domain/itServiceDesk";

import { MAX_SUB_CATEGORY_PER_CATEGORY } from "./constants";
import { CategoryData, MainCategoryData } from "./types";

export const mapCategoryData = (
  categories: ClientCategoryTree[],
  clientId: string,
): MainCategoryData[] => {
  if (!categories?.length) {
    return [];
  }

  const current = categories.find((category) => category.id === clientId);

  if (!current) {
    return [];
  }

  return current.category.map((cat) => ({
    ...cat,
    isCreated: false,
    subCategories: cat.subCategories?.map((sub) => ({
      ...sub,
      isCreated: false,
    })),
  }));
};

export const categoryToTree = (
  categories: MainCategoryData[],
): TreeNodes<CategoryData | MainCategoryData> => {
  return categories.map((main) => ({
    id: main.id,
    data: main,
    collapsed: false,
    maximum: MAX_SUB_CATEGORY_PER_CATEGORY,
    children:
      main.subCategories?.map((sub) => ({
        id: sub.id,
        data: sub,
        children: [],
      })) ?? [],
  }));
};
