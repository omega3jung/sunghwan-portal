import type { TicketDetail } from "@/domain/serviceDesk";
import { selectTicketAssigneeIds } from "@/feature/serviceDesk/ticket/utils";

export type TicketWithAssigneeFilterField = TicketDetail & {
  assigneeUsernames: string[];
};

export function withAssigneeFilterField(
  ticket: TicketDetail,
): TicketWithAssigneeFilterField {
  return {
    ...ticket,
    assigneeUsernames: selectTicketAssigneeIds(ticket),
  };
}
