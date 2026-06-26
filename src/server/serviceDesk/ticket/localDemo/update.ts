import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { TicketStatus } from "@/domain/serviceDesk";
import { camelTicketDetailMapper } from "@/feature/serviceDesk/ticket/api";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";
import type { TicketMutateRequestPayload } from "@/feature/serviceDesk/ticket/write";

import { getLocalDemoTickets } from "../state";
import { resolveCategorySnapshot } from "./category";
import { resolvePriorityValue, resolveRiskLevelValue } from "./ticketValue";

const EDITABLE_TICKET_STATUSES: TicketStatus[] = ["Draft", "Open", "Declined"];

export const localUpdateTicket = ({
  isInternal,
  ticketId,
  input,
}: {
  isInternal: boolean;
  ticketId: string;
  input: TicketMutateRequestPayload;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const ticketIndex = targetMock.findIndex((item) => item.id === ticketId);

  if (ticketIndex < 0) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const ticket = targetMock[ticketIndex];

  if (!EDITABLE_TICKET_STATUSES.includes(ticket.status)) {
    throw new ServiceDeskApiError(
      "api.tickets.localDemo.updateNotAllowed",
      409,
      {
        status: ticket.status,
      },
    );
  }

  const category = resolveCategorySnapshot({
    isInternal,
    categoryId: String(input.categoryId),
  });
  const resetDeclinedFlow = ticket.status === "Declined";
  const updatedTicket: DbTicketDetail = {
    ...ticket,
    status: resetDeclinedFlow ? "Open" : ticket.status,
    close_reason: resetDeclinedFlow ? null : (ticket.close_reason ?? null),
    priority: resolvePriorityValue(input.priority, ticket.priority),
    risk_level:
      input.riskLevel === undefined
        ? ticket.risk_level
        : resolveRiskLevelValue(input.riskLevel, ticket.risk_level),
    due_at: input.dueAt,
    scope: category.scope,
    category_id: category.id,
    category_name: category.name,
    approval_step_id: resetDeclinedFlow ? null : ticket.approval_step_id,
    subject: input.subject,
    content: input.body,
    email: input.email,
    files: input.files,
    images: input.images,
    updated_at: new Date().toISOString(),
  };

  // TODO: Add ticket history record generation for local update flow.
  targetMock.splice(ticketIndex, 1, updatedTicket);

  return camelTicketDetailMapper([updatedTicket])[0];
};
