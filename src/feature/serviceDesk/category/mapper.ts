import {
  MainCategory,
  SubCategory,
  TenantCategoryTree,
} from "@/domain/serviceDesk";
import {
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined } from "@/shared/utils/value";

import type { DbCategory, DbSubCategory, DbTenantCategoryTree } from "./types";

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
        active: item.tenant_active ?? true,
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

export const mapCategoryListPayload = createListPayloadMapper(
  camelTenantCategoryTreeMapper,
);

export const mapCategoryTreePayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return (
    camelTenantCategoryTreeMapper([payload as DbTenantCategoryTree])[0] ?? null
  );
};
