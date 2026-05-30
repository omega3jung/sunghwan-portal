import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import type { ClientCategoryTree } from "@/domain/serviceDesk";
import { camelClientCategoryTreeMapper } from "@/feature/serviceDesk/category/mapper";

import { getLocalDemoCategories } from "../../state";
import {
  getCategoryLocation,
  normalizeCategory,
  normalizeClientTree,
} from "./categoryUtils";

export const getLocalCategoryTrees = (
  isInternal: boolean,
): ClientCategoryTree[] => {
  return getLocalDemoCategories(isInternal).map((client) =>
    normalizeClientTree(client),
  );
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
