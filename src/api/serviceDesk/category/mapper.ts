import { Priority, RiskLevel } from "@/domain/common";
import {
  Category,
  ClientCategoryTree,
  MainCategory,
} from "@/domain/serviceDesk";
import { ArrayMapper, LocalizedText } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

// back-end data structures.
export type DbClient = {
  client_id: number;
  client_name: string;
  client_color: string;
};

export type DbClientCategoryTree = DbClient & { category: DbMainCategory[] };

export type DbMainCategory = DbCategory & {
  default_priority: Priority;
  default_risk_level: RiskLevel;
  default_sla_days: number;
  sub_category: DbCategory[];
};

export interface DbCategory {
  category_id: number; // string number. can use parseInt.
  category_name: LocalizedText;
  category_description: LocalizedText | null;
  category_request_template: LocalizedText | null;
  category_index: number;
  category_active: boolean;
  default_priority: Priority | null;
  default_risk_level: RiskLevel | null;
  default_sla_days: number | null;
}

export const camelClientCategoryTreeMapper: ArrayMapper<
  DbClientCategoryTree,
  ClientCategoryTree
> = (data) => {
  return data.map((item) => ({
    id: item.client_id.toString(),
    name: item.client_name,
    color: item.client_color,
    category: camelCategoryMapper(item.category),
  }));
};

export const camelCategoryMapper: ArrayMapper<DbMainCategory, MainCategory> = (
  data,
) => {
  return data.map((item) => ({
    id: item.category_id.toString(),
    name: item.category_name,
    description: nullToUndefined(item.category_description),
    requestTemplate: nullToUndefined(item.category_request_template),
    index: item.category_index,
    active: item.category_active,
    defaultPriority: item.default_priority,
    defaultSlaDays: item.default_sla_days,
    defaultRiskLevel: item.default_risk_level,
    subCategories: camelSubCategoryMapper(item.sub_category),
  }));
};

const camelSubCategoryMapper: ArrayMapper<DbCategory, Category> = (data) => {
  return data.map((item) => ({
    id: item.category_id.toString(),
    name: item.category_name,
    description: nullToUndefined(item.category_description),
    requestTemplate: nullToUndefined(item.category_request_template),
    index: item.category_index,
    active: item.category_active,
    defaultPriority: nullToUndefined(item.default_priority),
    defaultRiskLevel: nullToUndefined(item.default_risk_level),
    defaultSlaDays: nullToUndefined(item.default_sla_days),
  }));
};

export const snakeCategoryMapper: ArrayMapper<MainCategory, DbCategory> = (
  data,
) => {
  return data.map((item) => ({
    category_id: parseInt(item.id),
    category_name: item.name,
    category_description: undefinedToNull(item.description),
    category_request_template: undefinedToNull(item.requestTemplate),
    category_index: item.index,
    category_active: item.active,
    default_priority: item.defaultPriority,
    default_risk_level: item.defaultRiskLevel,
    default_sla_days: item.defaultSlaDays,
    sub_category: snakeSubCategoryMapper(item.subCategories),
  }));
};

const snakeSubCategoryMapper: ArrayMapper<Category, DbCategory> = (data) => {
  return data.map((item) => ({
    category_id: parseInt(item.id),
    category_name: item.name,
    category_description: undefinedToNull(item.description),
    category_request_template: undefinedToNull(item.requestTemplate),
    category_index: item.index,
    category_active: item.active,
    default_priority: undefinedToNull(item.defaultPriority),
    default_risk_level: undefinedToNull(item.defaultRiskLevel),
    default_sla_days: undefinedToNull(item.defaultSlaDays),
  }));
};
