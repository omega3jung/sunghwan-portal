import type { TicketDetail } from "@/domain/serviceDesk";
import { selectTicketAssigneeIds } from "@/lib/application/contracts/serviceDesk";

/** Describes ticket with assignee filter field used by the server-side LOCAL ticket adapter. */
export type TicketWithAssigneeFilterField = TicketDetail & {
  assigneeUsernames: string[];
};

/** Projects assignee filter field for the server-side LOCAL ticket adapter. */
export function withAssigneeFilterField(
  ticket: TicketDetail,
): TicketWithAssigneeFilterField {
  return {
    ...ticket,
    assigneeUsernames: selectTicketAssigneeIds(ticket),
  };
}
