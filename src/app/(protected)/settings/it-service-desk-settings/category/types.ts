import { Category } from "@/domain/itServiceDesk";

export type CategoryData = Category & { isCreated: boolean };
export type MainCategoryData = CategoryData & {
  isCreated: boolean;
  subCategories: CategoryData[];
};
