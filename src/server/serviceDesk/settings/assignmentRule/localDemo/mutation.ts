import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";

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

  getTenantRulesOrThrow(items, tenantId);

  items[tenantId] = flattenAssignmentRuleTree(payload).map((node) =>
    buildDbAssignmentRule({
      categoryId: node.categoryId,
      assignee: node.assignee,
    }),
  );

  return normalizeAssignmentRules(items[tenantId]);
};
