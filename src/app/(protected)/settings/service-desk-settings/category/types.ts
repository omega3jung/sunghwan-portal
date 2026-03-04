import { Category } from "@/domain/serviceDesk";

export type CategoryData = Category & { isCreated: boolean };
export type MainCategoryData = CategoryData & {
  isCreated: boolean;
  subCategories: CategoryData[];
};
