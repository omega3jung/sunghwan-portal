import { filterItemsByQuery } from "@/app/api/_helpers/filter";

import {
  getAssignmentRuleStore,
  getRuleIndexByCategoryId,
  getTenantRulesOrThrow,
  normalizeAssignmentRule,
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

export const localGetAssignmentRule = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const items = getAssignmentRuleStore(isInternal);

  for (const rules of Object.values(items)) {
    const ruleIndex = getRuleIndexByCategoryId(rules, id);

    if (ruleIndex < 0) {
      continue;
    }

    return normalizeAssignmentRule(rules[ruleIndex]);
  }

  return null;
};
