import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";

import { TicketDraftDto, TicketDraftWriteDto } from "./ticketDraftDto";
import {
  mapTicketDraftRowToDto,
  mapTicketDraftWriteDtoToRowInput,
} from "./ticketDraftMapper";
import {
  createTicketDraftRow,
  discardTicketDraftRowById,
  findTicketDraftRowByRequesterUsername,
  updateTicketDraftRowById,
} from "./ticketDraftRepository";

export async function getTicketDraft(
  requesterUsername: string,
): Promise<TicketDraftDto | null> {
  const row = await findTicketDraftRowByRequesterUsername(requesterUsername);

  return row ? mapTicketDraftRowToDto(row) : null;
}

export async function createTicketDraft(
  requesterUsername: string,
  input: TicketDraftWriteDto,
): Promise<TicketDraftDto> {
  let row;

  try {
    row = await createTicketDraftRow(
      requesterUsername,
      mapTicketDraftWriteDtoToRowInput(input),
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createStatusError("Ticket draft already exists.", 409);
    }

    throw error;
  }

  if (!row) {
    throw createStatusError("Unable to create ticket draft.", 409);
  }

  return mapTicketDraftRowToDto(row);
}

export async function updateTicketDraft(
  ticketId: string,
  requesterUsername: string,
  input: TicketDraftWriteDto,
): Promise<TicketDraftDto> {
  const row = await updateTicketDraftRowById(
    ticketId,
    requesterUsername,
    mapTicketDraftWriteDtoToRowInput(input),
  );

  if (!row) {
    throw createStatusError("Ticket draft not found.", 404);
  }

  return mapTicketDraftRowToDto(row);
}

export async function discardTicketDraft(
  ticketId: string,
  requesterUsername: string,
): Promise<void> {
  const discarded = await discardTicketDraftRowById(ticketId, requesterUsername);

  if (!discarded) {
    throw createStatusError("Ticket draft not found.", 404);
  }
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
