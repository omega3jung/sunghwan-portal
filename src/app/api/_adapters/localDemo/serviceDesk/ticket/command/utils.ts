import { Priority, RiskLevel } from "@/domain/common";
import { ApiError } from "@/lib/application/api";
import {
  DbTicketDetail,
  TicketActionCommandPayload,
} from "@/lib/application/contracts/serviceDesk";

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

/** Returns max history no from the server-side LOCAL ticket adapter. */
export const getMaxHistoryNo = (ticketId: string, _isInternal: boolean) => {
  const items = getLocalDemoHistories()
    .filter((item) => item.ticket_id === ticketId)
    .map((action) => action.history_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

/** Returns next action no from the server-side LOCAL ticket adapter. */
export const getNextActionNo = (ticketId: string, _isInternal: boolean) => {
  const items = getLocalDemoActions()
    .filter((item) => item.ticket_id === ticketId && item.active)
    .map((action) => action.action_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

/** Returns ticket context from the server-side LOCAL ticket adapter. */
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

/** Creates updated ticket for the server-side LOCAL ticket adapter. */
export const createUpdatedTicket = (
  ticket: DbTicketDetail,
  patch: Partial<DbTicketDetail>,
  updatedAt: string,
): DbTicketDetail => ({
  ...ticket,
  ...patch,
  updated_at: updatedAt,
});

/** Projects history metadata for the server-side LOCAL ticket adapter. */
export const toHistoryMetadata = (
  content: TicketActionCommandPayload,
): Record<string, unknown> => ({
  ...content,
});

/** Enforces assignee IDs before LOCAL state is exposed or mutated. */
export const requireAssigneeIds = (content: TicketActionCommandPayload) => {
  if (!content.assigneeUsernames) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.assigneeRequired",
      400,
    );
  }

  return content.assigneeUsernames;
};

/** Enforces target ticket ID before LOCAL state is exposed or mutated. */
export const requireTargetTicketId = (content: TicketActionCommandPayload) => {
  if (!content.targetTicketId) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.targetTicketRequired",
      400,
    );
  }

  return content.targetTicketId;
};

/** Returns whether a string is a supported ticket priority. */
export const isPriority = (value: string): value is Priority =>
  value === "urgent" ||
  value === "high" ||
  value === "medium" ||
  value === "low";

/** Returns whether a string is a supported ticket risk level. */
export const isRiskLevel = (value: string): value is RiskLevel =>
  value === "critical" ||
  value === "high" ||
  value === "medium" ||
  value === "low";

/** Resolves priority using the server-side LOCAL ticket adapter policy. */
export const resolvePriority = (
  value: TicketActionCommandPayload["priority"],
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

/** Resolves risk level using the server-side LOCAL ticket adapter policy. */
export const resolveRiskLevel = (
  value: TicketActionCommandPayload["riskLevel"],
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
