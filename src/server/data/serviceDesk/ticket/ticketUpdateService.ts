import type { Priority, RiskLevel } from "@/domain/common";
import { TicketAttachmentMetadata, TicketStatus } from "@/domain/serviceDesk";
import type { TicketHistoryJsonValue } from "@/server/data/serviceDesk/ticketHistory";
import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";

import { createTicketHistory } from "../ticketHistory";
import { TicketDetailDto } from "./ticketDto";
import {
  normalizePostgresStringArray,
  toTicketDetailDto,
} from "./ticketMapper";
import {
  findApprovalStepAssigneeUsernames,
  findCategoryAssignmentUsernames,
  findNextApprovalStepId,
} from "./ticketRepository";
import { RequesterUpdateTicketRequestDto } from "./ticketUpdateDto";
import { mapRequesterUpdateTicketRequestDtoToRowInput } from "./ticketUpdateMapper";
import {
  findActiveRequesterUpdateCategorySnapshotById,
  findRequesterUpdateTicketViewRowById,
  RequesterUpdateTicketRepositoryOptions,
  updateRequesterTicketRowById,
} from "./ticketUpdateRepository";

type RequesterUpdateRoutingResult =
  | {
      status: TicketStatus;
      approvalStepId: number;
      assigneeUsernames: string[];
    }
  | {
      status: TicketStatus;
      approvalStepId: null;
      assigneeUsernames: string[];
    };

type RequesterUpdateRoutingState = {
  tk_priority: Priority;
  tk_risk_level: RiskLevel;
  tk_status: TicketStatus;
  tk_approval_step_id: number | string | null;
  tk_assignee_usernames: string[];
};

const REQUESTER_EDITABLE_TICKET_STATUSES: readonly TicketStatus[] = [
  "Approval",
  "Assigned",
];

export async function updateRequesterTicket(
  ticketId: string,
  input: RequesterUpdateTicketRequestDto,
  currentUserName: string | null,
  options: RequesterUpdateTicketRepositoryOptions = {},
): Promise<TicketDetailDto> {
  if (!currentUserName) {
    throw createStatusError("Unauthorized", 401);
  }

  if (!options.query) {
    return withPortalApiTransaction((query) =>
      updateRequesterTicket(ticketId, input, currentUserName, { query }),
    );
  }

  const currentRow = await findRequesterUpdateTicketViewRowById(
    ticketId,
    options,
  );

  if (!currentRow) {
    throw createStatusError("Ticket not found.", 404);
  }

  if (currentRow.tk_requester_username !== currentUserName) {
    throw createStatusError("Ticket can only be updated by its requester.", 403);
  }

  if (!REQUESTER_EDITABLE_TICKET_STATUSES.includes(currentRow.tk_status)) {
    throw createStatusError(
      `Ticket cannot be updated in status ${currentRow.tk_status}.`,
      409,
    );
  }

  const category = await findActiveRequesterUpdateCategorySnapshotById(
    input.categoryId,
    options,
  );

  if (!category) {
    throw createStatusError("Ticket category is not available.", 400);
  }

  const preservedRoutingState: RequesterUpdateRoutingState = {
    tk_priority: currentRow.tk_priority,
    tk_risk_level: currentRow.tk_risk_level,
    tk_status: currentRow.tk_status,
    tk_approval_step_id: currentRow.tk_approval_step_id,
    tk_assignee_usernames: normalizePostgresStringArray(
      currentRow.tk_assignee_usernames,
    ),
  };
  const preservedRowInput = mapRequesterUpdateTicketRequestDtoToRowInput(
    input,
    preservedRoutingState,
  );
  const preliminaryChangeSet = buildRequesterUpdateChangeSet({
    current: currentRow,
    next: preservedRowInput,
  });
  const categoryChanged =
    preliminaryChangeSet.changedFields.includes("categoryId");
  const routingSensitiveChanged = preliminaryChangeSet.changedFields.some(
    isRoutingSensitiveField,
  );
  const routingState = routingSensitiveChanged
    ? await resolveRequesterUpdateRoutingState(
        {
          categoryId: category.cat_id,
          categoryPriority: category.cat_default_priority,
          categoryRiskLevel: category.cat_default_risk_level,
          currentPriority: currentRow.tk_priority,
          currentRiskLevel: currentRow.tk_risk_level,
          shouldDeriveCategoryDefaults: categoryChanged,
          requesterUsername: currentUserName,
        },
        options,
      )
    : preservedRoutingState;
  const rowInput = mapRequesterUpdateTicketRequestDtoToRowInput(
    input,
    routingState,
  );
  const changeSet = buildRequesterUpdateChangeSet({
    current: currentRow,
    next: rowInput,
  });

  const updatedRow = await updateRequesterTicketRowById(
    ticketId,
    rowInput,
    options,
  );

  if (!updatedRow) {
    throw createStatusError("Unable to update ticket.", 409);
  }

  await createTicketHistory(
    {
      ticketId,
      actionNo: null,
      historyType: "TICKET",
      historyAction: "UPDATED",
      actorUsername: currentUserName,
      fromValue: changeSet.fromValue,
      toValue: changeSet.toValue,
      metadata: buildRequesterUpdateHistoryMetadata({
        changedFields: changeSet.changedFields,
        routingSensitiveChanged,
        previousApprovalStepId: currentRow.tk_approval_step_id,
        nextApprovalStepId: rowInput.tk_approval_step_id,
        previousAssigneeUsernames: preservedRoutingState.tk_assignee_usernames,
        nextAssigneeUsernames: rowInput.tk_assignee_usernames,
      }),
    },
    options,
  );

  return toTicketDetailDto(updatedRow, currentUserName);
}

type RequesterUpdateChangeSet = {
  changedFields: string[];
  fromValue: { [key: string]: TicketHistoryJsonValue };
  toValue: { [key: string]: TicketHistoryJsonValue };
};

function buildRequesterUpdateChangeSet({
  current,
  next,
}: {
  current: {
    cat_id: number;
    tk_subject: string;
    tk_content: string;
    tk_due_at: string;
    tk_email: unknown;
    tk_files: TicketAttachmentMetadata[];
    tk_images: TicketAttachmentMetadata[];
  };
  next: {
    tk_category_id: number;
    tk_subject: string;
    tk_content: string;
    tk_due_at: string;
    tk_email: unknown;
    tk_files: TicketAttachmentMetadata[];
    tk_images: TicketAttachmentMetadata[];
  };
}): RequesterUpdateChangeSet {
  const changedFields: string[] = [];
  const fromValue: { [key: string]: TicketHistoryJsonValue } = {};
  const toValue: { [key: string]: TicketHistoryJsonValue } = {};

  addScalarChange("categoryId", String(current.cat_id), String(next.tk_category_id));
  addScalarChange("subject", current.tk_subject, next.tk_subject);
  addContentChange();
  addDateChange("dueAt", current.tk_due_at, next.tk_due_at);
  addJsonChange("email", current.tk_email, next.tk_email);
  addAttachmentChange("files", current.tk_files ?? [], next.tk_files);
  addAttachmentChange("images", current.tk_images ?? [], next.tk_images);

  return {
    changedFields,
    fromValue,
    toValue,
  };

  function addScalarChange(
    key: string,
    from: TicketHistoryJsonValue,
    to: TicketHistoryJsonValue,
  ) {
    if (from === to) {
      return;
    }

    changedFields.push(key);
    fromValue[key] = from;
    toValue[key] = to;
  }

  function addDateChange(key: string, from: string, to: string) {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();

    if (fromTime === toTime) {
      return;
    }

    changedFields.push(key);
    fromValue[key] = Number.isFinite(fromTime) ? new Date(fromTime).toISOString() : from;
    toValue[key] = Number.isFinite(toTime) ? new Date(toTime).toISOString() : to;
  }

  function addJsonChange(key: string, from: unknown, to: unknown) {
    const fromJson = normalizeJsonValue(from);
    const toJson = normalizeJsonValue(to);

    if (JSON.stringify(fromJson) === JSON.stringify(toJson)) {
      return;
    }

    changedFields.push(key);
    fromValue[key] = fromJson;
    toValue[key] = toJson;
  }

  function addContentChange() {
    if (current.tk_content === next.tk_content) {
      return;
    }

    changedFields.push("content");
    fromValue.contentChanged = true;
    toValue.contentChanged = true;
  }

  function addAttachmentChange(
    key: string,
    from: TicketAttachmentMetadata[],
    to: TicketAttachmentMetadata[],
  ) {
    if (
      JSON.stringify(getAttachmentComparisonKeys(from)) ===
      JSON.stringify(getAttachmentComparisonKeys(to))
    ) {
      return;
    }

    changedFields.push(key);
    fromValue[key] = summarizeAttachments(from);
    toValue[key] = summarizeAttachments(to);
  }
}

async function resolveRequesterUpdateRoutingState(
  params: {
    categoryId: number;
    categoryPriority: Priority | null;
    categoryRiskLevel: RiskLevel | null;
    currentPriority: Priority;
    currentRiskLevel: RiskLevel;
    shouldDeriveCategoryDefaults: boolean;
    requesterUsername: string;
  },
  options?: RequesterUpdateTicketRepositoryOptions,
): Promise<RequesterUpdateRoutingState> {
  const routing = await resolveInitialRequesterUpdateRouting(
    {
      requesterUsername: params.requesterUsername,
      categoryId: params.categoryId,
    },
    options,
  );

  return {
    tk_priority: params.shouldDeriveCategoryDefaults
      ? params.categoryPriority ?? params.currentPriority
      : params.currentPriority,
    tk_risk_level: params.shouldDeriveCategoryDefaults
      ? params.categoryRiskLevel ?? params.currentRiskLevel
      : params.currentRiskLevel,
    tk_status: routing.status,
    tk_approval_step_id: routing.approvalStepId,
    tk_assignee_usernames: routing.assigneeUsernames,
  };
}

async function resolveInitialRequesterUpdateRouting(
  params: {
    requesterUsername: string;
    categoryId: number | string;
  },
  options?: RequesterUpdateTicketRepositoryOptions,
): Promise<RequesterUpdateRoutingResult> {
  const nextApprovalStepId = await findNextApprovalStepId(
    {
      requesterUsername: params.requesterUsername,
      categoryId: params.categoryId,
      currentApprovalStepId: null,
    },
    options,
  );

  if (nextApprovalStepId !== null) {
    const assigneeUsernames = await findApprovalStepAssigneeUsernames(
      {
        approvalStepId: nextApprovalStepId,
        requesterUsername: params.requesterUsername,
      },
      options,
    );

    if (assigneeUsernames.length === 0) {
      throw createStatusError("Unable to resolve approval assignees.", 409);
    }

    return {
      status: "Approval",
      approvalStepId: nextApprovalStepId,
      assigneeUsernames,
    };
  }

  const assigneeUsernames = await findCategoryAssignmentUsernames(
    {
      categoryId: params.categoryId,
      requesterUsername: params.requesterUsername,
    },
    options,
  );

  if (assigneeUsernames.length === 0) {
    throw createStatusError("Unable to resolve ticket assignees.", 409);
  }

  return {
    status: "Assigned",
    approvalStepId: null,
    assigneeUsernames,
  };
}

function buildRequesterUpdateHistoryMetadata({
  changedFields,
  routingSensitiveChanged,
  previousApprovalStepId,
  nextApprovalStepId,
  previousAssigneeUsernames,
  nextAssigneeUsernames,
}: {
  changedFields: string[];
  routingSensitiveChanged: boolean;
  previousApprovalStepId: number | string | null;
  nextApprovalStepId: number | string | null;
  previousAssigneeUsernames: string[];
  nextAssigneeUsernames: string[];
}): TicketHistoryJsonValue {
  const metadata: Record<string, TicketHistoryJsonValue> = {
    source: "updateDialog",
    changedFields,
    routingSensitiveChanged,
    routingReset: routingSensitiveChanged,
    preservedRouting: !routingSensitiveChanged,
  };

  if (routingSensitiveChanged) {
    metadata.previousApprovalStepId = normalizeNullableId(previousApprovalStepId);
    metadata.nextApprovalStepId = normalizeNullableId(nextApprovalStepId);
    metadata.previousAssigneeUsernames = previousAssigneeUsernames;
    metadata.nextAssigneeUsernames = nextAssigneeUsernames;
  }

  return metadata;
}

function isRoutingSensitiveField(field: string) {
  return (
    field === "categoryId" ||
    field === "subject" ||
    field === "content" ||
    field === "files" ||
    field === "images"
  );
}

function getAttachmentComparisonKeys(items: TicketAttachmentMetadata[]) {
  return items
    .map((item) =>
      [
        item.replacedName,
        item.originalName,
        item.extension,
        String(item.size),
        item.type,
        item.demoUrl,
        item.reason,
      ].join("|"),
    )
    .sort();
}

function summarizeAttachments(items: TicketAttachmentMetadata[]) {
  return {
    count: items.length,
    names: items.map((item) => item.originalName),
  };
}

function normalizeJsonValue(value: unknown): TicketHistoryJsonValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeJsonValue);
  }

  if (typeof value !== "object") {
    return null;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      normalizeJsonValue(item),
    ]),
  );
}

function normalizeNullableId(value: number | string | null) {
  return value === null ? null : String(value);
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
