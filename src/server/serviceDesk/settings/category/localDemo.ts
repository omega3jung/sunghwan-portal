import { createIncrementalIdAssigner } from "@/app/api/_helpers";
import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { ClientCategoryTree } from "@/domain/serviceDesk";
import {
  camelCategoryMapper,
  camelClientCategoryTreeMapper,
  type DbCategory,
  type DbClientCategoryTree,
} from "@/feature/serviceDesk/category/mapper";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/feature/serviceDesk/category/write";
import { idToNumber } from "@/lib/api/utils/mapId";

import { getLocalDemoCategories } from "../state";

export const getLocalCategoryTrees = (
  isInternal: boolean,
): ClientCategoryTree[] => {
  return getLocalDemoCategories(isInternal).map((client) =>
    normalizeClientTree(client),
  );
};

const sortCategories = (categories: DbCategory[]) => {
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

const collectCategoryIds = (items: DbClientCategoryTree[]) => {
  return items.flatMap((client) => [
    ...client.category.map((category) => category.category_id),
    ...client.category.flatMap((category) =>
      category.sub_category.map((subCategory) => subCategory.category_id),
    ),
  ]);
};

const createCategoryIdAssigner = (items: DbClientCategoryTree[]) => {
  const assignNextId = createIncrementalIdAssigner(collectCategoryIds(items));

  return (value?: string) => {
    const parsedId = value ? idToNumber(value) : null;

    if (parsedId !== null) {
      return parsedId;
    }

    return Number(assignNextId());
  };
};

const getClientIndexById = (
  items: DbClientCategoryTree[],
  clientId: string,
) => {
  return items.findIndex((client) => String(client.client_id) === clientId);
};

const getCategoryLocation = (items: DbClientCategoryTree[], id: string) => {
  for (let clientIndex = 0; clientIndex < items.length; clientIndex += 1) {
    const categoryIndex = items[clientIndex].category.findIndex(
      (category) => String(category.category_id) === id,
    );

    if (categoryIndex >= 0) {
      return {
        clientIndex,
        categoryIndex,
      };
    }
  }

  return null;
};

const normalizeClientTree = (
  client: DbClientCategoryTree,
): ClientCategoryTree => {
  return camelClientCategoryTreeMapper([
    {
      ...client,
      category: sortCategories(client.category),
    },
  ])[0];
};

const normalizeCategory = (category: DbCategory) => {
  return camelCategoryMapper([
    {
      ...category,
      sub_category: category.sub_category
        .slice()
        .sort((left, right) => left.category_index - right.category_index),
    },
  ])[0];
};

const synchronizeSubCategories = ({
  nextSubCategories,
  previousSubCategories,
  assignId,
  parentActive,
}: {
  nextSubCategories: SaveServiceDeskCategoryTreePayload["categories"][number]["subCategories"];
  previousSubCategories: DbCategory["sub_category"];
  assignId: (value?: string) => number;
  parentActive: boolean;
}) => {
  const synchronizedSubCategories = nextSubCategories.map(
    (subCategory, subCategoryIndex) => {
      const resolvedId = assignId(subCategory.id);

      return {
        category_id: resolvedId,
        category_name: subCategory.name,
        category_description: subCategory.description ?? null,
        category_request_template: subCategory.requestTemplate ?? null,
        category_index: subCategoryIndex + 1,
        category_active: parentActive ? subCategory.active : false,
        default_priority: subCategory.defaultPriority ?? null,
        default_risk_level: subCategory.defaultRiskLevel ?? null,
        default_sla_days: subCategory.defaultSlaDays ?? null,
      };
    },
  );

  const submittedIds = new Set(
    synchronizedSubCategories.map((subCategory) =>
      String(subCategory.category_id),
    ),
  );
  const preservedSubCategories = previousSubCategories
    .filter((subCategory) => !submittedIds.has(String(subCategory.category_id)))
    .sort((left, right) => left.category_index - right.category_index)
    .map((subCategory, subCategoryIndex) => ({
      ...subCategory,
      category_index: synchronizedSubCategories.length + subCategoryIndex + 1,
      category_active: parentActive ? subCategory.category_active : false,
    }));

  return [...synchronizedSubCategories, ...preservedSubCategories];
};

const buildSynchronizedCategory = ({
  category,
  previousCategory,
  assignId,
}: {
  category: SaveServiceDeskCategoryTreePayload["categories"][number];
  previousCategory?: DbCategory;
  assignId: (value?: string) => number;
}) => {
  const resolvedId = previousCategory?.category_id ?? assignId(category.id);
  const active = category.active;

  return {
    category_id: resolvedId,
    category_name: category.name,
    category_description: category.description ?? null,
    category_request_template: category.requestTemplate ?? null,
    category_scope: category.scope,
    category_index: category.index,
    category_active: active,
    default_priority: category.defaultPriority,
    default_risk_level: category.defaultRiskLevel,
    default_sla_days: category.defaultSlaDays,
    sub_category: synchronizeSubCategories({
      nextSubCategories: category.subCategories,
      previousSubCategories: previousCategory?.sub_category ?? [],
      assignId,
      parentActive: active,
    }),
  } satisfies DbCategory;
};

export const localListCategories = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  const items = filterItemsByQuery(
    searchParams,
    camelClientCategoryTreeMapper(getLocalDemoCategories(isInternal)),
  );

  return {
    items,
    total: items.length,
  };
};

export const localGetCategory = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const location = getCategoryLocation(getLocalDemoCategories(isInternal), id);

  if (!location) {
    return null;
  }

  return normalizeCategory(
    getLocalDemoCategories(isInternal)[location.clientIndex].category[
      location.categoryIndex
    ],
  );
};

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
