import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import type { TenantCategoryTree } from "@/domain/serviceDesk";
import { camelTenantCategoryTreeMapper } from "@/feature/serviceDesk/category/mapper";

import { getLocalDemoCategories } from "../../state";
import {
  getCategoryLocation,
  normalizeCategory,
  normalizeTenantTree,
} from "./categoryUtils";

export const getLocalCategoryTrees = (
  isInternal: boolean,
): TenantCategoryTree[] => {
  return getLocalDemoCategories(isInternal).map((tenant) =>
    normalizeTenantTree(tenant),
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
    camelTenantCategoryTreeMapper(getLocalDemoCategories(isInternal)),
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
    getLocalDemoCategories(isInternal)[location.tenantIndex].category[
      location.categoryIndex
    ],
  );
};
