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
  findActiveTicketViewRowById,
  findActiveTicketViewRows,
  findActiveTicketViewRowsBySearch,
  updateTicketRowById,
} from "./ticketRepository";

export type CreateTicketOptions = {
  ticketNo: string;
  requesterUsername: string;
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
  const row = await createTicketRow(
    mapTicketCreateRequestDtoToRowInput(input, {
      ticketNo: options.ticketNo,
      requesterUsername: options.requesterUsername,
    }),
  );

  if (!row) {
    throw createStatusError("Unable to create ticket.", 409);
  }

  return toTicketDetailDto(row, options.requesterUsername);
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
