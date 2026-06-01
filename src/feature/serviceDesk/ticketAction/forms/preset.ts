import type { TicketDetail } from "@/domain/serviceDesk";

import { ticketActionDraftFormDefaultValues } from "./defaultValues";
import type { TicketActionDraftFormValues } from "./types";

export function createTicketActionDraftValues(
  actionType: TicketActionDraftFormValues["actionType"],
  ticket?: TicketDetail | null,
): TicketActionDraftFormValues {
  const baseValues: TicketActionDraftFormValues = {
    ...ticketActionDraftFormDefaultValues,
    actionType,
  };

  if (actionType === "ASSIGN") {
    return {
      ...baseValues,
      assigneeUsernames: ticket?.assigneeUsernames ?? [],
      categoryId: ticket?.categoryId ?? "",
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
