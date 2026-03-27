import { Priority, RiskLevel } from "@/domain/common/types";
import { LocalizedText } from "@/shared/types";

// tenant data structure.
export type Client = {
  id: string;
  name: string;
  color: string;
};

export type CategoryScope = "PORTAL" | "INTERNAL";

export interface CategoryBase {
  id: string; // string number. can use parseInt.
  name: LocalizedText;
  description?: LocalizedText;
  requestTemplate?: LocalizedText;
  index: number;
  active: boolean;
}

// leaf category.
export interface SubCategory extends CategoryBase {
  defaultPriority?: Priority; // optional to sub category.
  defaultRiskLevel?: RiskLevel; // optional to sub category.
  defaultSlaDays?: number; // optional to sub category.
}

// parent category.
export interface Category extends CategoryBase {
  scope: CategoryScope;
  defaultPriority: Priority; // required to category.
  defaultRiskLevel: RiskLevel; // required to category.
  defaultSlaDays: number; // required to category.
  subCategories: SubCategory[];
}

// tenant-category tree.
export type ClientCategoryTree = Client & { categories: Category[] };
