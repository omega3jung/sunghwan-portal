import { canAccessTicketNote } from "@/lib/application/serviceDesk/ticketNoteAccess";
import type { ServiceDeskRepositoryOptions } from "@/server/data/serviceDesk/shared";

import { mapTicketParticipationRow } from "./ticketParticipationMapper";
import { findTicketParticipationRow } from "./ticketParticipationRepository";

export async function getTicketParticipation(
  ticketId: string,
  effectiveUsername: string,
  options?: ServiceDeskRepositoryOptions & { isAdmin?: boolean },
) {
  const row = await findTicketParticipationRow(
    ticketId,
    effectiveUsername,
    options?.query ? { query: options.query } : undefined,
  );
  return row ? mapTicketParticipationRow(row, options?.isAdmin === true) : null;
}

/** Caller must separately authorize Ticket visibility before reaching this boundary. */
export async function canReadAuthorizedTicketNote(
  ticketId: string,
  effectiveUsername: string,
  isAdmin: boolean,
  options?: ServiceDeskRepositoryOptions,
) {
  return canAccessTicketNote({
    canReadTicket: true,
    participation: await getTicketParticipation(
      ticketId,
      effectiveUsername,
      { ...options, isAdmin },
    ),
  });
}
