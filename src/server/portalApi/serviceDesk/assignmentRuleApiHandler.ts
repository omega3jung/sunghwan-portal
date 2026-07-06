import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import { getAuthToken } from "@/app/api/_helpers";
import type { AssignmentRecommendationInput } from "@/feature/serviceDesk/assignmentRule/recommendation";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";
import type { AssignmentRuleDto } from "@/server/data/serviceDesk/assignmentRule";
import {
  createAssignmentRule,
  deleteAssignmentRuleById,
  getAssignmentRecommendationResponse,
  getAssignmentRulesByTenantId,
  getAssignmentRulesResponseByTenantId,
  updateAssignmentRuleById,
} from "@/server/data/serviceDesk/assignmentRule";
import { isSameNumberArray, isSameStringArray } from "@/shared/utils/value";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";

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
      const items = await getAssignmentRulesResponseByTenantId({
        tenantId,
        isInternal,
      });

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (context.method === "PUT") {
      const body = requireBody<SaveServiceDeskAssignmentRuleTreePayload>(
        context.options,
      );
      const assignmentRules = await saveAssignmentRuleTree(body);

      return NextResponse.json(assignmentRules);
    }

    return createNotFoundResponse();
  }

  if (assignmentRuleRecommendationsMatch) {
    if (context.method !== "POST") {
      return createNotFoundResponse();
    }

    const input = requireBody<AssignmentRecommendationInput>(context.options);
    const token = await getAuthToken(context.request);
    const isInternal = token?.userScope === "INTERNAL";
    const tenantId =
      !isInternal && typeof token?.companyId === "number"
        ? token.companyId
        : null;
    const body = await getAssignmentRecommendationResponse({
      input,
      tenantId,
      isInternal,
    });

    return NextResponse.json(body);
  }

  return createNotFoundResponse();
}

async function saveAssignmentRuleTree(
  payload: SaveServiceDeskAssignmentRuleTreePayload,
) {
  const tenantId = Number(payload.tenantId);

  if (!Number.isFinite(tenantId)) {
    throw new Error("Invalid tenantId");
  }

  const currentAssignmentRules = await getAssignmentRulesByTenantId(tenantId);
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

  const createTasks: Array<() => Promise<unknown>> = [];
  const updateTasks: Array<() => Promise<unknown>> = [];
  const deleteTasks: Array<() => Promise<unknown>> = [];

  for (const nextAssignmentRule of nextAssignmentRules) {
    const currentAssignmentRule = currentAssignmentRulesByCategoryId.get(
      nextAssignmentRule.category_id,
    );

    if (!currentAssignmentRule) {
      createTasks.push(() =>
        createAssignmentRule({
          tenant_id: tenantId,
          category_id: nextAssignmentRule.category_id,
          assignee: nextAssignmentRule.assignee,
        }),
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
        ),
      );
    }
  }

  await runWithConcurrencyLimit(
    [...updateTasks, ...createTasks, ...deleteTasks],
    8,
  );

  return getAssignmentRulesByTenantId(tenantId);
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
    isSameStringArray(current.employee_username, next.employee_username)
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
  };
}
