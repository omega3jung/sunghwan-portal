import {
  NextResponse,
  type NextResponse as NextResponseType,
} from "next/server";

import {
  createTicket,
  getTicketDetail,
  getTicketListItems,
  requesterUpdateTicketRequestSchema,
  searchTicketListItems,
  type TicketCreateRequestDto,
  type TicketSearchRequestDto,
  type TicketSearchSortDto,
  updateRequesterTicket,
} from "@/server/data/serviceDesk/ticket";
import {
  type ApprovalTicketActionRequestDto,
  executeTicketApprovalAction,
  getTicketActionsByTicketId,
  isTicketApprovalActionPath,
} from "@/server/data/serviceDesk/ticketAction";
import {
  createTicketDraft,
  discardTicketDraft,
  getTicketDraft,
  type TicketDraftWriteDto,
  updateTicketDraft,
} from "@/server/data/serviceDesk/ticketDraft";
import { getTicketHistoriesByTicketId } from "@/server/data/serviceDesk/ticketHistory";
import { getWorkSessionsByTicketId } from "@/server/data/serviceDesk/workSession";
import { getPortalApiQueryValue } from "@/server/portalApi/utils";

import {
  createNotFoundResponse,
  requireBody,
  ServiceDeskPortalApiContext,
} from "./serviceDeskPortalApiUtils";

const TICKET_LIST_PATH_PATTERN = /^\/service-desk\/tickets$/;
const TICKET_SEARCH_PATH_PATTERN = /^\/service-desk\/tickets\/search$/;
const TICKET_DRAFT_PATH_PATTERN = /^\/service-desk\/tickets\/draft$/;
const TICKET_DRAFT_DETAIL_PATH_PATTERN =
  /^\/service-desk\/tickets\/draft\/([^/]+)$/;
const TICKET_ACTION_LIST_PATH_PATTERN =
  /^\/service-desk\/tickets\/([^/]+)\/actions$/;
const TICKET_COMMAND_PATH_PATTERN =
  /^\/service-desk\/tickets\/([^/]+)\/command\/([^/]+)$/;
const TICKET_HISTORY_LIST_PATH_PATTERN =
  /^\/service-desk\/tickets\/([^/]+)\/(?:histories|history)$/;
const TICKET_WORK_SESSION_LIST_PATH_PATTERN =
  /^\/service-desk\/tickets\/([^/]+)\/(?:work-session|work-sessions|track-time)$/;
const TICKET_DETAIL_PATH_PATTERN = /^\/service-desk\/tickets\/([^/]+)$/;
const CURRENT_USERNAME_HEADER = "X-Current-Username";
const TICKET_SORT_FIELDS = new Set<TicketSearchSortDto["field"]>([
  "ticketNumber",
  "createdAt",
  "updatedAt",
  "dueAt",
  "priority",
  "status",
]);
const SORT_DIRECTIONS = new Set<TicketSearchSortDto["direction"]>([
  "asc",
  "desc",
]);

export async function handleTicketPortalApi(
  context: ServiceDeskPortalApiContext,
): Promise<NextResponseType> {
  const currentUserName = getCurrentUserName(context);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (TICKET_DRAFT_PATH_PATTERN.test(context.path)) {
    return handleTicketDraftPortalApi(context, currentUserName);
  }

  const draftDetailMatch = TICKET_DRAFT_DETAIL_PATH_PATTERN.exec(context.path);

  if (draftDetailMatch) {
    return handleTicketDraftDetailPortalApi(
      context,
      currentUserName,
      decodeURIComponent(draftDetailMatch[1] ?? ""),
    );
  }

  if (TICKET_LIST_PATH_PATTERN.test(context.path)) {
    if (context.method === "POST") {
      const ticket = await createTicket(
        requireBody<TicketCreateRequestDto>(context.options),
        {
          requesterUsername: currentUserName,
        },
      );

      return NextResponse.json(ticket, { status: 201 });
    }

    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const items = await getTicketListItems(currentUserName);

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  if (TICKET_SEARCH_PATH_PATTERN.test(context.path)) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const result = await searchTicketListItems(
      getTicketSearchRequest(context),
      currentUserName,
    );

    return NextResponse.json(result);
  }

  const actionListMatch = TICKET_ACTION_LIST_PATH_PATTERN.exec(context.path);

  if (actionListMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const items = await getTicketActionsByTicketId(
      decodePathSegment(actionListMatch[1]),
    );

    return createListResponse(items);
  }

  const commandMatch = TICKET_COMMAND_PATH_PATTERN.exec(context.path);

  if (commandMatch) {
    if (context.method !== "POST") {
      return createNotFoundResponse();
    }

    const action = decodePathSegment(commandMatch[2]);

    if (!isTicketApprovalActionPath(action)) {
      return createNotFoundResponse();
    }

    const actionDto = await executeTicketApprovalAction({
      ticketId: decodePathSegment(commandMatch[1]),
      action,
      currentUserName,
      payload: requireBody<ApprovalTicketActionRequestDto>(context.options),
    });

    return NextResponse.json(actionDto, { status: 201 });
  }

  const historyListMatch = TICKET_HISTORY_LIST_PATH_PATTERN.exec(context.path);

  if (historyListMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const items = await getTicketHistoriesByTicketId(
      decodePathSegment(historyListMatch[1]),
    );

    return createListResponse(items);
  }

  const workSessionListMatch = TICKET_WORK_SESSION_LIST_PATH_PATTERN.exec(
    context.path,
  );

  if (workSessionListMatch) {
    if (context.method !== "GET") {
      return createNotFoundResponse();
    }

    const items = await getWorkSessionsByTicketId(
      decodePathSegment(workSessionListMatch[1]),
    );

    return createListResponse(items);
  }

  const detailMatch = TICKET_DETAIL_PATH_PATTERN.exec(context.path);

  if (detailMatch) {
    const ticketId = decodePathSegment(detailMatch[1]);

    if (context.method === "GET") {
      const ticket = await getTicketDetail(ticketId, currentUserName);

      return ticket ? NextResponse.json(ticket) : createNotFoundResponse();
    }

    if (context.method === "PUT") {
      const parsedBody = requesterUpdateTicketRequestSchema.safeParse(
        requireBody(context.options),
      );

      if (!parsedBody.success) {
        throw createStatusError("Invalid request body.", 400);
      }

      const ticket = await updateRequesterTicket(
        ticketId,
        parsedBody.data,
        currentUserName,
      );

      return NextResponse.json(ticket);
    }

    return createNotFoundResponse();
  }

  return createNotFoundResponse();
}

function createListResponse<T>(items: T[]) {
  return NextResponse.json({
    items,
    total: items.length,
  });
}

function decodePathSegment(value: string | undefined) {
  return decodeURIComponent(value ?? "");
}

async function handleTicketDraftPortalApi(
  context: ServiceDeskPortalApiContext,
  currentUserName: string,
) {
  if (context.method === "GET") {
    return NextResponse.json(await getTicketDraft(currentUserName));
  }

  if (context.method === "POST") {
    const draft = await createTicketDraft(
      currentUserName,
      requireBody<TicketDraftWriteDto>(context.options),
    );

    return NextResponse.json(draft, { status: 201 });
  }

  return createNotFoundResponse();
}

async function handleTicketDraftDetailPortalApi(
  context: ServiceDeskPortalApiContext,
  currentUserName: string,
  ticketId: string,
) {
  if (context.method === "PUT") {
    const draft = await updateTicketDraft(
      ticketId,
      currentUserName,
      requireBody<TicketDraftWriteDto>(context.options),
    );

    return NextResponse.json(draft);
  }

  if (context.method === "DELETE") {
    await discardTicketDraft(ticketId, currentUserName);

    return new NextResponse(null, { status: 204 });
  }

  return createNotFoundResponse();
}

function getCurrentUserName(context: ServiceDeskPortalApiContext) {
  const value = new Headers(context.options.headers).get(
    CURRENT_USERNAME_HEADER,
  );
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function getTicketSearchRequest(
  context: ServiceDeskPortalApiContext,
): TicketSearchRequestDto {
  return {
    filter: parseJsonQueryValue<TicketSearchRequestDto["filter"]>(
      getPortalApiQueryValue(context.request, context.options, "filter"),
    ),
    sort: parseTicketSearchSort(context),
    page: parseNumberQueryValue(
      getPortalApiQueryValue(context.request, context.options, "page"),
    ),
    pageSize: parseNumberQueryValue(
      getPortalApiQueryValue(context.request, context.options, "pageSize"),
    ),
  };
}

function parseTicketSearchSort(
  context: ServiceDeskPortalApiContext,
): TicketSearchSortDto | undefined {
  const field = getPortalApiQueryValue(
    context.request,
    context.options,
    "sortField",
  );
  const direction = getPortalApiQueryValue(
    context.request,
    context.options,
    "sortDirection",
  );

  if (field || direction) {
    return normalizeTicketSearchSort({ field, direction });
  }

  const legacySort = getPortalApiQueryValue(
    context.request,
    context.options,
    "sort",
  );

  if (!legacySort) {
    return undefined;
  }

  return normalizeTicketSearchSort(parseJsonQueryValue<unknown>(legacySort));
}

function normalizeTicketSearchSort(
  value: unknown,
): TicketSearchSortDto | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value !== "object") {
    throw createStatusError("Invalid search query.", 400);
  }

  const sort = value as Partial<TicketSearchSortDto>;

  if (!isTicketSortField(sort.field) || !isSortDirection(sort.direction)) {
    throw createStatusError("Invalid search query.", 400);
  }

  return {
    field: sort.field,
    direction: sort.direction,
  };
}

function isTicketSortField(
  value: unknown,
): value is TicketSearchSortDto["field"] {
  return (
    typeof value === "string" &&
    TICKET_SORT_FIELDS.has(value as TicketSearchSortDto["field"])
  );
}

function isSortDirection(
  value: unknown,
): value is TicketSearchSortDto["direction"] {
  return (
    typeof value === "string" &&
    SORT_DIRECTIONS.has(value as TicketSearchSortDto["direction"])
  );
}

function parseJsonQueryValue<T>(value: string | null): T | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw createStatusError("Invalid search query.", 400);
  }
}

function parseNumberQueryValue(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
