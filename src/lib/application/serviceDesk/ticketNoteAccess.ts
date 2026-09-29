import type { TicketParticipation } from "@/lib/application/contracts/serviceDesk/ticketParticipation";

/** Require Ticket visibility, then apply effective Admin before requester exclusion. */
export function canAccessTicketNote({
  canReadTicket,
  participation,
}: {
  canReadTicket: boolean;
  participation: TicketParticipation | null;
}): boolean {
  return (
    canReadTicket &&
    participation !== null &&
    (
      participation.isAdmin ||
      (
        participation.ticketRelation !== "Requester" &&
        (
          participation.ticketRelation === "CurrentAssignee" ||
          participation.ticketRelation === "PreviousAssignee" ||
          participation.isApprovalParticipant ||
          participation.isAssignmentParticipant
        )
      )
    )
  );
}

/** Read projection only; persisted History is never rewritten. */
export function isNoteRelatedHistory(
  history: { type: string; event: string; action_no: number | null },
  noteActionNumbers: ReadonlySet<number>,
) {
  return (
    history.type === "NOTE" ||
    ["NOTE_CREATED", "NOTE_UPDATED", "NOTE_DELETED"].includes(history.event) ||
    (history.action_no !== null && noteActionNumbers.has(history.action_no))
  );
}
