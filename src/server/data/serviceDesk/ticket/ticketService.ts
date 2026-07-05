import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";

import {
  createHistoryOfApprovalRequested,
  createHistoryOfAssignmentChange,
  createHistoryOfTicketCreate,
} from "../ticketHistory";
import {
  TicketCreateRequestDto,
  TicketDetailDto,
  TicketListItemDto,
  TicketSearchRequestDto,
  TicketSearchResponseDto,
  TicketUpdateRequestDto,
} from "./ticketDto";
import {
  mapTicketCreateRequestDtoToRowInput,
  mapTicketUpdateRequestDtoToRowInput,
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
  findNextApprovalStepId,
  findNextTicketNumber,
  submitDraftTicketRowById,
  type TicketRepositoryOptions,
  updateTicketInitialRoutingById,
  updateTicketRowById,
} from "./ticketRepository";

export type CreateTicketOptions = {
  ticketNo?: string;
  requesterUsername: string;
  query?: TicketRepositoryOptions["query"];
};

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

  return row ? toTicketDetailDto(row, currentUserName) : null;
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
  const rowInput = {
    ...mapTicketCreateRequestDtoToRowInput(input, {
      ticketNo,
      requesterUsername: options.requesterUsername,
    }),
    tk_approval_step_id: null,
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

  const routing = await resolveInitialTicketRouting(
    {
      requesterUsername: options.requesterUsername,
      categoryId: row.cat_id,
    },
    repositoryOptions,
  );

  const routedRow = await updateTicketInitialRoutingById(
    row.tk_id,
    {
      approvalStepId: routing.approvalStepId,
      assigneeUsernames: routing.assigneeUsernames,
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
    await createHistoryOfAssignmentChange(
      {
        ticketId: row.tk_id,
        actorUsername: options.requesterUsername,
        fromAssigneeUsernames: [],
        toAssigneeUsernames: routing.assigneeUsernames,
      },
      repositoryOptions,
    );
  }

  return toTicketDetailDto(routedRow, options.requesterUsername);
}

export async function updateTicket(
  ticketId: string,
  input: TicketUpdateRequestDto,
  currentUserName: string | null,
): Promise<TicketDetailDto> {
  const row = await updateTicketRowById(
    ticketId,
    mapTicketUpdateRequestDtoToRowInput(input),
  );

  if (!row) {
    throw createStatusError("Ticket not found.", 404);
  }

  return toTicketDetailDto(row, currentUserName);
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
