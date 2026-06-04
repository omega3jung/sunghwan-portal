import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { DbCategory } from "@/feature/serviceDesk/category";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/feature/serviceDesk/category/write";

import { getLocalDemoCategories } from "../../state";
import {
  createCategoryIdAssigner,
  getCategoryLocation,
  getTenantIndexById,
  normalizeCategory,
  normalizeTenantTree,
  sortCategories,
} from "./categoryUtils";
import { buildSynchronizedCategory } from "./treeSync";

export const localCreateCategory = ({
  isInternal,
  input,
}: {
  isInternal: boolean;
  input: CreateCategoryInput;
}) => {
  const items = getLocalDemoCategories(isInternal);
  const tenantIndex = getTenantIndexById(items, input.tenantId);

  if (tenantIndex === -1) {
    throw new ServiceDeskApiError(
      "api.categories.localDemo.tenantNotFound",
      404,
      { tenantId: input.tenantId },
    );
  }

  const assignId = createCategoryIdAssigner(items);
  const nextCategory = buildSynchronizedCategory({
    category: {
      ...input,
      id: undefined,
    },
    assignId,
  });

  items[tenantIndex].category.push(nextCategory);
  items[tenantIndex].category = sortCategories(items[tenantIndex].category);

  return normalizeCategory(nextCategory);
};

export const localUpdateCategory = ({
  isInternal,
  id,
  input,
}: {
  isInternal: boolean;
  id: string;
  input: UpdateCategoryInput;
}) => {
  const items = getLocalDemoCategories(isInternal);
  const location = getCategoryLocation(items, id);

  if (!location) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const targetTenant = items[location.tenantIndex];

  if (input.tenantId && input.tenantId !== String(targetTenant.tenant_id)) {
    throw new ServiceDeskApiError(
      "api.categories.localDemo.tenantMismatch",
      400,
      {
        tenantId: input.tenantId,
      },
    );
  }

  const assignId = createCategoryIdAssigner(items);
  const nextCategory = buildSynchronizedCategory({
    category: {
      ...input,
      id,
    },
    previousCategory: targetTenant.category[location.categoryIndex],
    assignId,
  });

  targetTenant.category.splice(location.categoryIndex, 1, nextCategory);
  targetTenant.category = sortCategories(targetTenant.category);

  return normalizeCategory(nextCategory);
};

export const localSaveCategoryTree = ({
  isInternal,
  payload,
}: {
  isInternal: boolean;
  payload: SaveServiceDeskCategoryTreePayload;
}) => {
  const items = getLocalDemoCategories(isInternal);
  const tenantIndex = getTenantIndexById(items, payload.tenantId);

  if (tenantIndex === -1) {
    throw new ServiceDeskApiError(
      "api.categories.localDemo.tenantNotFound",
      404,
      { tenantId: payload.tenantId },
    );
  }

  const targetTenant = items[tenantIndex];
  const previousCategoryMap = new Map(
    targetTenant.category.map((category) => [
      String(category.category_id),
      category,
    ]),
  );
  const assignId = createCategoryIdAssigner(items);
  const synchronizedCategories = payload.categories.map(
    (category, categoryIndex) =>
      buildSynchronizedCategory({
        category: {
          ...category,
          index: categoryIndex + 1,
        },
        previousCategory: category.id
          ? previousCategoryMap.get(category.id)
          : undefined,
        assignId,
      }),
  );
  const submittedIds = new Set(
    synchronizedCategories.map((category) => String(category.category_id)),
  );
  const preservedCategories = targetTenant.category
    .filter((category) => !submittedIds.has(String(category.category_id)))
    .sort((left, right) => left.category_index - right.category_index)
    .map((category, categoryIndex) => ({
      ...category,
      category_index: synchronizedCategories.length + categoryIndex + 1,
    }));

  targetTenant.category = sortCategories([
    ...synchronizedCategories,
    ...preservedCategories,
  ]);

  return normalizeTenantTree(targetTenant);
};

export const localSoftDeleteCategory = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const items = getLocalDemoCategories(isInternal);
  const location = getCategoryLocation(items, id);

  if (!location) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const targetCategory =
    items[location.tenantIndex].category[location.categoryIndex];
  const nextCategory: DbCategory = {
    ...targetCategory,
    category_active: false,
    sub_category: targetCategory.sub_category.map((subCategory) => ({
      ...subCategory,
      category_active: false,
    })),
  };

  items[location.tenantIndex].category.splice(
    location.categoryIndex,
    1,
    nextCategory,
  );

  return normalizeCategory(nextCategory);
};
