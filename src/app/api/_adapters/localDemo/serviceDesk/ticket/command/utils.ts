import { Priority, RiskLevel } from "@/domain/common";
import { ApiError } from "@/lib/application/api";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { TicketActionFormValues } from "@/lib/application/contracts/serviceDesk";

import {
  getLocalDemoActions,
  getLocalDemoHistories,
  getLocalDemoTickets,
} from "../state";

type TicketContext = {
  targetMock: DbTicketDetail[];
  index: number;
  ticket: DbTicketDetail;
};

export const getMaxHistoryNo = (ticketId: string, _isInternal: boolean) => {
  const items = getLocalDemoHistories()
    .filter((item) => item.ticket_id === ticketId)
    .map((action) => action.history_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

export const getNextActionNo = (ticketId: string, _isInternal: boolean) => {
  const items = getLocalDemoActions()
    .filter((item) => item.ticket_id === ticketId && item.active)
    .map((action) => action.action_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

export const getTicketContext = (
  ticketId: string,
  _isInternal = false,
): TicketContext => {
  const targetMock = getLocalDemoTickets();
  const index = targetMock.findIndex((item) => item.id === ticketId);

  if (index < 0) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.ticketNotFound",
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
): Record<string, unknown> => ({
  ...content,
});

export const requireAssigneeIds = (content: TicketActionFormValues) => {
  if (!content.assigneeUsernames) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.assigneeRequired",
      400,
    );
  }

  return content.assigneeUsernames;
};

export const requireTargetTicketId = (content: TicketActionFormValues) => {
  if (!content.targetTicketId) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.targetTicketRequired",
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
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.invalidPriority",
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
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.invalidRiskLevel",
      400,
      { value },
    );
  }

  return value;
};
