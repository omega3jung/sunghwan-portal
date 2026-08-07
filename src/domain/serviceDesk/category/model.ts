import { Priority, RiskLevel } from "@/domain/common/types";
import { LocalizedText } from "@/shared/types";

import { Tenant } from "../tenant";

export type CategoryScope = "PORTAL" | "INTERNAL";

export interface CategoryBase {
  id: string; // string number. can use parseInt.
  name: LocalizedText;
  description?: LocalizedText;
  requestTemplate?: LocalizedText;
  index: number;
  active: boolean;
}

/** Selectable leaf category that may override defaults inherited from its parent. */
export interface SubCategory extends CategoryBase {
  defaultPriority?: Priority; // optional to sub category.
  defaultRiskLevel?: RiskLevel; // optional to sub category.
  defaultSlaDays?: number; // optional to sub category.
}

/** Parent category that supplies required defaults and groups selectable leaves. */
export interface MainCategory extends CategoryBase {
  scope: CategoryScope;
  defaultPriority: Priority; // required to category.
  defaultRiskLevel: RiskLevel; // required to category.
  defaultSlaDays: number; // required to category.
  subCategories: SubCategory[];
}

/** Tenant-scoped category hierarchy. */
export type TenantCategoryTree = Tenant & { categories: MainCategory[] };
