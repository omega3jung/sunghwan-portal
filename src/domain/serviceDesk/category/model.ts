import { Priority, RiskLevel } from "@/domain/common/types";
import { LocalizedText } from "@/shared/types";

// tenant data structure.
export type Client = {
  id: string;
  name: string;
  color: string;
};

// category data structure.
export type ClientCategoryTree = Client & { category: MainCategory[] };

export type MainCategory = Category & {
  defaultPriority: Priority; // required to category.
  defaultRiskLevel: RiskLevel; // required to category.
  defaultSlaDays: number; // required to category.
  subCategories: Category[];
};

export interface Category {
  id: string; // string number. can use parseInt.
  name: LocalizedText;
  description?: LocalizedText;
  requestTemplate?: LocalizedText;
  index: number;
  active: boolean;
  defaultPriority?: Priority; // optional to sub category.
  defaultRiskLevel?: RiskLevel; // optional to sub category.
  defaultSlaDays?: number; // optional to sub category.
}
