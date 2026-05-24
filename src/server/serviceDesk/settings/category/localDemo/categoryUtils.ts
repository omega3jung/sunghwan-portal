import { createIncrementalIdAssigner } from "@/app/api/_helpers";
import type { ClientCategoryTree } from "@/domain/serviceDesk";
import {
  camelCategoryMapper,
  camelClientCategoryTreeMapper,
  type DbCategory,
  type DbClientCategoryTree,
} from "@/feature/serviceDesk/category/mapper";
import { idToNumber } from "@/lib/api/utils/mapId";

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

const collectCategoryIds = (items: DbClientCategoryTree[]) => {
  return items.flatMap((client) => [
    ...client.category.map((category) => category.category_id),
    ...client.category.flatMap((category) =>
      category.sub_category.map((subCategory) => subCategory.category_id),
    ),
  ]);
};

export const createCategoryIdAssigner = (items: DbClientCategoryTree[]) => {
  const assignNextId = createIncrementalIdAssigner(collectCategoryIds(items));

  return (value?: string) => {
    const parsedId = value ? idToNumber(value) : null;

    if (parsedId !== null) {
      return parsedId;
    }

    return Number(assignNextId());
  };
};

export const getClientIndexById = (
  items: DbClientCategoryTree[],
  clientId: string,
) => {
  return items.findIndex((client) => String(client.client_id) === clientId);
};

export const getCategoryLocation = (
  items: DbClientCategoryTree[],
  id: string,
) => {
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

export const normalizeClientTree = (
  client: DbClientCategoryTree,
): ClientCategoryTree => {
  return camelClientCategoryTreeMapper([
    {
      ...client,
      category: sortCategories(client.category),
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
