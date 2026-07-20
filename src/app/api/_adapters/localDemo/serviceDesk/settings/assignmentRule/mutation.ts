import { replaceLocalDemoAssignmentRules } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/lib/application/contracts/serviceDesk";

import {
  buildDbAssignmentRule,
  getAssignmentRuleStore,
  getTenantRulesOrThrow,
  normalizeAssignmentRules,
} from "./ruleUtils";
import { flattenAssignmentRuleTree } from "./treeSync";

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
  const previousRulesByCategoryId = new Map(
    previousRules.map((rule) => [String(rule.category_id), rule]),
  );

  const nextRules = flattenAssignmentRuleTree(payload).flatMap((node) => {
    const rule = buildDbAssignmentRule({
      categoryId: node.categoryId,
      assignee: node.assignee,
    });
    const hasExistingRule = previousRulesByCategoryId.has(node.categoryId);
    const hasAssigneeSelection =
      rule.assignee.job_field_id.length > 0 ||
      rule.assignee.employee_username.length > 0;

    return hasExistingRule || hasAssigneeSelection ? [rule] : [];
  });
  const submittedCategoryIds = new Set(
    nextRules.map((rule) => String(rule.category_id)),
  );
  const preservedRules = previousRules.filter(
    (rule) => !submittedCategoryIds.has(String(rule.category_id)),
  );

  items[tenantId] = [...nextRules, ...preservedRules];
  replaceLocalDemoAssignmentRules({
    tenantId,
    categoryIds: nextRules.map((rule) => rule.category_id),
    assignmentRules: nextRules,
  });

  return normalizeAssignmentRules(items[tenantId]);
};
