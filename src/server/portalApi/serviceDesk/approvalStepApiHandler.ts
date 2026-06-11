import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import type { SaveServiceDeskApprovalStepTreePayload } from "@/feature/serviceDesk/approvalStep/types";
import type {
  ApprovalStepDto,
  CreateApprovalStepInputDto,
  UpdateApprovalStepInputDto,
} from "@/server/data/serviceDesk/approvalStep";
import {
  createApprovalStep,
  deleteApprovalStepById,
  getApprovalSettingsResponseByTenantId,
  getCategoryApprovalSettingsByTenantId,
  updateApprovalStepById,
} from "@/server/data/serviceDesk/approvalStep";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  parseOptionalId,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiShared";

type ApprovalTreeCategoryItem =
  SaveServiceDeskApprovalStepTreePayload["categories"][number];
type ApprovalTreeStepItem = ApprovalTreeCategoryItem["approvalSteps"][number];
type SubmittedApprovalStepPlan = {
  approvalStep: ApprovalTreeStepItem;
  approvalStepId: number | null;
  approvalStepIndex: number;
  categoryId: number;
};

const APPROVAL_SETTINGS_LIST_PATH_PATTERN = /^\/service-desk\/approval-steps$/;

export async function handleApprovalStepPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const approvalSettingsListMatch = APPROVAL_SETTINGS_LIST_PATH_PATTERN.exec(
    context.path,
  );

  if (!approvalSettingsListMatch) {
    return createNotFoundResponse();
  }

  if (approvalSettingsListMatch) {
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
      const items = await getApprovalSettingsResponseByTenantId({
        tenantId,
        isInternal,
      });

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (context.method === "PUT") {
      const body = requireBody<SaveServiceDeskApprovalStepTreePayload>(
        context.options,
      );
      const approvalSettings = await saveApprovalStepTree(body);

      return NextResponse.json(approvalSettings);
    }

    return createNotFoundResponse();
  }

  return createNotFoundResponse();
}

async function saveApprovalStepTree(
  payload: SaveServiceDeskApprovalStepTreePayload,
) {
  const tenantId = Number(payload.tenantId);
  const currentApprovalSettings =
    await getCategoryApprovalSettingsByTenantId(tenantId);
  const currentApprovalSteps = currentApprovalSettings.flatMap(
    (category) => category.approval_step,
  );
  const currentApprovalStepsById = new Map(
    currentApprovalSteps.map((approvalStep) => [
      approvalStep.approval_step_id,
      approvalStep,
    ]),
  );
  const submittedApprovalStepPlans: SubmittedApprovalStepPlan[] =
    payload.categories.flatMap((category) =>
      category.approvalSteps.map((approvalStep, index) => ({
        approvalStep,
        approvalStepId: parseOptionalId(approvalStep.id),
        approvalStepIndex: index + 1,
        categoryId: Number(category.id),
      })),
    );
  const submittedExistingApprovalStepIds = new Set(
    submittedApprovalStepPlans.flatMap((plan) =>
      plan.approvalStepId !== null && currentApprovalStepsById.has(plan.approvalStepId)
        ? [plan.approvalStepId]
        : [],
    ),
  );

  for (const approvalStep of currentApprovalSteps) {
    if (submittedExistingApprovalStepIds.has(approvalStep.approval_step_id)) {
      continue;
    }

    await deleteApprovalStepById(tenantId, approvalStep.approval_step_id);
  }

  await moveRetainedApprovalStepsToTemporaryIndexes(
    tenantId,
    currentApprovalSteps,
    submittedExistingApprovalStepIds,
  );

  for (const plan of submittedApprovalStepPlans) {
    if (
      plan.approvalStepId === null ||
      !currentApprovalStepsById.has(plan.approvalStepId)
    ) {
      continue;
    }

    await updateApprovalStepById(
      tenantId,
      plan.approvalStepId,
      mapApprovalTreeStepToUpdateInput(
        plan.categoryId,
        plan.approvalStep,
        plan.approvalStepIndex,
      ),
    );
  }

  for (const plan of submittedApprovalStepPlans) {
    if (
      plan.approvalStepId !== null &&
      currentApprovalStepsById.has(plan.approvalStepId)
    ) {
      continue;
    }

    await createApprovalStep(
      mapApprovalTreeStepToCreateInput(
        tenantId,
        plan.categoryId,
        plan.approvalStep,
        plan.approvalStepIndex,
      ),
    );
  }

  return getCategoryApprovalSettingsByTenantId(tenantId);
}

async function moveRetainedApprovalStepsToTemporaryIndexes(
  tenantId: number,
  currentApprovalSteps: ApprovalStepDto[],
  retainedApprovalStepIds: Set<number>,
) {
  const retainedApprovalStepsByCategoryId = new Map<number, ApprovalStepDto[]>();

  for (const approvalStep of currentApprovalSteps) {
    if (!retainedApprovalStepIds.has(approvalStep.approval_step_id)) {
      continue;
    }

    const items =
      retainedApprovalStepsByCategoryId.get(approvalStep.category_id) ?? [];
    items.push(approvalStep);
    retainedApprovalStepsByCategoryId.set(approvalStep.category_id, items);
  }

  for (const [categoryId, approvalSteps] of retainedApprovalStepsByCategoryId) {
    const currentMaxIndex = getCurrentMaxApprovalStepIndex(
      currentApprovalSteps,
      categoryId,
    );

    for (const approvalStep of approvalSteps) {
      await updateApprovalStepById(
        tenantId,
        approvalStep.approval_step_id,
        mapApprovalStepDtoToUpdateInput(
          approvalStep,
          toTemporaryApprovalStepIndex(
            approvalStep.approval_step_index,
            currentMaxIndex,
          ),
        ),
      );
    }
  }
}

function mapApprovalTreeStepToCreateInput(
  tenantId: number,
  categoryId: number,
  approvalStep: ApprovalTreeStepItem,
  approvalStepIndex: number,
): CreateApprovalStepInputDto {
  return {
    tenant_id: tenantId,
    category_id: categoryId,
    approval_step_name: approvalStep.name,
    approval_step_description: approvalStep.description ?? null,
    approval_step_index: approvalStepIndex,
    approval_step_assignee: mapApprovalTreeAssignee(approvalStep.stepAssignee),
    skip_access_level: approvalStep.skipAccessLevel ?? null,
  };
}

function mapApprovalTreeStepToUpdateInput(
  categoryId: number,
  approvalStep: ApprovalTreeStepItem,
  approvalStepIndex: number,
): UpdateApprovalStepInputDto {
  return {
    category_id: categoryId,
    approval_step_name: approvalStep.name,
    approval_step_description: approvalStep.description ?? null,
    approval_step_index: approvalStepIndex,
    approval_step_assignee: mapApprovalTreeAssignee(approvalStep.stepAssignee),
    skip_access_level: approvalStep.skipAccessLevel ?? null,
  };
}

function mapApprovalStepDtoToUpdateInput(
  approvalStep: ApprovalStepDto,
  approvalStepIndex: number,
): UpdateApprovalStepInputDto {
  return {
    category_id: approvalStep.category_id,
    approval_step_name: approvalStep.approval_step_name,
    approval_step_description: approvalStep.approval_step_description,
    approval_step_index: approvalStepIndex,
    approval_step_assignee: approvalStep.approval_step_assignee,
    skip_access_level: approvalStep.skip_access_level,
  };
}

function getCurrentMaxApprovalStepIndex(
  approvalSteps: ApprovalStepDto[],
  categoryId: number,
) {
  return Math.max(
    0,
    ...approvalSteps
      .filter((approvalStep) => approvalStep.category_id === categoryId)
      .map((approvalStep) => approvalStep.approval_step_index),
  );
}

function toTemporaryApprovalStepIndex(
  index: number,
  currentMaxIndex: number,
) {
  return currentMaxIndex + index;
}

function mapApprovalTreeAssignee(
  assignee: ApprovalTreeStepItem["stepAssignee"],
): CreateApprovalStepInputDto["approval_step_assignee"] {
  switch (assignee.type) {
    case "MANAGER":
      return {
        type: assignee.type,
        level: assignee.level,
      };
    case "DEPARTMENT":
      return {
        type: assignee.type,
        department_id: Number(assignee.departmentId),
      };
    case "JOB_FIELD":
      return {
        type: assignee.type,
        field_id: Number(assignee.jobFieldId),
      };
    case "EMPLOYEE":
      return {
        type: assignee.type,
        employee_username: assignee.employeeUsernames.map(String),
      };
  }
}
