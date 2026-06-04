import { Priority, RiskLevel } from "@/domain/common";
import { CategoryScope, MainCategory, SubCategory } from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";

// back-end data structures.
export interface DbCategoryBase {
  category_id: number; // string number. can use parseInt.
  category_name: LocalizedText;
  category_description: LocalizedText | null;
  category_request_template: LocalizedText | null;
  category_index: number;
  category_active: boolean;
}

// leaf category.
export interface DbSubCategory extends DbCategoryBase {
  default_priority?: Priority | null; // optional to sub category.
  default_risk_level?: RiskLevel | null; // optional to sub category.
  default_sla_days?: number | null; // optional to sub category.
}

// parent category.
export interface DbCategory extends DbCategoryBase {
  category_scope: CategoryScope;
  default_priority: Priority; // required to category.
  default_risk_level: RiskLevel; // required to category.
  default_sla_days: number; // required to category.
  sub_category: DbSubCategory[];
}

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
  tenantId: string;
  categories: CategoryTreeSyncCategoryInput[];
};
