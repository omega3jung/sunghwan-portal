import type { NextResponse as NextResponseType } from "next/server";
import { NextResponse } from "next/server";

import type { SaveServiceDeskApprovalStepTreePayload } from "@/lib/application/contracts/serviceDesk";
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
  validateApprovalStepTreeMutation,
} from "@/server/data/serviceDesk/approvalStep";
import {
  assertApprovalReferencesValidForWrite,
  mapSettingsWriteError,
} from "@/server/data/serviceDesk/shared";
import {
  findActiveTicketViewRowById,
} from "@/server/data/serviceDesk/ticket/ticketRepository";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";
import { updateTicketInitialRoutingById } from "@/server/data/serviceDesk/ticket/ticketUpdateRepository";
import { resolveInitialTicketRouting } from "@/server/data/serviceDesk/ticketAction/shared/ticketActionRouting";
import { createTicketHistory } from "@/server/data/serviceDesk/ticketHistory";
import {
  type PortalApiQueryExecutor,
  withPortalApiTransaction,
} from "@/server/shared/supabase/portalApiClient";

import { getPortalApiQueryValue } from "../utils";
import {
  createNotFoundResponse,
  parseBooleanQueryValue,
  parseOptionalId,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";
import { resolveAuthorizedSettingsTenant } from "./shared";

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

/** Routes approval-step settings requests after resolving tenant scope and administrator access. */
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
      const scope = getPortalApiQueryValue(
        context.request,
        context.options,
        "scope",
      );
      const allItems = await getApprovalSettingsResponseByTenantId({
        tenantId,
        isInternal,
      });
      const items =
        scope === "INTERNAL" || scope === "PORTAL"
          ? allItems.filter((category) => category.category_scope === scope)
          : allItems;

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (context.method === "PUT") {
      const body = requireBody<SaveServiceDeskApprovalStepTreePayload>(
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

      const { approvalSettings, submittedScopes } = await saveApprovalStepTree(
        body,
        authorization.effectiveUsername,
        authorization.principal,
        tenant,
      );

      return NextResponse.json(
        approvalSettings.filter((category) =>
          submittedScopes.has(category.category_scope),
        ),
      );
    }

    return createNotFoundResponse();
  }

  return createNotFoundResponse();
}

async function saveApprovalStepTree(
  payload: SaveServiceDeskApprovalStepTreePayload,
  actorUsername: string,
  principal: Parameters<typeof validateApprovalStepTreeMutation>[0]["principal"],
  tenant: Parameters<typeof validateApprovalStepTreeMutation>[0]["tenant"],
) {
  try {
    return await withPortalApiTransaction(async (query) => {
      const submittedScopes = await validateApprovalStepTreeMutation({
        principal,
        tenant,
        payload,
        query,
      });
      const approvalSettings = await saveApprovalStepTreeInTransaction(
        payload,
        actorUsername,
        query,
      );
      return { approvalSettings, submittedScopes };
    });
  } catch (error) {
    throw mapSettingsWriteError(error, "approvalSteps");
  }
}

async function saveApprovalStepTreeInTransaction(
  payload: SaveServiceDeskApprovalStepTreePayload,
  actorUsername: string,
  query: PortalApiQueryExecutor,
) {
  const tenantId = Number(payload.tenantId);
  const currentApprovalSettings = await getCategoryApprovalSettingsByTenantId(
    tenantId,
    query,
  );
  const currentApprovalSteps = currentApprovalSettings.flatMap((category) =>
    payload.categories.some(
      (submittedCategory) =>
        Number(submittedCategory.id) === Number(category.category_id),
    )
      ? category.approval_step
      : [],
  );
  const currentApprovalStepsById = new Map(
    currentApprovalSteps.map((approvalStep) => [
      approvalStep.approval_step_id,
      approvalStep,
    ]),
  );
  const changedCategoryIds = findChangedApprovalCategoryIds(
    payload,
    currentApprovalSettings,
  );
  const affectedTickets = await findAffectedApprovalTickets(
    changedCategoryIds,
    query,
  );

  if (affectedTickets.length > 0 && payload.force !== true) {
    throw Object.assign(
      new Error("Approval configuration affects active tickets."),
      {
        code: "APPROVAL_CONFIGURATION_IMPACT",
        status: 409,
      },
    );
  }
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
      plan.approvalStepId !== null &&
      currentApprovalStepsById.has(plan.approvalStepId)
        ? [plan.approvalStepId]
        : [],
    ),
  );

  await assertApprovalReferencesValidForWrite(
    query,
    tenantId,
    submittedApprovalStepPlans.map((plan) => ({
      categoryId: plan.categoryId,
      assignee: mapApprovalTreeAssignee(plan.approvalStep.stepAssignee),
    })),
  );

  for (const approvalStep of currentApprovalSteps) {
    if (submittedExistingApprovalStepIds.has(approvalStep.approval_step_id)) {
      continue;
    }

    await deleteApprovalStepById(
      tenantId,
      approvalStep.approval_step_id,
      query,
    );
  }

  await moveRetainedApprovalStepsToTemporaryIndexes(
    tenantId,
    currentApprovalSteps,
    submittedExistingApprovalStepIds,
    query,
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
      query,
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
      query,
    );
  }

  if (affectedTickets.length > 0) {
    await resetAffectedApprovalTickets(
      affectedTickets,
      actorUsername,
      query,
    );
  }

  return getCategoryApprovalSettingsByTenantId(tenantId, query);
}

function findChangedApprovalCategoryIds(
  payload: SaveServiceDeskApprovalStepTreePayload,
  currentSettings: Awaited<
    ReturnType<typeof getCategoryApprovalSettingsByTenantId>
  >,
) {
  const currentByCategoryId = new Map(
    currentSettings.map((category) => [
      String(category.category_id),
      JSON.stringify(
        category.approval_step.map((step) => ({
          id: String(step.approval_step_id),
          assignee: step.approval_step_assignee,
          skipAccessLevel: step.skip_access_level,
        })),
      ),
    ]),
  );

  return payload.categories.flatMap((category) => {
    const submitted = JSON.stringify(
      category.approvalSteps.map((step) => ({
        id: step.id ?? null,
        assignee: mapApprovalTreeAssignee(step.stepAssignee),
        skipAccessLevel: step.skipAccessLevel ?? null,
      })),
    );
    return currentByCategoryId.get(category.id) === submitted
      ? []
      : [Number(category.id)];
  });
}

async function findAffectedApprovalTickets(
  categoryIds: number[],
  query: PortalApiQueryExecutor,
) {
  if (categoryIds.length === 0) return [];

  return query<{ tk_id: string }>(
    `
select ticket.tk_id
from service_desk.ticket ticket
join service_desk.category category
  on category.cat_id = ticket.tk_category_id
where ticket.tk_active = true
  and ticket.tk_status = 'Approval'
  and coalesce(category.cat_parent_id, category.cat_id) = any($1::bigint[])
order by ticket.tk_id
for update;
`,
    [categoryIds],
  );
}

async function resetAffectedApprovalTickets(
  affectedTickets: Array<{ tk_id: string }>,
  actorUsername: string,
  query: PortalApiQueryExecutor,
) {
  for (const { tk_id: ticketId } of affectedTickets) {
    const ticket = await findActiveTicketViewRowById(ticketId, { query });

    if (!ticket) {
      throw Object.assign(new Error("Affected ticket was not found."), {
        status: 409,
      });
    }

    const routing = await resolveInitialTicketRouting(ticket, { query });
    const updated = await updateTicketInitialRoutingById(
      ticketId,
      {
        approvalStepId: routing.approvalStepId,
        assigneeUsernames: routing.assigneeUsernames,
        status: routing.status,
      },
      { query },
    );

    if (!updated) {
      throw Object.assign(new Error("Affected ticket could not be rerouted."), {
        status: 409,
      });
    }

    await createTicketHistory(
      {
        ticketId,
        actionNo: null,
        historyType: "TICKET",
        source: "APPROVAL_RULE",
        event: "ROUTING_RESET",
        actorUsername,
        fromValue: {
          approvalStepId:
            ticket.tk_approval_step_id === null
              ? null
              : String(ticket.tk_approval_step_id),
          assigneeUsernames: normalizeAssignees(ticket),
        },
        toValue: {
          approvalStepId:
            routing.approvalStepId === null
              ? null
              : String(routing.approvalStepId),
          assigneeUsernames: routing.assigneeUsernames,
        },
        metadata: {
          reason: "APPROVAL_CONFIGURATION_CHANGED",
        },
      },
      { query },
    );
  }
}

function normalizeAssignees(ticket: ServiceDeskTicketViewRow) {
  return Array.isArray(ticket.tk_assignee_usernames)
    ? ticket.tk_assignee_usernames.map(String)
    : [];
}

async function moveRetainedApprovalStepsToTemporaryIndexes(
  tenantId: number,
  currentApprovalSteps: ApprovalStepDto[],
  retainedApprovalStepIds: Set<number>,
  query: PortalApiQueryExecutor,
) {
  const retainedApprovalStepsByCategoryId = new Map<
    number,
    ApprovalStepDto[]
  >();

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
        query,
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

function toTemporaryApprovalStepIndex(index: number, currentMaxIndex: number) {
  return currentMaxIndex + index;
}

function mapApprovalTreeAssignee(
  assignee: ApprovalTreeStepItem["stepAssignee"],
): CreateApprovalStepInputDto["approval_step_assignee"] {
  switch (assignee.type) {
    case "MANAGER":
      return {
        type: assignee.type,
        level: assignee.managerDistance,
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
