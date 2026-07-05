import type { WorkSessionDto } from "./workSessionDto";
import { mapWorkSessionRowToDto } from "./workSessionMapper";
import {
  findWorkSessionRowsByTicketId,
  type WorkSessionRepositoryOptions,
} from "./workSessionRepository";

type WorkSessionServiceOptions = WorkSessionRepositoryOptions;

export async function getWorkSessionsByTicketId(
  ticketId: string,
  options?: WorkSessionServiceOptions,
): Promise<WorkSessionDto[]> {
  const rows = await findWorkSessionRowsByTicketId(ticketId, options);

  return rows.map(mapWorkSessionRowToDto);
}
