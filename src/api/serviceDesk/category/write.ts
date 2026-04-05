import { idToNumber } from "@/api/utils/mapId";
import { MainCategory, SubCategory } from "@/domain/serviceDesk";
import { undefinedToNull } from "@/shared/utils/nullable";

import { DbCategory, DbSubCategory } from "./mapper";

type CategoryWriteFields = Omit<MainCategory, "id" | "subCategories"> & {
  subCategories: CategorySubCategoryWriteInput[];
};

type DbSubCategoryWriteInput = Omit<DbSubCategory, "category_id"> & {
  category_id?: number | null;
};

type DbCategoryWriteInput = Omit<DbCategory, "category_id" | "sub_category"> & {
  category_id?: number | null;
  sub_category: DbSubCategoryWriteInput[];
};

export type CategorySubCategoryWriteInput = Omit<SubCategory, "id"> & {
  id?: string;
};

export type CreateCategoryInput = CategoryWriteFields & { id?: string };
export type UpdateCategoryInput = CategoryWriteFields & { id: string };

export function toCategoryWritePayload(
  input: CreateCategoryInput | UpdateCategoryInput,
): DbCategoryWriteInput {
  return {
    category_id: idToNumber(input.id),
    category_name: input.name,
    category_description: undefinedToNull(input.description),
    category_request_template: undefinedToNull(input.requestTemplate),
    category_scope: input.scope,
    category_index: input.index,
    category_active: input.active,
    default_priority: input.defaultPriority,
    default_risk_level: input.defaultRiskLevel,
    default_sla_days: input.defaultSlaDays,
    sub_category: input.subCategories.map((subCategory) =>
      toSubCategoryWritePayload(subCategory),
    ),
  };
}

export function toCategoryMockResource(
  input: CreateCategoryInput | UpdateCategoryInput,
  id = createMockId(),
): MainCategory {
  return {
    ...input,
    id,
    subCategories: input.subCategories.map((subCategory) => ({
      ...subCategory,
      id: subCategory.id ?? createMockId(),
    })),
  };
}

function toSubCategoryWritePayload(
  subCategory: CategorySubCategoryWriteInput,
): DbSubCategoryWriteInput {
  return {
    category_id: idToNumber(subCategory.id),
    category_name: subCategory.name,
    category_description: undefinedToNull(subCategory.description),
    category_request_template: undefinedToNull(subCategory.requestTemplate),
    category_index: subCategory.index,
    category_active: subCategory.active,
    default_priority: undefinedToNull(subCategory.defaultPriority),
    default_risk_level: undefinedToNull(subCategory.defaultRiskLevel),
    default_sla_days: undefinedToNull(subCategory.defaultSlaDays),
  };
}

function createMockId() {
  return Date.now().toString();
}
