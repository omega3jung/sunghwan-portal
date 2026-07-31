import type { TicketDetail } from "@/domain/serviceDesk";

import { ticketActionDraftFormDefaultValues } from "./defaultValues";
import type { TicketActionDraftFormValues } from "./types";

/** Creates action-specific draft defaults from the current ticket and selected mode. */
export function createTicketActionDraftValues(
  actionType: TicketActionDraftFormValues["actionType"],
  ticket?: TicketDetail | null,
): TicketActionDraftFormValues {
  const baseValues: TicketActionDraftFormValues = {
    ...ticketActionDraftFormDefaultValues,
    actionType,
  };

  if (actionType === "ASSIGN") {
    const isApprovalPhase = ticket?.assignmentPhase === "APPROVAL";

    return {
      ...baseValues,
      assigneeUsernames: isApprovalPhase
        ? (ticket?.approvalAssigneeUsernames ?? [])
        : (ticket?.workAssigneeUsernames ?? []),
      categoryId: isApprovalPhase ? "" : (ticket?.categoryId ?? ""),
    };
  }

  if (actionType === "ADJUST") {
    return {
      ...baseValues,
      priority: ticket?.priority ?? "",
      riskLevel: ticket?.riskLevel ?? "",
      dueAt: ticket?.dueAt ? new Date(ticket.dueAt) : undefined,
    };
  }

  return baseValues;
}
