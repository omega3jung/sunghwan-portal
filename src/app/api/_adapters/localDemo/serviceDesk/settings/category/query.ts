import { getLocalDemoCategories } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import type { TenantCategoryTree } from "@/domain/serviceDesk";
import { filterItemsByQuery } from "@/lib/application/api/query";
import {
  getBooleanRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import { camelTenantCategoryTreeMapper } from "@/lib/application/contracts/serviceDesk";

import { normalizeTenantTree } from "./categoryUtils";

type FilterableTenantCategoryTree = TenantCategoryTree & {
  tenant_company_id: string;
  tenant_id: string;
};

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
  tenantCompanyId,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
  tenantCompanyId: string | number;
}) => {
  const filter = parseRuleGroupFilter(searchParams.get("filter"));
  const active =
    parseOptionalBoolean(searchParams.get("active")) ??
    getBooleanRuleGroupValue(filter, "active");
  const tenantId = searchParams.get("tenantId");
  const scope = searchParams.get("scope");
  const tenantCategoryTrees = filterTenantCategoryTreesByActive(
    filterTenantCategoryTreesByTenantId(
      filterTenantCategoryTreesByCompanyId(
        camelTenantCategoryTreeMapper(getLocalDemoCategories(isInternal)),
        tenantCompanyId,
      ),
      tenantId,
    ),
    active,
  );
  const items = filterItemsByQuery(
    searchParams,
    addTenantCategoryTreeFilterAliases(
      filterTenantCategoryTreesByScope(tenantCategoryTrees, scope),
    ),
  ).map(removeTenantCategoryTreeFilterAliases);

  return {
    items,
    total: items.length,
  };
};

function filterTenantCategoryTreesByCompanyId(
  items: TenantCategoryTree[],
  tenantCompanyId: string | number,
) {
  return items.filter(
    (tenant) => String(tenant.companyId) === String(tenantCompanyId),
  );
}

function filterTenantCategoryTreesByScope(
  items: TenantCategoryTree[],
  scope: string | null,
) {
  if (scope !== "INTERNAL" && scope !== "PORTAL") {
    return items;
  }

  return items.map((tenant) => ({
    ...tenant,
    categories: tenant.categories.filter(
      (category) => category.scope === scope,
    ),
  }));
}

function filterTenantCategoryTreesByTenantId(
  items: TenantCategoryTree[],
  tenantId: string | null,
) {
  if (!tenantId) {
    return items;
  }

  return items.filter((tenant) => tenant.id === tenantId);
}

function addTenantCategoryTreeFilterAliases(
  items: TenantCategoryTree[],
): FilterableTenantCategoryTree[] {
  return items.map((tenant) => ({
    ...tenant,
    tenant_company_id: tenant.companyId,
    tenant_id: tenant.id,
  }));
}

function removeTenantCategoryTreeFilterAliases({
  tenant_company_id: _tenantCompanyId,
  tenant_id: _tenantId,
  ...tenant
}: FilterableTenantCategoryTree): TenantCategoryTree {
  return tenant;
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
