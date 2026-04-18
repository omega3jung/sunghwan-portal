import { DbTicketDetail } from "@/api/serviceDesk/ticket";
import { clientTicketsMocks } from "@/app/_mocks/scenarios/serviceDesk/clientTicketsMock";
import { internalActionsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalActionsMock";
import { internalHistoriesMocks } from "@/app/_mocks/scenarios/serviceDesk/internalHistoriesMock";
import { internalTicketsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalTicketsMock";
import { Priority, RiskLevel } from "@/domain/common";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/forms/action";

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
    throw new Error(`Ticket ${ticketId} not found`);
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
    throw new Error("ASSIGN action requires assigneeIds");
  }

  return content.assigneeIds;
};

export const requireTargetTicketId = (content: TicketActionFormValues) => {
  if (!content.targetTicketId) {
    throw new Error("MERGE action requires targetTicketId");
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
    throw new Error(`Invalid priority: ${value}`);
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
    throw new Error(`Invalid risk level: ${value}`);
  }

  return value;
};
