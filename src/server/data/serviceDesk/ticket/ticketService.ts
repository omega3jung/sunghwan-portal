import {
  TicketDetailDto,
  TicketListItemDto,
  TicketSearchRequestDto,
  TicketSearchResponseDto,
} from "./ticketDto";
import { toTicketDetailDto, toTicketListItemDto } from "./ticketMapper";
import {
  findActiveTicketViewRowById,
  findActiveTicketViewRows,
  findActiveTicketViewRowsBySearch,
} from "./ticketRepository";

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
