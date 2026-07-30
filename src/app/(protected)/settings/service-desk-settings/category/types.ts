import { MainCategory, SubCategory } from "@/domain/serviceDesk";

export interface SubCategoryData extends SubCategory {
  nodeType: "subCategory";
  isCreated: boolean;
}

export interface CategoryData extends Omit<MainCategory, "subCategories"> {
  nodeType: "category";
  isCreated: boolean;
}
