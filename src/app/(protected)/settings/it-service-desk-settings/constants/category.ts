import { CategoryData, MainCategoryData } from "../types";

const newCategoryIdPrefix = "new_category_";
const newCategoryNamePrefix = "New Category ";
const newSubCategoryIdPrefix = "new_sub_category";
const newSubCategoryNamePrefix = "New Sub Category ";

export const getDefaultCateogoryData = (count: number): MainCategoryData => {
  return {
    id: `${newCategoryIdPrefix}${count}`,
    index: 1,
    agents: [],
    active: true,
    translations: {
      en: {
        name: `${newCategoryNamePrefix}${count}`,
        description: "",
        placeholder: "",
      },
    },
    subCategories: [],
    editType: "create",
  };
};

export const getDefaultSubCateogoryData = (count: number): CategoryData => {
  return {
    id: `${newSubCategoryIdPrefix}${count}`,
    index: 1,
    agents: [],
    active: true,
    translations: {
      en: {
        name: `${newSubCategoryNamePrefix}${count}`,
        description: "",
        placeholder: "",
      },
    },
    editType: "create",
  };
};
