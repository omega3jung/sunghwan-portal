import type { MainCategory, SubCategory } from "@/domain/serviceDesk";

export type CategoryTreeSyncSubCategoryInput = Omit<SubCategory, "id"> & {
  id?: string;
};

export type CategoryTreeSyncCategoryInput = Omit<
  MainCategory,
  "id" | "subCategories"
> & {
  id?: string;
  subCategories: CategoryTreeSyncSubCategoryInput[];
};

export type SaveServiceDeskCategoryTreePayload = {
  clientId: string;
  categories: CategoryTreeSyncCategoryInput[];
};
