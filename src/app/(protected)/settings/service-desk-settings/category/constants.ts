import { CategoryData, SubCategoryData } from "./types";

export const MAX_SUB_CATEGORY_PER_CATEGORY = 20;

const newCategoryIdPrefix = "new_category_";
const newCategoryNamePrefix = "New Category ";
const newSubCategoryIdPrefix = "new_sub_category";
const newSubCategoryNamePrefix = "New Sub Category ";

export const getDefaultCategoryData = (count: number): CategoryData => {
  return {
    id: `${newCategoryIdPrefix}${count}`,
    name: { en: `${newCategoryNamePrefix}${count}` },
    index: 1,
    active: true,
    scope: "INTERNAL",
    nodeType: "category",
    isCreated: true,
    defaultPriority: "medium",
    defaultRiskLevel: "medium",
    defaultSlaDays: 3,
  };
};

export const getDefaultSubCategoryData = (count: number): SubCategoryData => {
  return {
    id: `${newSubCategoryIdPrefix}${count}`,
    name: { en: `${newSubCategoryNamePrefix}${count}` },
    index: 1,
    active: true,
    nodeType: "subCategory",
    isCreated: true,
    defaultPriority: "medium",
    defaultRiskLevel: "medium",
    defaultSlaDays: 3,
  };
};
