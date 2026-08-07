import { replaceLocalDemoAssignmentRules } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { hasAssignmentRuleSelection } from "@/domain/serviceDesk";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/lib/application/contracts/serviceDesk";

import {
  buildDbAssignmentRule,
  getAssignmentRuleStore,
  getTenantRulesOrThrow,
  normalizeAssignmentRules,
} from "./ruleUtils";
import { flattenAssignmentRuleTree } from "./treeSync";

/**
 * Reconciles submitted assignment rules while preserving unsubmitted categories.
 *
 * Nodes with no effective selection intentionally remove that category's rule;
 * runtime routing may then fall back from a subcategory to its main category.
 */
export const localSaveAssignmentRuleTree = ({
  isInternal,
  payload,
}: {
  isInternal: boolean;
  payload: SaveServiceDeskAssignmentRuleTreePayload;
}) => {
  const items = getAssignmentRuleStore(isInternal);
  const tenantId = payload.tenantId;
  const previousRules = getTenantRulesOrThrow(items, tenantId);
  const submittedNodes = flattenAssignmentRuleTree(payload);
  const submittedCategoryIds = new Set(
    submittedNodes.map((node) => node.categoryId),
  );
  const nextRules = submittedNodes
    .filter((node) => hasAssignmentRuleSelection(node.assignee))
    .map((node) =>
      buildDbAssignmentRule({
        categoryId: node.categoryId,
        assignee: node.assignee,
      }),
    );
  const preservedRules = previousRules.filter(
    (rule) => !submittedCategoryIds.has(String(rule.category_id)),
  );

  items[tenantId] = [...nextRules, ...preservedRules];
  replaceLocalDemoAssignmentRules({
    tenantId,
    categoryIds: submittedCategoryIds,
    assignmentRules: nextRules,
  });

  return normalizeAssignmentRules(items[tenantId]);
};
