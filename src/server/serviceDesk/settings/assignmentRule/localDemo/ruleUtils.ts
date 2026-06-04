import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { AssignmentRule } from "@/domain/serviceDesk";
import type { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule";
import { camelAssignmentRuleMapper } from "@/feature/serviceDesk/assignmentRule";
import type { DbTenantCategoryTree } from "@/feature/serviceDesk/category";
import {
  clientCategorySettingsMock,
  internalCategorySettingsMock,
} from "@/mocks/domain/serviceDesk/categories";

import { getLocalDemoAssignmentRulesTree } from "../../state";

export type AssignmentRuleStore = Record<string, DbAssignmentRule[]>;

const buildAssignmentRuleSeed = ({
  categoryTrees,
  templateRules,
}: {
  categoryTrees: DbTenantCategoryTree[];
  templateRules: DbAssignmentRule[];
}): AssignmentRuleStore => {
  const templateMap = new Map(
    templateRules.map((rule) => [String(rule.category_id), rule]),
  );

  return Object.fromEntries(
    categoryTrees.map((tenant) => [
      String(tenant.tenant_id),
      [
        ...tenant.category.map((category) =>
          templateMap.get(String(category.category_id)),
        ),
        ...tenant.category.flatMap((category) =>
          category.sub_category.map((subCategory) =>
            templateMap.get(String(subCategory.category_id)),
          ),
        ),
      ].flatMap((rule) => (rule ? [rule] : [])),
    ]),
  );
};

export const getAssignmentRuleStore = (isInternal: boolean) => {
  return buildAssignmentRuleSeed(getLocalDemoAssignmentRulesTree(isInternal));
};

const getCategoryTrees = (isInternal: boolean) => {
  return isInternal ? internalCategorySettingsMock : clientCategorySettingsMock;
};

const normalizeAssigneeIds = (value: string[]) => {
  return Array.from(new Set(value)).sort((left, right) =>
    left.localeCompare(right),
  );
};

const normalizeJobFieldIds = (value: string[]) => {
  return Array.from(new Set(value))
    .map((id) => Number(id))
    .sort((left, right) => left - right);
};

export const normalizeAssignmentRule = (assignmentRule: DbAssignmentRule) => {
  return camelAssignmentRuleMapper([assignmentRule])[0] ?? null;
};

export const normalizeAssignmentRules = (
  assignmentRules: DbAssignmentRule[],
) => {
  return camelAssignmentRuleMapper(
    assignmentRules
      .slice()
      .sort((left, right) => left.category_id - right.category_id),
  );
};

export const resolveTenantId = (
  items: AssignmentRuleStore,
  requestedTenantId: string | null,
) => {
  if (requestedTenantId && items[requestedTenantId]) {
    return requestedTenantId;
  }

  return Object.keys(items)[0] ?? null;
};

export const getTenantRulesOrThrow = (
  items: AssignmentRuleStore,
  tenantId: string,
) => {
  const rules = items[tenantId];

  if (!rules) {
    throw new ServiceDeskApiError(
      "api.assignmentRules.localDemo.tenantNotFound",
      404,
      { tenantId },
    );
  }

  return rules;
};

export const getRuleIndexByCategoryId = (
  rules: DbAssignmentRule[],
  categoryId: string,
) => {
  return rules.findIndex((rule) => String(rule.category_id) === categoryId);
};

export const findCategoryTenantId = (
  items: AssignmentRuleStore,
  isInternal: boolean,
  categoryId: string,
) => {
  for (const [tenantId, rules] of Object.entries(items)) {
    if (getRuleIndexByCategoryId(rules, categoryId) >= 0) {
      return tenantId;
    }
  }

  for (const [tenantId] of Object.entries(items)) {
    const categoryTree = getCategoryTrees(isInternal).find(
      (tenant) => String(tenant.tenant_id) === tenantId,
    );

    if (
      categoryTree?.category.some(
        (category) =>
          String(category.category_id) === categoryId ||
          category.sub_category.some(
            (subCategory) => String(subCategory.category_id) === categoryId,
          ),
      )
    ) {
      return tenantId;
    }
  }

  return null;
};

export const buildDbAssignmentRule = ({
  categoryId,
  assignee,
}: {
  categoryId: string;
  assignee: AssignmentRule["assignee"];
}): DbAssignmentRule => {
  return {
    category_id: Number(categoryId),
    assignee: {
      job_field_id: normalizeJobFieldIds(assignee.jobFieldIds),
      employee_username: normalizeAssigneeIds(assignee.assigneeUsernames),
    },
  };
};
