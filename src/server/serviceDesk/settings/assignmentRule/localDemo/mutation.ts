import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";
import { replaceLocalDemoAssignmentRules } from "@/server/serviceDesk/settings/state";

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

  const nextRules = flattenAssignmentRuleTree(payload).map((node) =>
    buildDbAssignmentRule({
      categoryId: node.categoryId,
      assignee: node.assignee,
    }),
  );

  items[tenantId] = nextRules;
  replaceLocalDemoAssignmentRules({
    tenantId,
    categoryIds: [
      ...previousRules.map((rule) => rule.category_id),
      ...nextRules.map((rule) => rule.category_id),
    ],
    assignmentRules: nextRules,
  });

  return normalizeAssignmentRules(items[tenantId]);
};
