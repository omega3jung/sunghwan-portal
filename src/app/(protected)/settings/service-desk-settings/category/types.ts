import { MainCategory, SubCategory } from "@/domain/serviceDesk";

export interface SubCategoryData extends SubCategory {
  isCreated: boolean;
}

export interface CategoryData extends Omit<MainCategory, "subCategories"> {
  isCreated: boolean;
  subCategories: SubCategoryData[];
}
