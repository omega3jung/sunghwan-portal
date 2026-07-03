import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import type { TenantCategoryTree } from "@/domain/serviceDesk";
import { camelTenantCategoryTreeMapper } from "@/feature/serviceDesk/category/mapper";
import {
  getBooleanRuleGroupValue,
  parseRuleGroupFilter,
} from "@/server/shared/query";

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
  const filter = parseRuleGroupFilter(searchParams.get("filter"));
  const active =
    parseOptionalBoolean(searchParams.get("active")) ??
    getBooleanRuleGroupValue(filter, "active");
  const tenantId = searchParams.get("tenantId");
  const items = filterItemsByQuery(
    searchParams,
    filterTenantCategoryTreesByActive(
      filterTenantCategoryTreesByTenantId(
        camelTenantCategoryTreeMapper(getLocalDemoCategories(isInternal)),
        tenantId,
      ),
      active,
    ),
  );

  return {
    items,
    total: items.length,
  };
};

function filterTenantCategoryTreesByTenantId(
  items: TenantCategoryTree[],
  tenantId: string | null,
) {
  if (!tenantId) {
    return items;
  }

  return items.filter((tenant) => tenant.id === tenantId);
}

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
