import type { ServiceDeskRepositoryOptions } from "@/server/data/serviceDesk/shared";
import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import type { TicketParticipationRow } from "./ticketParticipationRow";

export async function findTicketParticipationRow(
  ticketId: string,
  effectiveUsername: string,
  options: ServiceDeskRepositoryOptions = {},
): Promise<TicketParticipationRow | null> {
  const query = options.query ?? queryPortalApi;
  const rows = await query<TicketParticipationRow>(`
select ticket_relation, is_approval_participant, is_assignment_participant
from service_desk.get_ticket_participation($1::text, $2::text);
`, [ticketId, effectiveUsername]);
  if (rows.length > 1) throw new Error("Ambiguous Ticket participation result.");
  return rows[0] ?? null;
}
