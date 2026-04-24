import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { AssignmentRule } from "@/domain/serviceDesk";
import type { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule/mapper";
import { camelAssignmentRuleMapper } from "@/feature/serviceDesk/assignmentRule/mapper";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";
import type {
  CreateAssignmentRuleInput,
  UpdateAssignmentRuleInput,
} from "@/feature/serviceDesk/assignmentRule/write";
import type { DbClientCategoryTree } from "@/feature/serviceDesk/category/mapper";
import {
  clientAssignmentRuleSettingsMock,
  internalAssignmentRuleSettingsMock,
} from "@/mocks/domain/serviceDesk/assignmentRules";
import {
  clientCategorySettingsMock,
  internalCategorySettingsMock,
} from "@/mocks/domain/serviceDesk/categories";
import { createDualScopeLocalStore } from "@/server/serviceDesk/shared/localStore";

type AssignmentRuleStore = Record<string, DbAssignmentRule[]>;

const buildAssignmentRuleSeed = ({
  categoryTrees,
  templateRules,
}: {
  categoryTrees: DbClientCategoryTree[];
  templateRules: DbAssignmentRule[];
}): AssignmentRuleStore => {
  const templateMap = new Map(
    templateRules.map((rule) => [String(rule.category_id), rule]),
  );

  return Object.fromEntries(
    categoryTrees.map((client) => [
      String(client.client_id),
      [
        ...client.category.map((category) =>
          templateMap.get(String(category.category_id)),
        ),
        ...client.category.flatMap((category) =>
          category.sub_category.map((subCategory) =>
            templateMap.get(String(subCategory.category_id)),
          ),
        ),
      ].flatMap((rule) => (rule ? [rule] : [])),
    ]),
  );
};

const assignmentRuleStore = createDualScopeLocalStore<AssignmentRuleStore>({
  internalSeed: buildAssignmentRuleSeed({
    categoryTrees: internalCategorySettingsMock,
    templateRules: [
      ...internalAssignmentRuleSettingsMock,
      ...clientAssignmentRuleSettingsMock,
    ],
  }),
  clientSeed: buildAssignmentRuleSeed({
    categoryTrees: clientCategorySettingsMock,
    templateRules: clientAssignmentRuleSettingsMock,
  }),
});

const getAssignmentRuleStore = (isInternal: boolean) => {
  return assignmentRuleStore.getStore(isInternal);
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

const normalizeAssignmentRule = (assignmentRule: DbAssignmentRule) => {
  return camelAssignmentRuleMapper([assignmentRule])[0] ?? null;
};

const normalizeAssignmentRules = (assignmentRules: DbAssignmentRule[]) => {
  return camelAssignmentRuleMapper(
    assignmentRules
      .slice()
      .sort((left, right) => left.category_id - right.category_id),
  );
};

const resolveClientId = (
  items: AssignmentRuleStore,
  requestedClientId: string | null,
) => {
  if (requestedClientId && items[requestedClientId]) {
    return requestedClientId;
  }

  return Object.keys(items)[0] ?? null;
};

const getClientRulesOrThrow = (
  items: AssignmentRuleStore,
  clientId: string,
) => {
  const rules = items[clientId];

  if (!rules) {
    throw new ServiceDeskApiError(
      "api.assignmentRules.localDemo.clientNotFound",
      404,
      { clientId },
    );
  }

  return rules;
};

const getRuleIndexByCategoryId = (
  rules: DbAssignmentRule[],
  categoryId: string,
) => {
  return rules.findIndex((rule) => String(rule.category_id) === categoryId);
};

const findCategoryClientId = (
  items: AssignmentRuleStore,
  isInternal: boolean,
  categoryId: string,
) => {
  for (const [clientId, rules] of Object.entries(items)) {
    if (getRuleIndexByCategoryId(rules, categoryId) >= 0) {
      return clientId;
    }
  }

  for (const [clientId] of Object.entries(items)) {
    const categoryTree = getCategoryTrees(isInternal).find(
      (client) => String(client.client_id) === clientId,
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
      return clientId;
    }
  }

  return null;
};

const buildDbAssignmentRule = ({
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
      employee_id: normalizeAssigneeIds(assignee.employeeIds),
    },
  };
};

const flattenAssignmentRuleTree = (
  payload: SaveServiceDeskAssignmentRuleTreePayload,
) => {
  return payload.categories.flatMap((category) => [
    {
      categoryId: category.id,
      assignee: category.assignee,
    },
    ...category.subCategories.map((subCategory) => ({
      categoryId: subCategory.id,
      assignee: subCategory.assignee,
    })),
  ]);
};

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

export const localCreateAssignmentRule = ({
  isInternal,
  input,
}: {
  isInternal: boolean;
  input: CreateAssignmentRuleInput;
}) => {
  const items = getAssignmentRuleStore(isInternal);
  const clientId = findCategoryClientId(items, isInternal, input.categoryId);

  if (!clientId) {
    throw new ServiceDeskApiError(
      "api.assignmentRules.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const rules = getClientRulesOrThrow(items, clientId);
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
  const clientId = findCategoryClientId(items, isInternal, id);

  if (!clientId) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const targetClientId = findCategoryClientId(
    items,
    isInternal,
    input.categoryId,
  );

  if (!targetClientId) {
    throw new ServiceDeskApiError(
      "api.assignmentRules.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const currentRules = getClientRulesOrThrow(items, clientId);
  const currentRuleIndex = getRuleIndexByCategoryId(currentRules, id);

  if (currentRuleIndex >= 0) {
    currentRules.splice(currentRuleIndex, 1);
  }

  const targetRules = getClientRulesOrThrow(items, targetClientId);
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
  const clientId = payload.clientId;

  getClientRulesOrThrow(items, clientId);

  items[clientId] = flattenAssignmentRuleTree(payload).map((node) =>
    buildDbAssignmentRule({
      categoryId: node.categoryId,
      assignee: node.assignee,
    }),
  );

  return normalizeAssignmentRules(items[clientId]);
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
