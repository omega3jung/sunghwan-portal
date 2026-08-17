import { Priority, RiskLevel } from "@/domain/common";
import { CategoryScope, MainCategory, SubCategory } from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";
import type { DbParams } from "@/shared/types/api";

import type { DbTenant, ServiceDeskSettingsTenantContext } from "./tenant";

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

/** Database-facing tenant category tree shape used by the Service Desk application boundary. */
export type DbTenantCategoryTree = DbTenant & { category: DbCategory[] };

/** Parameters that configure service desk category list behavior in the Service Desk application boundary. */
export type ServiceDeskCategoryListParams = DbParams & {
  tenantId?: string;
  active?: boolean;
  settings?: boolean;
  context?: "settings";
  scope?: CategoryScope;
};

/** Represents service desk category context within the Service Desk application boundary. */
export type ServiceDeskCategoryContext = {
  categoryId: string;
  mainCategoryId: string;
  scope: CategoryScope;
  tenant: ServiceDeskSettingsTenantContext;
};

/** Input contract for category tree sync sub category operations at the Service Desk application boundary. */
export type CategoryTreeSyncSubCategoryInput = Omit<SubCategory, "id"> & {
  id?: string;
};

/** Input contract for category tree sync category operations at the Service Desk application boundary. */
export type CategoryTreeSyncCategoryInput = Omit<
  MainCategory,
  "id" | "subCategories"
> & {
  id?: string;
  subCategories: CategoryTreeSyncSubCategoryInput[];
};

/** Represents save service desk category tree payload within the Service Desk application boundary. */
export type SaveServiceDeskCategoryTreePayload = {
  tenantId: string;
  categories: CategoryTreeSyncCategoryInput[];
  force?: boolean;
};
