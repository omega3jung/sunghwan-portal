import { getLocalCategoryTrees } from "@/app/api/_adapters/localDemo/serviceDesk/settings/category";
import { filterItemsByQuery } from "@/lib/application/api/query";

import {
  getAssignmentRuleStore,
  getTenantRulesOrThrow,
  normalizeAssignmentRules,
  resolveTenantId,
} from "./ruleUtils";

export const localListAssignmentRules = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  const items = getAssignmentRuleStore(isInternal);
  const tenantId = resolveTenantId(items, searchParams.get("tenantId"));
  const rules = tenantId ? getTenantRulesOrThrow(items, tenantId) : [];
  const scope = searchParams.get("scope");
  const allowedCategoryIds = new Set(
    scope === "INTERNAL" || scope === "PORTAL"
      ? (getLocalCategoryTrees(isInternal)
          .find((tenant) => tenant.id === tenantId)
          ?.categories.filter((category) => category.scope === scope)
          .flatMap((category) => [
            category.id,
            ...category.subCategories.map((subCategory) => subCategory.id),
          ]) ?? [])
      : rules.map((rule) => String(rule.category_id)),
  );
  const normalizedItems = normalizeAssignmentRules(
    rules.filter((rule) => allowedCategoryIds.has(String(rule.category_id))),
  );
  const filteredItems = filterItemsByQuery(searchParams, normalizedItems);

  return {
    items: filteredItems,
    total: filteredItems.length,
  };
};
