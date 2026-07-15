import { createIncrementalIdAssigner } from "@/app/api/_helpers";
import type { TenantCategoryTree } from "@/domain/serviceDesk";
import {
  type DbCategory,
  type DbTenantCategoryTree,
} from "@/feature/serviceDesk/category";
import {
  camelCategoryMapper,
  camelTenantCategoryTreeMapper,
} from "@/feature/serviceDesk/category/mapper";
import { idToNumber } from "@/lib/application/api/mapId";

export const sortCategories = (categories: DbCategory[]) => {
  return categories
    .slice()
    .sort((left, right) => left.category_index - right.category_index)
    .map((category) => ({
      ...category,
      sub_category: category.sub_category
        .slice()
        .sort((left, right) => left.category_index - right.category_index),
    }));
};

const collectCategoryIds = (items: DbTenantCategoryTree[]) => {
  return items.flatMap((tenant) => [
    ...tenant.category.map((category) => category.category_id),
    ...tenant.category.flatMap((category) =>
      category.sub_category.map((subCategory) => subCategory.category_id),
    ),
  ]);
};

export const createCategoryIdAssigner = (items: DbTenantCategoryTree[]) => {
  const assignNextId = createIncrementalIdAssigner(collectCategoryIds(items));

  return (value?: string) => {
    const parsedId = value ? idToNumber(value) : null;

    if (parsedId !== null) {
      return parsedId;
    }

    return Number(assignNextId());
  };
};

export const getTenantIndexById = (
  items: DbTenantCategoryTree[],
  tenantId: string,
) => {
  return items.findIndex((tenant) => String(tenant.tenant_id) === tenantId);
};

export const getCategoryLocation = (
  items: DbTenantCategoryTree[],
  id: string,
) => {
  for (let tenantIndex = 0; tenantIndex < items.length; tenantIndex += 1) {
    const categoryIndex = items[tenantIndex].category.findIndex(
      (category) => String(category.category_id) === id,
    );

    if (categoryIndex >= 0) {
      return {
        tenantIndex,
        categoryIndex,
      };
    }
  }

  return null;
};

export const normalizeTenantTree = (
  tenant: DbTenantCategoryTree,
): TenantCategoryTree => {
  return camelTenantCategoryTreeMapper([
    {
      ...tenant,
      category: sortCategories(tenant.category),
    },
  ])[0];
};

export const normalizeCategory = (category: DbCategory) => {
  return camelCategoryMapper([
    {
      ...category,
      sub_category: category.sub_category
        .slice()
        .sort((left, right) => left.category_index - right.category_index),
    },
  ])[0];
};
