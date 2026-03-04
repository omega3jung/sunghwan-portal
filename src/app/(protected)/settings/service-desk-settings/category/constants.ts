import { CategoryData, MainCategoryData } from "./types";

export const MAX_SUB_CATEGORY_PER_CATEGORY = 20;

const newCategoryIdPrefix = "new_category_";
const newCategoryNamePrefix = "New Category ";
const newSubCategoryIdPrefix = "new_sub_category";
const newSubCategoryNamePrefix = "New Sub Category ";

export const getDefaultCateogoryData = (count: number): MainCategoryData => {
  return {
    id: `${newCategoryIdPrefix}${count}`,
    name: { en: `${newCategoryNamePrefix}${count}` },
    index: 1,
    active: true,
    subCategories: [],
    isCreated: true,
    defaultPriority: "medium",
    defaultSlaDays: 3,
  };
};

export const getDefaultSubCateogoryData = (count: number): CategoryData => {
  return {
    id: `${newSubCategoryIdPrefix}${count}`,
    name: { en: `${newSubCategoryNamePrefix}${count}` },
    index: 1,
    active: true,
    isCreated: true,
    defaultPriority: "medium",
    defaultSlaDays: 3,
  };
};
