import type { TicketParticipation } from "@/lib/application/contracts/serviceDesk/ticketParticipation";

import type { TicketParticipationRow } from "./ticketParticipationRow";

export function mapTicketParticipationRow(
  row: TicketParticipationRow,
  isAdmin: boolean,
): TicketParticipation {
  const relation = row.ticket_relation;
  if (
    (relation !== null &&
      relation !== "Requester" &&
      relation !== "CurrentAssignee" &&
      relation !== "PreviousAssignee") ||
    typeof row.is_approval_participant !== "boolean" ||
    typeof row.is_assignment_participant !== "boolean"
  ) {
    throw new Error("Invalid Ticket participation result.");
  }
  return {
    ticketRelation: relation,
    isAdmin,
    isApprovalParticipant: row.is_approval_participant,
    isAssignmentParticipant: row.is_assignment_participant,
  };
}
