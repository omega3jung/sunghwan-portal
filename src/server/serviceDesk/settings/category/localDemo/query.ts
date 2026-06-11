import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import type { TenantCategoryTree } from "@/domain/serviceDesk";
import { camelTenantCategoryTreeMapper } from "@/feature/serviceDesk/category/mapper";

import { getLocalDemoCategories } from "../../state";
import { normalizeTenantTree } from "./categoryUtils";

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
    filterTenantCategoryTreesByActive(
      camelTenantCategoryTreeMapper(getLocalDemoCategories(isInternal)),
      parseOptionalBoolean(searchParams.get("active")),
    ),
  );

  return {
    items,
    total: items.length,
  };
};

function parseOptionalBoolean(value: string | null): boolean | null {
  if (value === null) {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

function filterTenantCategoryTreesByActive(
  items: TenantCategoryTree[],
  active: boolean | null,
) {
  if (active === null) {
    return items;
  }

  return items.map((tenant) => ({
    ...tenant,
    categories: tenant.categories
      .filter((category) => category.active === active)
      .map((category) => ({
        ...category,
        subCategories: category.subCategories.filter(
          (subCategory) => subCategory.active === active,
        ),
      })),
  }));
}
