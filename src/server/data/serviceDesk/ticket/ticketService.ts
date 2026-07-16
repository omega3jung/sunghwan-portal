import type { TicketStatus } from "@/domain/serviceDesk";
import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";

import {
  createHistoryOfApprovalRequested,
  createHistoryOfAssignmentResolvedByRule,
  createHistoryOfStatusChange,
  createHistoryOfSystemResolutionClose,
  createHistoryOfTicketCreate,
} from "../ticketHistory";
import { finishRunningWorkSessionsByTicketId } from "../workSession";
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
  closeResolvedTicketById,
  createTicketRow,
  findActiveDraftTicketIdByRequesterUsername,
  findActiveTicketViewRowById,
  findActiveTicketViewRows,
  findActiveTicketViewRowsBySearch,
  findApprovalStepAssigneeUsernames,
  findCategoryAssignmentUsernames,
  findExpiredResolvedTicketViewRows,
  findNextApprovalStepId,
  findNextTicketNumber,
  hasTicketWorkAssignmentHistory,
  startAssignedTicketWorkById,
  submitDraftTicketRowById,
  type TicketRepositoryOptions,
  updateTicketInitialRoutingById,
} from "./ticketRepository";

export type CreateTicketOptions = {
  ticketNo?: string;
  requesterUsername: string;
  query?: TicketRepositoryOptions["query"];
};

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

export async function getTicketListItems(
  currentUserName: string | null,
): Promise<TicketListItemDto[]> {
  const rows = await findActiveTicketViewRows();

  return rows.map((row) => toTicketListItemDto(row, currentUserName));
}

export async function getTicketDetail(
  ticketId: string,
  currentUserName: string | null,
): Promise<TicketDetailDto | null> {
  const row = await findActiveTicketViewRowById(ticketId);

  return row ? projectTicketDetail(row, currentUserName) : null;
}

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
      throw createStatusError("Only a current work assignee can start work.", 403);
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
  const baseRowInput = mapTicketCreateRequestDtoToRowInput(input, {
    ticketNo,
    requesterUsername: options.requesterUsername,
  });
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

export async function searchTicketListItems(
  request: TicketSearchRequestDto,
  currentUserName: string | null,
): Promise<TicketSearchResponseDto> {
  const result = await findActiveTicketViewRowsBySearch(request);

  return {
    items: result.rows.map((row) => toTicketListItemDto(row, currentUserName)),
    totalCount: result.totalCount,
    page: result.page,
    pageSize: result.pageSize,
  };
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

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
