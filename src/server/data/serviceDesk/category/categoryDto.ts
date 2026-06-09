import { Priority, RiskLevel } from "@/domain/common";
import { CategoryScope } from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";

// leaf category.
export interface SubCategoryDto {
  category_id: number;
  category_name: LocalizedText;
  category_description: LocalizedText | null;
  category_request_template: LocalizedText | null;
  category_index: number;
  category_active: boolean;
  default_priority?: Priority | null;
  default_risk_level?: RiskLevel | null;
  default_sla_days?: number | null;
}

export interface CategorySubCategoryInputDto {
  category_id?: number;
  category_name: LocalizedText;
  category_description: LocalizedText | null;
  category_request_template: LocalizedText | null;
  category_index: number;
  category_active: boolean;
  default_priority?: Priority | null;
  default_risk_level?: RiskLevel | null;
  default_sla_days?: number | null;
}

// parent category.
export interface CategoryDto {
  category_id: number;
  category_name: LocalizedText;
  category_description: LocalizedText | null;
  category_request_template: LocalizedText | null;
  category_index: number;
  category_active: boolean;
  category_scope: CategoryScope;
  default_priority: Priority;
  default_risk_level: RiskLevel;
  default_sla_days: number;
  sub_category: SubCategoryDto[];
}

export interface CreateCategoryInputDto {
  category_tenant_id: number;
  category_name: LocalizedText;
  category_description: LocalizedText | null;
  category_request_template: LocalizedText | null;
  category_scope: CategoryScope;
  category_index: number;
  category_active: boolean;
  default_priority: Priority;
  default_risk_level: RiskLevel;
  default_sla_days: number;
  sub_category: CategorySubCategoryInputDto[];
}

export interface UpdateCategoryInputDto {
  category_name: LocalizedText;
  category_description: LocalizedText | null;
  category_request_template: LocalizedText | null;
  category_scope: CategoryScope;
  category_index: number;
  category_active: boolean;
  default_priority: Priority;
  default_risk_level: RiskLevel;
  default_sla_days: number;
  sub_category: CategorySubCategoryInputDto[];
}
