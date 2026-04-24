import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { Priority, RiskLevel } from "@/domain/common";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticketAction";
import { clientTicketsMocks } from "@/mocks/scenarios/serviceDesk/clientTicketsMock";
import { internalActionsMocks } from "@/mocks/scenarios/serviceDesk/internalActionsMock";
import { internalHistoriesMocks } from "@/mocks/scenarios/serviceDesk/internalHistoriesMock";
import { internalTicketsMocks } from "@/mocks/scenarios/serviceDesk/internalTicketsMock";

type TicketContext = {
  targetMock: DbTicketDetail[];
  index: number;
  ticket: DbTicketDetail;
};

export const getMaxHistoryNo = (ticketId: string) => {
  const items = internalHistoriesMocks
    .filter((item) => item.ticket_id === ticketId)
    .map((action) => action.history_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

export const getNextActionNo = (ticketId: string) => {
  const items = internalActionsMocks
    .filter((item) => item.ticket_id === ticketId && item.active)
    .map((action) => action.action_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

export const getTargetTickets = (isInternal = false) =>
  isInternal ? internalTicketsMocks : clientTicketsMocks;

export const getTicketContext = (
  ticketId: string,
  isInternal = false,
): TicketContext => {
  const targetMock = getTargetTickets(isInternal);
  const index = targetMock.findIndex((item) => item.id === ticketId);

  if (index < 0) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.ticketNotFound",
      404,
      { ticketId },
    );
  }

  return {
    targetMock,
    index,
    ticket: targetMock[index],
  };
};

export const createUpdatedTicket = (
  ticket: DbTicketDetail,
  patch: Partial<DbTicketDetail>,
  updatedAt: string,
): DbTicketDetail => ({
  ...ticket,
  ...patch,
  updated_at: updatedAt,
});

export const toHistoryMetadata = (
  content: TicketActionFormValues,
): Record<string, unknown> => ({ ...content });

export const requireAssigneeIds = (content: TicketActionFormValues) => {
  if (!content.assigneeIds) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.assigneeRequired",
      400,
    );
  }

  return content.assigneeIds;
};

export const requireTargetTicketId = (content: TicketActionFormValues) => {
  if (!content.targetTicketId) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.targetTicketRequired",
      400,
    );
  }

  return content.targetTicketId;
};

export const isPriority = (value: string): value is Priority =>
  value === "urgent" ||
  value === "high" ||
  value === "medium" ||
  value === "low";

export const isRiskLevel = (value: string): value is RiskLevel =>
  value === "critical" ||
  value === "high" ||
  value === "medium" ||
  value === "low";

export const resolvePriority = (
  value: TicketActionFormValues["priority"],
  fallback: Priority,
) => {
  if (!value) {
    return fallback;
  }

  if (!isPriority(value)) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.invalidPriority",
      400,
      { value },
    );
  }

  return value;
};

export const resolveRiskLevel = (
  value: TicketActionFormValues["riskLevel"],
  fallback: RiskLevel,
) => {
  if (!value) {
    return fallback;
  }

  if (!isRiskLevel(value)) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.invalidRiskLevel",
      400,
      { value },
    );
  }

  return value;
};
