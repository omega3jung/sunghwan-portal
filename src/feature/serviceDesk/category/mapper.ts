import {
  MainCategory,
  SubCategory,
  TenantCategoryTree,
} from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

import { DbTenant } from "../tenant";
import { DbCategory, DbSubCategory } from "./types";

export type DbTenantCategoryTree = DbTenant & { category: DbCategory[] };

export const camelTenantCategoryTreeMapper: ArrayMapper<
  DbTenantCategoryTree,
  TenantCategoryTree
> = (data) => {
  return data.flatMap((item) => {
    if (!item) {
      return [];
    }

    return [
      {
        id: item.tenant_id.toString(),
        companyId: item.tenant_company_id.toString(),
        name: item.tenant_name,
        color: item.tenant_color,
        categories: camelCategoryMapper(item.category ?? []),
      },
    ];
  });
};

export const camelCategoryMapper: ArrayMapper<DbCategory, MainCategory> = (
  data,
) => {
  return data.flatMap((item) => {
    if (!item) {
      return [];
    }

    return [
      {
        id: item.category_id.toString(),
        name: item.category_name,
        description: nullToUndefined(item.category_description),
        requestTemplate: nullToUndefined(item.category_request_template),
        scope: item.category_scope,
        index: item.category_index,
        active: item.category_active,
        defaultPriority: item.default_priority,
        defaultSlaDays: item.default_sla_days,
        defaultRiskLevel: item.default_risk_level,
        subCategories: camelSubCategoryMapper(item.sub_category ?? []),
      },
    ];
  });
};

const camelSubCategoryMapper: ArrayMapper<DbSubCategory, SubCategory> = (
  data,
) => {
  return data.flatMap((item) => {
    if (!item) {
      return [];
    }

    return [
      {
        id: item.category_id.toString(),
        name: item.category_name,
        description: nullToUndefined(item.category_description),
        requestTemplate: nullToUndefined(item.category_request_template),
        index: item.category_index,
        active: item.category_active,
        defaultPriority: nullToUndefined(item.default_priority),
        defaultRiskLevel: nullToUndefined(item.default_risk_level),
        defaultSlaDays: nullToUndefined(item.default_sla_days),
      },
    ];
  });
};

export const snakeCategoryMapper: ArrayMapper<MainCategory, DbCategory> = (
  data,
) => {
  return data.map((item) => ({
    category_id: parseInt(item.id),
    category_name: item.name,
    category_description: undefinedToNull(item.description),
    category_request_template: undefinedToNull(item.requestTemplate),
    category_scope: item.scope,
    category_index: item.index,
    category_active: item.active,
    default_priority: item.defaultPriority,
    default_risk_level: item.defaultRiskLevel,
    default_sla_days: item.defaultSlaDays,
    sub_category: snakeSubCategoryMapper(item.subCategories),
  }));
};

const snakeSubCategoryMapper: ArrayMapper<SubCategory, DbSubCategory> = (
  data,
) => {
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

export const mapCategoryListPayload = createListPayloadMapper(
  camelTenantCategoryTreeMapper,
);
export const mapCategoryItemPayload =
  createItemPayloadMapper(camelCategoryMapper);

export const mapCategoryTreePayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return (
    camelTenantCategoryTreeMapper([payload as DbTenantCategoryTree])[0] ?? null
  );
};
