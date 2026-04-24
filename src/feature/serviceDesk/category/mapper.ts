import { Priority, RiskLevel } from "@/domain/common";
import {
  CategoryScope,
  ClientCategoryTree,
  MainCategory,
  SubCategory,
} from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper, LocalizedText } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

// back-end data structures.
export type DbClient = {
  client_id: number;
  client_name: string;
  client_color: string;
};

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

export type DbClientCategoryTree = DbClient & { category: DbCategory[] };

export const camelClientCategoryTreeMapper: ArrayMapper<
  DbClientCategoryTree,
  ClientCategoryTree
> = (data) => {
  return data.flatMap((item) => {
    if (!item) {
      return [];
    }

    return [
      {
        id: item.client_id.toString(),
        name: item.client_name,
        color: item.client_color,
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
  camelClientCategoryTreeMapper,
);
export const mapCategoryItemPayload =
  createItemPayloadMapper(camelCategoryMapper);

export const mapCategoryTreePayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return (
    camelClientCategoryTreeMapper([payload as DbClientCategoryTree])[0] ?? null
  );
};
