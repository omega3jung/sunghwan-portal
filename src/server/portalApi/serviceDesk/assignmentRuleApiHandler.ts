import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import { getAuthToken } from "@/app/api/_helpers";
import type { AssignmentRecommendationInput } from "@/feature/serviceDesk/assignmentRule/recommendation";
import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";
import type {
  AssignmentRuleDto,
} from "@/server/data/serviceDesk/assignmentRule";
import {
  createAssignmentRule,
  deleteAssignmentRuleById,
  getAssignmentRulesByTenantId,
  getAssignmentRulesResponseByTenantId,
  updateAssignmentRuleById,
} from "@/server/data/serviceDesk/assignmentRule";
import { resolveLocalAssignmentRecommendation } from "@/server/serviceDesk/settings/assignmentRule/localDemo";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiShared";

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

    const body = requireBody<AssignmentRecommendationInput>(context.options);
    const token = await getAuthToken(context.request);
    const isInternal = token?.userScope === "INTERNAL";

    return NextResponse.json(
      resolveLocalAssignmentRecommendation({
        input: body,
        isInternal,
      }),
    );
  }

  return createNotFoundResponse();
}

async function saveAssignmentRuleTree(
  payload: SaveServiceDeskAssignmentRuleTreePayload,
) {
  const tenantId = Number(payload.tenantId);
  const currentAssignmentRules = await getAssignmentRulesByTenantId(tenantId);
  const currentAssignmentRulesByCategoryId = new Map(
    currentAssignmentRules.map((assignmentRule) => [
      assignmentRule.category_id,
      assignmentRule,
    ]),
  );
  const nextAssignmentRules = flattenAssignmentRuleTreePayload(payload);
  const submittedCategoryIds = new Set<number>();

  for (const assignmentRule of nextAssignmentRules) {
    submittedCategoryIds.add(assignmentRule.category_id);
    const currentAssignmentRule = currentAssignmentRulesByCategoryId.get(
      assignmentRule.category_id,
    );

    if (currentAssignmentRule) {
      await updateAssignmentRuleById(
        tenantId,
        currentAssignmentRule.assignment_rule_id,
        {
          category_id: assignmentRule.category_id,
          assignee: assignmentRule.assignee,
        },
      );
      continue;
    }

    await createAssignmentRule({
      tenant_id: tenantId,
      category_id: assignmentRule.category_id,
      assignee: assignmentRule.assignee,
    });
  }

  for (const assignmentRule of currentAssignmentRules) {
    if (!submittedCategoryIds.has(assignmentRule.category_id)) {
      await deleteAssignmentRuleById(
        tenantId,
        assignmentRule.assignment_rule_id,
      );
    }
  }

  return getAssignmentRulesByTenantId(tenantId);
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
