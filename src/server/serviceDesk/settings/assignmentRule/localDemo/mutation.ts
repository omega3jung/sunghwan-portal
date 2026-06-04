import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";
import type {
  CreateAssignmentRuleInput,
  UpdateAssignmentRuleInput,
} from "@/feature/serviceDesk/assignmentRule/write";

import {
  buildDbAssignmentRule,
  findCategoryTenantId,
  getAssignmentRuleStore,
  getRuleIndexByCategoryId,
  getTenantRulesOrThrow,
  normalizeAssignmentRule,
  normalizeAssignmentRules,
} from "./ruleUtils";
import { flattenAssignmentRuleTree } from "./treeSync";

export const localCreateAssignmentRule = ({
  isInternal,
  input,
}: {
  isInternal: boolean;
  input: CreateAssignmentRuleInput;
}) => {
  const items = getAssignmentRuleStore(isInternal);
  const tenantId = findCategoryTenantId(items, isInternal, input.categoryId);

  if (!tenantId) {
    throw new ServiceDeskApiError(
      "api.assignmentRules.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const rules = getTenantRulesOrThrow(items, tenantId);
  const nextRule = buildDbAssignmentRule({
    categoryId: input.categoryId,
    assignee: input.assignee,
  });
  const existingRuleIndex = getRuleIndexByCategoryId(rules, input.categoryId);

  if (existingRuleIndex >= 0) {
    rules.splice(existingRuleIndex, 1, nextRule);
  } else {
    rules.push(nextRule);
  }

  return normalizeAssignmentRule(nextRule);
};

export const localUpdateAssignmentRule = ({
  isInternal,
  id,
  input,
}: {
  isInternal: boolean;
  id: string;
  input: UpdateAssignmentRuleInput;
}) => {
  const items = getAssignmentRuleStore(isInternal);
  const tenantId = findCategoryTenantId(items, isInternal, id);

  if (!tenantId) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const targetTenantId = findCategoryTenantId(
    items,
    isInternal,
    input.categoryId,
  );

  if (!targetTenantId) {
    throw new ServiceDeskApiError(
      "api.assignmentRules.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const currentRules = getTenantRulesOrThrow(items, tenantId);
  const currentRuleIndex = getRuleIndexByCategoryId(currentRules, id);

  if (currentRuleIndex >= 0) {
    currentRules.splice(currentRuleIndex, 1);
  }

  const targetRules = getTenantRulesOrThrow(items, targetTenantId);
  const nextRule = buildDbAssignmentRule({
    categoryId: input.categoryId,
    assignee: input.assignee,
  });
  const targetRuleIndex = getRuleIndexByCategoryId(
    targetRules,
    input.categoryId,
  );

  if (targetRuleIndex >= 0) {
    targetRules.splice(targetRuleIndex, 1, nextRule);
  } else {
    targetRules.push(nextRule);
  }

  return normalizeAssignmentRule(nextRule);
};

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

export const localDeleteAssignmentRule = ({
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

    rules.splice(ruleIndex, 1);
    return new Response(null, { status: 204 });
  }

  throw new ServiceDeskApiError("api.common.notFound", 404);
};
