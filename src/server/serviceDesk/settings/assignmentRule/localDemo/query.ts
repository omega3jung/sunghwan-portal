import { filterItemsByQuery } from "@/app/api/_helpers/filter";

import {
  getAssignmentRuleStore,
  getClientRulesOrThrow,
  getRuleIndexByCategoryId,
  normalizeAssignmentRule,
  normalizeAssignmentRules,
  resolveClientId,
} from "./ruleUtils";

export const localListAssignmentRules = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  const items = getAssignmentRuleStore(isInternal);
  const clientId = resolveClientId(items, searchParams.get("clientId"));
  const rules = clientId ? getClientRulesOrThrow(items, clientId) : [];
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
