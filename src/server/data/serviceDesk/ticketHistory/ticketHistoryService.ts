import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";

import type { CreateTicketHistoryInput, TicketHistoryDto } from "./ticketHistoryDto";
import { mapTicketHistoryRowToDto } from "./ticketHistoryMapper";
import { omitMetadataIdentityFromJsonValue } from "./ticketHistoryMetadata";
import {
  createTicketHistoryRow,
  findTicketHistoryRowsByTicketId,
  type TicketHistoryRepositoryOptions,
} from "./ticketHistoryRepository";

/** Configures ticket history service without leaking infrastructure details to callers. */
export type TicketHistoryServiceOptions = TicketHistoryRepositoryOptions;

/** Creates ticket history through the server persistence boundary. */
export async function createTicketHistory(
  input: CreateTicketHistoryInput,
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto> {
  const row = await createTicketHistoryRow(
    {
      ...input,
      metadata: omitMetadataIdentityFromJsonValue(input.metadata),
    },
    options,
  );

  if (!row) {
    throw createStatusError("Unable to create ticket history.", 409);
  }

  return mapTicketHistoryRowToDto(row);
}

/** Loads ticket histories by ticket id through the server data boundary. */
export async function getTicketHistoriesByTicketId(
  ticketId: string,
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto[]> {
  const rows = await findTicketHistoryRowsByTicketId(ticketId, options);

  return rows.map(mapTicketHistoryRowToDto);
}
