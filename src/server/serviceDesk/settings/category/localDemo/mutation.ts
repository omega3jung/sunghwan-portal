import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { DbCategory } from "@/feature/serviceDesk/category/mapper";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/feature/serviceDesk/category/write";

import { getLocalDemoCategories } from "../../state";
import {
  createCategoryIdAssigner,
  getCategoryLocation,
  getClientIndexById,
  normalizeCategory,
  normalizeClientTree,
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
  const clientIndex = getClientIndexById(items, input.clientId);

  if (clientIndex === -1) {
    throw new ServiceDeskApiError(
      "api.categories.localDemo.clientNotFound",
      404,
      { clientId: input.clientId },
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

  items[clientIndex].category.push(nextCategory);
  items[clientIndex].category = sortCategories(items[clientIndex].category);

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

  const targetClient = items[location.clientIndex];

  if (input.clientId && input.clientId !== String(targetClient.client_id)) {
    throw new ServiceDeskApiError(
      "api.categories.localDemo.clientMismatch",
      400,
      {
        clientId: input.clientId,
      },
    );
  }

  const assignId = createCategoryIdAssigner(items);
  const nextCategory = buildSynchronizedCategory({
    category: {
      ...input,
      id,
    },
    previousCategory: targetClient.category[location.categoryIndex],
    assignId,
  });

  targetClient.category.splice(location.categoryIndex, 1, nextCategory);
  targetClient.category = sortCategories(targetClient.category);

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
  const clientIndex = getClientIndexById(items, payload.clientId);

  if (clientIndex === -1) {
    throw new ServiceDeskApiError(
      "api.categories.localDemo.clientNotFound",
      404,
      { clientId: payload.clientId },
    );
  }

  const targetClient = items[clientIndex];
  const previousCategoryMap = new Map(
    targetClient.category.map((category) => [
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
  const preservedCategories = targetClient.category
    .filter((category) => !submittedIds.has(String(category.category_id)))
    .sort((left, right) => left.category_index - right.category_index)
    .map((category, categoryIndex) => ({
      ...category,
      category_index: synchronizedCategories.length + categoryIndex + 1,
    }));

  targetClient.category = sortCategories([
    ...synchronizedCategories,
    ...preservedCategories,
  ]);

  return normalizeClientTree(targetClient);
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
    items[location.clientIndex].category[location.categoryIndex];
  const nextCategory: DbCategory = {
    ...targetCategory,
    category_active: false,
    sub_category: targetCategory.sub_category.map((subCategory) => ({
      ...subCategory,
      category_active: false,
    })),
  };

  items[location.clientIndex].category.splice(
    location.categoryIndex,
    1,
    nextCategory,
  );

  return normalizeCategory(nextCategory);
};
