import type { TicketStatus } from "@/domain/serviceDesk";
import type { AppUser } from "@/domain/user";
import { assertTicketDueAtMeetsSla } from "@/lib/application/serviceDesk/ticketSlaPolicy";
import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";
import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";

import {
  createHistoryOfApprovalRequested,
  createHistoryOfAssignmentResolvedByRule,
  createHistoryOfStatusChange,
  createHistoryOfSystemResolutionClose,
  createHistoryOfTicketCreate,
} from "../ticketHistory";
import { finishRunningWorkSessionsByTicketId } from "../workSession";
import { resolveAuthoritativeTicketCategory } from "./ticketCategoryAccess";
import {
  TicketCreateRequestDto,
  TicketDetailDto,
  TicketListItemDto,
  TicketSearchRequestDto,
  TicketSearchResponseDto,
} from "./ticketDto";
import {
  mapTicketCreateRequestDtoToRowInput,
  toTicketDetailDto,
  toTicketListItemDto,
} from "./ticketMapper";
import {
  createTicketRow,
  findActiveDraftTicketIdByRequesterUsername,
  findActiveTicketViewRowById,
  findActiveTicketViewRows,
  findActiveTicketViewRowsBySearch,
  findApprovalStepAssigneeUsernames,
  findCategoryAssignmentUsernames,
  findEmployeeDepartmentIdByUsername,
  findExpiredResolvedTicketViewRows,
  findNextApprovalStepId,
  findNextTicketNumber,
  hasTicketWorkAssignmentHistory,
  type TicketReadPrincipal,
  type TicketRepositoryOptions,
} from "./ticketRepository";
import {
  closeResolvedTicketById,
  findActiveRequesterUpdateCategorySnapshotById,
  startAssignedTicketWorkById,
  submitDraftTicketRowById,
  updateTicketInitialRoutingById,
} from "./ticketUpdateRepository";

/** Supplies requester identity, optional numbering, and transaction context for ticket creation. */
export type CreateTicketOptions = {
  ticketNo?: string;
  requesterUsername: string;
  principal: Pick<AppUser, "companyId" | "userScope">;
  query?: TicketRepositoryOptions["query"];
};

// Operational cleanup policy after resolution; this is not an SLA deadline.
const RESOLVED_AUTO_CLOSE_GRACE_DAYS = 7;

type InitialTicketRoutingResult =
  | {
      phase: "APPROVAL";
      approvalStepId: number;
      assigneeUsernames: string[];
    }
  | {
      phase: "WORK";
      approvalStepId: null;
      assigneeUsernames: string[];
    };

/** Loads active tickets and projects viewer-specific ownership flags for list views. */
export async function getTicketListItems(
  currentUserName: string | null,
  principal: TicketReadPrincipal,
): Promise<TicketListItemDto[]> {
  const rows = await findActiveTicketViewRows(principal);

  return rows.map((row) => toTicketListItemDto(row, currentUserName));
}

/** Loads one active ticket and derives permissions for the current viewer. */
export async function getTicketDetail(
  ticketId: string,
  currentUserName: string | null,
  principal: TicketReadPrincipal,
): Promise<TicketDetailDto | null> {
  const row = await findActiveTicketViewRowById(ticketId, {}, principal);

  return row ? projectTicketDetail(row, currentUserName) : null;
}

/**
 * Starts work only for a current WORK-phase assignee.
 *
 * The state transition and immutable history entry share one transaction. An
 * already-started ticket is returned unchanged, making repeated view-triggered
 * requests safe without manufacturing duplicate status history.
 */
export async function startTicketWork(
  ticketId: string,
  currentUserName: string,
): Promise<TicketDetailDto> {
  return withPortalApiTransaction(async (query) => {
    const ticket = await findActiveTicketViewRowById(ticketId, { query });

    if (!ticket) {
      throw createStatusError("Ticket not found.", 404);
    }

    if (ticket.tk_status !== "Assigned") {
      return projectTicketDetail(ticket, currentUserName, { query });
    }

    if (
      ticket.tk_approval_step_id !== null ||
      !normalizeAssigneeUsernames(ticket.tk_assignee_usernames).includes(
        currentUserName,
      )
    ) {
      throw createStatusError(
        "Only a current work assignee can start work.",
        403,
      );
    }

    const updatedTicket = await startAssignedTicketWorkById(
      ticketId,
      { assigneeUsername: currentUserName },
      { query },
    );

    if (!updatedTicket) {
      throw createStatusError("Ticket work could not be started.", 409);
    }

    await createHistoryOfStatusChange(
      {
        ticketId,
        actionNo: null,
        actorUsername: currentUserName,
        fromStatus: ticket.tk_status,
        toStatus: "Working",
        metadata: {
          previousStatus: ticket.tk_status,
          nextStatus: "Working",
        },
      },
      { query },
    );

    return projectTicketDetail(updatedTicket, currentUserName, { query });
  });
}

/**
 * Closes resolved tickets after the grace period as one maintenance workflow.
 * Running sessions are ended and a system-authored history event is recorded
 * for each successful close. A failure rolls back the batch transaction.
 */
export async function closeExpiredResolvedTickets(
  now: Date = new Date(),
): Promise<{ closedCount: number; ticketIds: string[] }> {
  const nowIso = now.toISOString();

  return withPortalApiTransaction(async (query) => {
    const repositoryOptions: TicketRepositoryOptions = { query };
    const expiredTickets = await findExpiredResolvedTicketViewRows(
      {
        now: nowIso,
        graceDays: RESOLVED_AUTO_CLOSE_GRACE_DAYS,
      },
      repositoryOptions,
    );
    const ticketIds: string[] = [];

    for (const ticket of expiredTickets) {
      const closedTicket = await closeResolvedTicketById(
        ticket.tk_id,
        repositoryOptions,
      );

      if (!closedTicket) {
        continue;
      }

      await finishRunningWorkSessionsByTicketId(
        ticket.tk_id,
        nowIso,
        repositoryOptions,
      );

      await createHistoryOfSystemResolutionClose(
        {
          ticketId: ticket.tk_id,
          fromStatus: "Resolved",
          resolvedGraceDays: RESOLVED_AUTO_CLOSE_GRACE_DAYS,
        },
        repositoryOptions,
      );

      ticketIds.push(ticket.tk_id);
    }

    return {
      closedCount: ticketIds.length,
      ticketIds,
    };
  });
}

/**
 * Submits an existing requester draft or creates a new routed ticket.
 *
 * Ticket number allocation, requester/category validation, initial approval or
 * work routing, and all creation history use the caller's transaction. This
 * prevents a visible ticket from being committed without assignees or its
 * authoritative audit trail.
 */
export async function createTicket(
  input: TicketCreateRequestDto,
  options: CreateTicketOptions,
): Promise<TicketDetailDto> {
  if (!options.query) {
    return withPortalApiTransaction((query) =>
      createTicket(input, {
        ...options,
        query,
      }),
    );
  }

  const repositoryOptions: TicketRepositoryOptions = options.query
    ? { query: options.query }
    : {};
  const ticketNo =
    options.ticketNo ??
    (await findNextTicketNumber(
      new Date().getUTCFullYear(),
      repositoryOptions,
    ));
  const requesterDepartmentId = await findEmployeeDepartmentIdByUsername(
    options.requesterUsername,
    repositoryOptions,
  );

  if (requesterDepartmentId === null) {
    throw createStatusError("Requester department was not found.", 422);
  }

  const category = resolveAuthoritativeTicketCategory(
    await findActiveRequesterUpdateCategorySnapshotById(
      input.categoryId,
      repositoryOptions,
    ),
    options.principal,
  );

  assertTicketDueAtMeetsSla(input.dueAt, category.cat_default_sla_days);

  const baseRowInput = mapTicketCreateRequestDtoToRowInput(
    {
      ...input,
      tenantId: category.cat_tenant_id,
      priority: input.priority ?? category.cat_default_priority ?? "medium",
      riskLevel:
        input.riskLevel ?? category.cat_default_risk_level ?? "medium",
    },
    {
      ticketNo,
      requesterUsername: options.requesterUsername,
      requesterDepartmentId,
    },
  );
  const routing = await resolveInitialTicketRouting(
    {
      requesterUsername: options.requesterUsername,
      categoryId: baseRowInput.tk_category_id,
    },
    repositoryOptions,
  );
  const routedStatus: TicketStatus =
    routing.phase === "APPROVAL" ? "Approval" : "Assigned";
  const rowInput = {
    ...baseRowInput,
    tk_approval_step_id: routing.approvalStepId,
    tk_status: routedStatus,
  };
  const existingDraftTicketId =
    input.id ??
    (await findActiveDraftTicketIdByRequesterUsername(
      options.requesterUsername,
      repositoryOptions,
    ));
  const row = existingDraftTicketId
    ? await submitDraftTicketRowById(
        existingDraftTicketId,
        rowInput,
        repositoryOptions,
      )
    : await createTicketRow(rowInput, repositoryOptions);

  if (!row) {
    throw createStatusError(
      existingDraftTicketId
        ? "Ticket draft was not found or cannot be submitted."
        : "Unable to create ticket.",
      409,
    );
  }

  await createHistoryOfTicketCreate(
    {
      ticketId: row.tk_id,
      actorUsername: options.requesterUsername,
      ticketNumber: row.tk_ticket_no,
      categoryId: row.cat_id,
      status: row.tk_status,
    },
    repositoryOptions,
  );

  const routedRow = await updateTicketInitialRoutingById(
    row.tk_id,
    {
      approvalStepId: routing.approvalStepId,
      assigneeUsernames: routing.assigneeUsernames,
      status: routing.phase === "APPROVAL" ? "Approval" : "Assigned",
    },
    repositoryOptions,
  );

  if (!routedRow) {
    throw createStatusError("Unable to route ticket.", 409);
  }

  if (routing.phase === "APPROVAL") {
    await createHistoryOfApprovalRequested(
      {
        ticketId: row.tk_id,
        actorUsername: options.requesterUsername,
        approvalStepId: routing.approvalStepId,
        assigneeUsernames: routing.assigneeUsernames,
      },
      repositoryOptions,
    );
  } else {
    await createHistoryOfAssignmentResolvedByRule(
      {
        ticketId: row.tk_id,
        actorUsername: options.requesterUsername,
        fromAssigneeUsernames: [],
        toAssigneeUsernames: routing.assigneeUsernames,
      },
      repositoryOptions,
    );
  }

  return projectTicketDetail(
    routedRow,
    options.requesterUsername,
    repositoryOptions,
  );
}

/** Applies repository-side search, sorting, facets, and pagination before projecting list items. */
export async function searchTicketListItems(
  request: TicketSearchRequestDto,
  currentUserName: string | null,
  principal: TicketReadPrincipal,
): Promise<TicketSearchResponseDto> {
  const result = await findActiveTicketViewRowsBySearch(request, principal);

  return {
    items: result.rows.map((row) => toTicketListItemDto(row, currentUserName)),
    facets: result.facets,
    totalCount: result.totalCount,
    page: result.page,
    pageSize: result.pageSize,
  };
}

// Prior assignment history affects derived viewer permissions, so projection performs one contextual lookup.
async function projectTicketDetail(
  row: Parameters<typeof toTicketDetailDto>[0],
  currentUserName: string | null,
  options: TicketRepositoryOptions = {},
): Promise<TicketDetailDto> {
  const hasBeenWorker = currentUserName
    ? await hasTicketWorkAssignmentHistory(row.tk_id, currentUserName, options)
    : false;

  return toTicketDetailDto(row, {
    currentUserName,
    hasBeenWorker,
  });
}

// Approval takes precedence; category assignment is used only when no approval step applies.
async function resolveInitialTicketRouting(
  params: {
    requesterUsername: string;
    categoryId: number | string;
  },
  options?: TicketRepositoryOptions,
): Promise<InitialTicketRoutingResult> {
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
      phase: "APPROVAL",
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
    phase: "WORK",
    approvalStepId: null,
    assigneeUsernames,
  };
}

function normalizeAssigneeUsernames(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];
}
