import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";

import { findEmployeeDepartmentIdByUsername } from "../ticket/ticketRepository";
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
  const requesterDepartmentId =
    await requireRequesterDepartmentId(requesterUsername);

  try {
    row = await createTicketDraftRow(
      requesterUsername,
      {
        ...mapTicketDraftWriteDtoToRowInput(input),
        tk_requester_department_id: requesterDepartmentId,
      },
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
  const requesterDepartmentId =
    await requireRequesterDepartmentId(requesterUsername);
  const row = await updateTicketDraftRowById(
    ticketId,
    requesterUsername,
    {
      ...mapTicketDraftWriteDtoToRowInput(input),
      tk_requester_department_id: requesterDepartmentId,
    },
  );

  if (!row) {
    throw createStatusError("Ticket draft not found.", 404);
  }

  return mapTicketDraftRowToDto(row);
}

async function requireRequesterDepartmentId(
  requesterUsername: string,
): Promise<number> {
  const departmentId =
    await findEmployeeDepartmentIdByUsername(requesterUsername);

  if (departmentId === null) {
    throw createStatusError("Requester department was not found.", 422);
  }

  return departmentId;
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
