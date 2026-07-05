import type { TicketActionDto } from "./ticketActionDto";
import { mapTicketActionRowToDto } from "./ticketActionMapper";
import {
  findActiveTicketActionRowsByTicketId,
  type TicketActionRepositoryOptions,
} from "./ticketActionRepository";

type TicketActionServiceOptions = TicketActionRepositoryOptions;

export async function getTicketActionsByTicketId(
  ticketId: string,
  options?: TicketActionServiceOptions,
): Promise<TicketActionDto[]> {
  const rows = await findActiveTicketActionRowsByTicketId(ticketId, options);

  return rows.map(mapTicketActionRowToDto);
}
