import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import type {
  DbApprovalStep,
  SaveServiceDeskApprovalStepTreePayload,
} from "@/feature/serviceDesk/approvalStep/types";
import type {
  CreateApprovalStepInputDto,
  UpdateApprovalStepInputDto,
} from "@/server/data/serviceDesk/approvalStep";
import {
  createApprovalStep,
  deactivateApprovalStepById,
  getApprovalSettingsResponseByTenantId,
  getApprovalStepById,
  getApprovalStepsByTenantId,
  getCategoryApprovalSettingsByTenantId,
  updateApprovalStepById,
} from "@/server/data/serviceDesk/approvalStep";

import { getPortalApiQueryValue } from "../utils";
import {
  resolveTenantIdByApprovalStepId,
  resolveTenantIdByCategoryId,
} from "./serviceDeskPortalApiResolvers";
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

const APPROVAL_SETTINGS_LIST_PATH_PATTERN = /^\/service-desk\/approval-steps$/;
const APPROVAL_SETTINGS_PATH_PATTERN =
  /^\/service-desk\/approval-steps\/tenant\/([^/]+)$/;
const APPROVAL_STEPS_PATH_PATTERN =
  /^\/service-desk\/approval-steps\/tenant\/([^/]+)\/steps$/;
const APPROVAL_STEP_DETAIL_PATH_PATTERN =
  /^\/service-desk\/approval-steps\/([^/]+)$/;

export async function handleApprovalStepPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const approvalSettingsListMatch = APPROVAL_SETTINGS_LIST_PATH_PATTERN.exec(
    context.path,
  );
  const approvalSettingsMatch = APPROVAL_SETTINGS_PATH_PATTERN.exec(
    context.path,
  );
  const approvalStepsMatch = APPROVAL_STEPS_PATH_PATTERN.exec(context.path);
  const approvalStepDetailMatch = APPROVAL_STEP_DETAIL_PATH_PATTERN.exec(
    context.path,
  );

  if (
    !approvalSettingsListMatch &&
    !approvalSettingsMatch &&
    !approvalStepsMatch &&
    !approvalStepDetailMatch
  ) {
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

    if (context.method === "POST") {
      const body = requireBody<DbApprovalStep>(context.options);
      const tenantId = await resolveTenantIdByCategoryId(
        context,
        body.category_id,
      );
      const approvalStep = await createApprovalStep(
        mapApprovalStepBodyToCreateInput(tenantId, body),
      );

      return NextResponse.json(approvalStep, { status: 201 });
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

  if (approvalStepsMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const tenantId = decodeURIComponent(approvalStepsMatch[1] ?? "");
    const approvalSteps = await getApprovalStepsByTenantId(tenantId);

    return NextResponse.json({ data: approvalSteps });
  }

  if (approvalSettingsMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const tenantId = decodeURIComponent(approvalSettingsMatch[1] ?? "");
    const approvalSettings =
      await getCategoryApprovalSettingsByTenantId(tenantId);

    return NextResponse.json({ data: approvalSettings });
  }

  const approvalStepId = decodeURIComponent(approvalStepDetailMatch?.[1] ?? "");

  if (context.method === "GET") {
    const tenantId = getPortalApiQueryValue(
      context.request,
      context.options,
      "tenantId",
    );
    const isInternal =
      parseBooleanQueryValue(
        getPortalApiQueryValue(context.request, context.options, "isInternal"),
      ) ?? true;
    const approvalStep = await getApprovalStepById({
      approvalStepId,
      tenantId,
      isInternal,
    });

    if (!approvalStep) {
      return createNotFoundResponse();
    }

    return NextResponse.json(approvalStep);
  }

  if (context.method === "PUT") {
    const body = requireBody<DbApprovalStep>(context.options);
    const tenantId = await resolveTenantIdByApprovalStepId(
      context,
      approvalStepId,
    );
    const approvalStep = await updateApprovalStepById(
      tenantId,
      approvalStepId,
      mapApprovalStepBodyToUpdateInput(body),
    );

    return NextResponse.json(approvalStep);
  }

  if (context.method === "DELETE") {
    const tenantId = await resolveTenantIdByApprovalStepId(
      context,
      approvalStepId,
    );
    await deactivateApprovalStepById(tenantId, approvalStepId);

    return new NextResponse(null, { status: 204 });
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
  const currentApprovalStepIds = new Set(
    currentApprovalSteps.map((approvalStep) => approvalStep.approval_step_id),
  );
  const submittedApprovalStepIds = new Set<number>();

  for (const category of payload.categories) {
    const categoryId = Number(category.id);

    for (const [index, approvalStep] of category.approvalSteps.entries()) {
      const approvalStepId = parseOptionalId(approvalStep.id);

      if (
        approvalStepId !== null &&
        currentApprovalStepIds.has(approvalStepId)
      ) {
        await updateApprovalStepById(
          tenantId,
          approvalStepId,
          mapApprovalTreeStepToUpdateInput(categoryId, approvalStep, index + 1),
        );
        submittedApprovalStepIds.add(approvalStepId);
        continue;
      }

      const createdApprovalStep = await createApprovalStep(
        mapApprovalTreeStepToCreateInput(
          tenantId,
          categoryId,
          approvalStep,
          index + 1,
        ),
      );
      submittedApprovalStepIds.add(createdApprovalStep.approval_step_id);
    }
  }

  for (const approvalStep of currentApprovalSteps) {
    if (
      approvalStep.approval_step_active === false ||
      submittedApprovalStepIds.has(approvalStep.approval_step_id)
    ) {
      continue;
    }

    await deactivateApprovalStepById(tenantId, approvalStep.approval_step_id);
  }

  return getCategoryApprovalSettingsByTenantId(tenantId);
}

function mapApprovalStepBodyToCreateInput(
  tenantId: number,
  body: DbApprovalStep,
): CreateApprovalStepInputDto {
  return {
    tenant_id: tenantId,
    category_id: Number(body.category_id),
    approval_step_name: body.approval_step_name,
    approval_step_description: body.approval_step_description,
    approval_step_index: body.approval_step_index,
    approval_step_assignee: body.approval_step_assignee,
    skip_access_level: body.skip_access_level,
  };
}

function mapApprovalStepBodyToUpdateInput(
  body: DbApprovalStep,
): UpdateApprovalStepInputDto {
  return {
    category_id: Number(body.category_id),
    approval_step_name: body.approval_step_name,
    approval_step_description: body.approval_step_description,
    approval_step_index: body.approval_step_index,
    approval_step_assignee: body.approval_step_assignee,
    skip_access_level: body.skip_access_level,
  };
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
