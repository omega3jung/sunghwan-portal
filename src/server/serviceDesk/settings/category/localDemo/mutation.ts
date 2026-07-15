import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";

import { getLocalDemoCategories } from "../../state";
import {
  createCategoryIdAssigner,
  getTenantIndexById,
  normalizeTenantTree,
  sortCategories,
} from "./categoryUtils";
import { buildSynchronizedCategory } from "./treeSync";

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
    .sort((left, right) => left.category_index - right.category_index);

  targetTenant.category = sortCategories([
    ...synchronizedCategories,
    ...preservedCategories,
  ]);

  return normalizeTenantTree(targetTenant);
};
