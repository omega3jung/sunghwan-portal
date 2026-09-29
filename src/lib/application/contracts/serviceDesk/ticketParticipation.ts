export type TicketRelation =
  | "Requester"
  | "CurrentAssignee"
  | "PreviousAssignee"
  | null;

/** Direct/history relationship plus current configuration; never a Ticket read grant. */
export type TicketParticipation = {
  ticketRelation: TicketRelation;
  isApprovalParticipant: boolean;
  isAssignmentParticipant: boolean;
  /** Canonical effective-user Ticket Action Admin, composed by the server. */
  isAdmin: boolean;
};
