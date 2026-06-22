import { TicketDetailDto, TicketListItemDto } from "./ticketDto";
import { toTicketDetailDto, toTicketListItemDto } from "./ticketMapper";
import {
  findActiveTicketViewRowById,
  findActiveTicketViewRows,
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
