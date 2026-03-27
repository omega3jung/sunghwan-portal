import { Category, SubCategory } from "@/domain/serviceDesk";

export interface SubCategoryData extends SubCategory {
  isCreated: boolean;
}

export interface CategoryData extends Omit<Category, "subCategories"> {
  isCreated: boolean;
  subCategories: SubCategoryData[];
}
