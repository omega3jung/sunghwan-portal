import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";

import type { CreateTicketHistoryInput, TicketHistoryDto } from "./ticketHistoryDto";
import { mapTicketHistoryRowToDto } from "./ticketHistoryMapper";
import { omitMetadataIdentityFromJsonValue } from "./ticketHistoryMetadata";
import {
  createTicketHistoryRow,
  findTicketHistoryRowsByTicketId,
  type TicketHistoryRepositoryOptions,
} from "./ticketHistoryRepository";

export type TicketHistoryServiceOptions = TicketHistoryRepositoryOptions;

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

export async function getTicketHistoriesByTicketId(
  ticketId: string,
  options?: TicketHistoryServiceOptions,
): Promise<TicketHistoryDto[]> {
  const rows = await findTicketHistoryRowsByTicketId(ticketId, options);

  return rows.map(mapTicketHistoryRowToDto);
}
