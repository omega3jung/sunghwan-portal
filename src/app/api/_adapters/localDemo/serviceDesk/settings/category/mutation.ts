import { getLocalDemoCategories } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { ApiError } from "@/lib/application/api";
import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";

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
    throw new ApiError(
      "serviceDesk.categories.localDemo.tenantNotFound",
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
