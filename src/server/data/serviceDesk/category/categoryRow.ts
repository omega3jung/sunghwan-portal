import { Priority, RiskLevel } from "@/domain/common";
import { CategoryScope } from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";

export type CategoryRow = {
  cat_id: number;
  cat_tenant_id: number;
  cat_parent_id: number | null;
  cat_scope: CategoryScope | null;
  cat_name: LocalizedText;
  cat_description: LocalizedText | null;
  cat_request_template: LocalizedText | null;
  cat_index: number;
  cat_active: boolean;
  cat_default_priority: Priority | null;
  cat_default_risk_level: RiskLevel | null;
  cat_default_sla_days: number | null;
};

export type CreateCategoryRowInput = {
  cat_tenant_id: number;
  cat_parent_id: number | null;
  cat_scope: CategoryScope | null;
  cat_name: LocalizedText;
  cat_description: LocalizedText | null;
  cat_request_template: LocalizedText | null;
  cat_index: number;
  cat_active: boolean;
  cat_default_priority: Priority | null;
  cat_default_risk_level: RiskLevel | null;
  cat_default_sla_days: number | null;
};

export type UpdateCategoryRowInput = {
  cat_parent_id: number | null;
  cat_scope: CategoryScope | null;
  cat_name: LocalizedText;
  cat_description: LocalizedText | null;
  cat_request_template: LocalizedText | null;
  cat_index: number;
  cat_active: boolean;
  cat_default_priority: Priority | null;
  cat_default_risk_level: RiskLevel | null;
  cat_default_sla_days: number | null;
};
