import { CategoryData, MainCategoryData } from "../types";

const newCategoryIdPrefix = "new_category_";
const newCategoryNamePrefix = "New Category ";
const newSubCategoryIdPrefix = "new_sub_category";
const newSubCategoryNamePrefix = "New Sub Category ";

export const getDefaultCateogoryData = (count: number): MainCategoryData => {
  return {
    id: `${newCategoryIdPrefix}${count}`,
    name: { en: `${newCategoryNamePrefix}${count}` },
    index: 1,
    agents: [],
    active: true,
    subCategories: [],
    editType: "create",
  };
};

export const getDefaultSubCateogoryData = (count: number): CategoryData => {
  return {
    id: `${newSubCategoryIdPrefix}${count}`,
    name: { en: `${newSubCategoryNamePrefix}${count}` },
    index: 1,
    agents: [],
    active: true,
    editType: "create",
  };
};
