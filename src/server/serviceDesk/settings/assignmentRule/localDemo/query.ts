import { filterItemsByQuery } from "@/app/api/_helpers/filter";

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
  const normalizedItems = normalizeAssignmentRules(rules);
  const filteredItems = filterItemsByQuery(searchParams, normalizedItems);

  return {
    items: filteredItems,
    total: filteredItems.length,
  };
};
