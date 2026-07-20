import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import type { AssignmentRecommendationInput } from "@/lib/application/contracts/serviceDesk";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/lib/application/contracts/serviceDesk";
import {
  type AssignmentRuleDto,
  createAssignmentRule,
  deleteAssignmentRuleById,
  getAssignmentRecommendationResponse,
  getAssignmentRulesByTenantId,
  getAssignmentRulesResponseByTenantId,
  hasAssignmentRuleAssigneeSelection,
  updateAssignmentRuleById,
  validateAssignmentRuleTreeMutation,
} from "@/server/data/serviceDesk/assignmentRule";
import { getCategoryTreeByTenantId } from "@/server/data/serviceDesk/category";
import {
  assertAssignmentReferencesValidForWrite,
  mapSettingsWriteError,
} from "@/server/data/serviceDesk/shared";
import {
  type PortalApiQueryExecutor,
  withPortalApiTransaction,
} from "@/server/shared/supabase/portalApiClient";
import { isSameNumberArray, isSameStringArray } from "@/shared/utils/value";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";
import { resolveAuthorizedSettingsTenant } from "./shared";

type AssignmentTreeCategoryItem =
  SaveServiceDeskAssignmentRuleTreePayload["categories"][number];
type AssignmentTreeNode = {
  category_id: number;
  assignee: AssignmentRuleDto["assignee"];
};

const ASSIGNMENT_RULE_RECOMMENDATIONS_PATH_PATTERN =
  /^\/service-desk\/assignment-rules\/recommendations$/;
const ASSIGNMENT_RULES_LIST_PATH_PATTERN = /^\/service-desk\/assignment-rules$/;

export async function handleAssignmentRulePortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const assignmentRuleRecommendationsMatch =
    ASSIGNMENT_RULE_RECOMMENDATIONS_PATH_PATTERN.exec(context.path);
  const assignmentRulesListMatch = ASSIGNMENT_RULES_LIST_PATH_PATTERN.exec(
    context.path,
  );

  if (!assignmentRuleRecommendationsMatch && !assignmentRulesListMatch) {
    return createNotFoundResponse();
  }

  if (assignmentRulesListMatch) {
    if (context.method === "GET") {
      const tenantId = getPortalApiQueryValue(
        context.request,
        context.options,
        "tenantId",
      );
      const isInternal =
        parseBooleanQueryValue(
          getPortalApiQueryValue(
            context.request,
            context.options,
            "isInternal",
          ),
        ) ?? true;
      const scope = getPortalApiQueryValue(
        context.request,
        context.options,
        "scope",
      );
      const allItems = await getAssignmentRulesResponseByTenantId({
        tenantId,
        isInternal,
      });
      const items = await filterAssignmentRulesByScope(
        allItems,
        tenantId,
        scope,
      );

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (context.method === "PUT") {
      const body = requireBody<SaveServiceDeskAssignmentRuleTreePayload>(
        context.options,
      );
      const authorization = await resolveAuthorizedSettingsTenant({
        request: context.request,
        requestedTenantId: body.tenantId,
      });
      const tenant = authorization.tenant;

      if (!tenant) {
        throw Object.assign(new Error("A target tenant is required."), {
          status: 400,
        });
      }

      const submittedCategoryIds = await validateAssignmentRuleTreeMutation({
        principal: authorization.principal,
        tenant,
        payload: body,
      });
      const assignmentRules = await saveAssignmentRuleTree(body);

      return NextResponse.json(
        assignmentRules.filter((rule) =>
          submittedCategoryIds.has(String(rule.category_id)),
        ),
      );
    }

    return createNotFoundResponse();
  }

  if (assignmentRuleRecommendationsMatch) {
    if (context.method !== "POST") {
      return createNotFoundResponse();
    }

    const input = requireBody<AssignmentRecommendationInput>(context.options);
    const body = await getAssignmentRecommendationResponse({
      input,
    });

    return NextResponse.json(body);
  }

  return createNotFoundResponse();
}

async function saveAssignmentRuleTree(
  payload: SaveServiceDeskAssignmentRuleTreePayload,
) {
  try {
    return await withPortalApiTransaction((query) =>
      saveAssignmentRuleTreeInTransaction(payload, query),
    );
  } catch (error) {
    throw mapSettingsWriteError(error, "assignmentRules");
  }
}

async function saveAssignmentRuleTreeInTransaction(
  payload: SaveServiceDeskAssignmentRuleTreePayload,
  query: PortalApiQueryExecutor,
) {
  const tenantId = Number(payload.tenantId);

  if (!Number.isFinite(tenantId)) {
    throw new Error("Invalid tenantId");
  }

  const submittedCategoryIds = new Set(
    payload.categories.flatMap((category) => [
      Number(category.id),
      ...category.subCategories.map((subCategory) => Number(subCategory.id)),
    ]),
  );
  const currentAssignmentRules = (
    await getAssignmentRulesByTenantId(tenantId, query)
  ).filter((rule) => submittedCategoryIds.has(rule.category_id));
  const currentAssignmentRulesByCategoryId = new Map(
    currentAssignmentRules.map((assignmentRule) => [
      assignmentRule.category_id,
      assignmentRule,
    ]),
  );

  const nextAssignmentRules = flattenAssignmentRuleTreePayload(payload);
  const nextAssignmentRulesByCategoryId = new Map(
    nextAssignmentRules.map((assignmentRule) => [
      assignmentRule.category_id,
      assignmentRule,
    ]),
  );

  await assertAssignmentReferencesValidForWrite(
    query,
    tenantId,
    nextAssignmentRules
      .filter((rule) => hasAssignmentRuleAssigneeSelection(rule.assignee))
      .map((rule) => ({
        categoryId: rule.category_id,
        assignee: rule.assignee,
      })),
  );

  const createTasks: Array<() => Promise<unknown>> = [];
  const updateTasks: Array<() => Promise<unknown>> = [];
  const deleteTasks: Array<() => Promise<unknown>> = [];

  for (const nextAssignmentRule of nextAssignmentRules) {
    const currentAssignmentRule = currentAssignmentRulesByCategoryId.get(
      nextAssignmentRule.category_id,
    );

    if (!currentAssignmentRule) {
      const assignee = nextAssignmentRule.assignee;

      if (!hasAssignmentRuleAssigneeSelection(assignee)) {
        continue;
      }

      createTasks.push(() =>
        createAssignmentRule(
          {
            tenant_id: tenantId,
            category_id: nextAssignmentRule.category_id,
            assignee,
          },
          query,
        ),
      );
      continue;
    }

    if (
      isSameAssignmentRuleAssignee(
        currentAssignmentRule.assignee,
        nextAssignmentRule.assignee,
      )
    ) {
      continue;
    }

    updateTasks.push(() =>
      updateAssignmentRuleById(
        tenantId,
        currentAssignmentRule.assignment_rule_id,
        {
          category_id: nextAssignmentRule.category_id,
          assignee: nextAssignmentRule.assignee,
        },
        query,
      ),
    );
  }

  for (const currentAssignmentRule of currentAssignmentRules) {
    if (
      !nextAssignmentRulesByCategoryId.has(currentAssignmentRule.category_id)
    ) {
      deleteTasks.push(() =>
        deleteAssignmentRuleById(
          tenantId,
          currentAssignmentRule.assignment_rule_id,
          query,
        ),
      );
    }
  }

  await runWithConcurrencyLimit(
    [...updateTasks, ...createTasks, ...deleteTasks],
    8,
  );

  return getAssignmentRulesByTenantId(tenantId, query);
}

async function filterAssignmentRulesByScope(
  items: AssignmentRuleDto[],
  tenantId: string | null,
  scope: string | null,
) {
  if ((scope !== "INTERNAL" && scope !== "PORTAL") || !tenantId) {
    return items;
  }

  const allowedCategoryIds = new Set(
    (await getCategoryTreeByTenantId(tenantId))
      .filter((category) => category.category_scope === scope)
      .flatMap((category) => [
        category.category_id,
        ...category.sub_category.map((subCategory) => subCategory.category_id),
      ]),
  );

  return items.filter((rule) => allowedCategoryIds.has(rule.category_id));
}

async function runWithConcurrencyLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing = new Set<Promise<void>>();

  for (const task of tasks) {
    const promise = task().then((result) => {
      results.push(result);
    });

    executing.add(promise);

    promise.finally(() => {
      executing.delete(promise);
    });

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);

  return results;
}

function isSameAssignmentRuleAssignee(
  current: AssignmentRuleDto["assignee"],
  next: AssignmentRuleDto["assignee"],
): boolean {
  return (
    isSameNumberArray(current.job_field_id, next.job_field_id) &&
    isSameStringArray(current.employee_username, next.employee_username) &&
    Boolean(current.include_tenant_company) ===
      Boolean(next.include_tenant_company)
  );
}

function flattenAssignmentRuleTreePayload(
  payload: SaveServiceDeskAssignmentRuleTreePayload,
): AssignmentTreeNode[] {
  return payload.categories.flatMap((category) => {
    const currentNodes: AssignmentTreeNode[] = [
      {
        category_id: Number(category.id),
        assignee: mapAssignmentTreeAssignee(category.assignee),
      },
    ];

    for (const subCategory of category.subCategories) {
      currentNodes.push({
        category_id: Number(subCategory.id),
        assignee: mapAssignmentTreeAssignee(subCategory.assignee),
      });
    }

    return currentNodes;
  });
}

function mapAssignmentTreeAssignee(
  assignee: AssignmentTreeCategoryItem["assignee"],
): AssignmentTreeNode["assignee"] {
  return {
    job_field_id: assignee.jobFieldIds.map(Number),
    employee_username: assignee.assigneeUsernames.map(String),
    include_tenant_company: assignee.includeTenantCompany === true,
  };
}
