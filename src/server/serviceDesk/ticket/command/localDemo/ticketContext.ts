import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";

import { LocalActionRuntimeContext, TicketActionExecutionMode } from "../types";
import { getLocalDemoNextStatus } from "./rules";

export const requireTicket = ({
  ticket,
  ticketId,
}: LocalActionRuntimeContext): DbTicketDetail => {
  if (!ticket) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.ticketNotFound",
      404,
      { ticketId },
    );
  }

  return ticket;
};

export const resolveNextTicketStatus = (
  actionMode: TicketActionExecutionMode,
  ticket?: DbTicketDetail,
) => {
  if (!ticket) {
    return undefined;
  }

  return getLocalDemoNextStatus(actionMode, ticket.status);
};

export const requireNextStatus = ({
  nextStatus,
}: Pick<LocalActionRuntimeContext, "nextStatus">) => {
  if (!nextStatus) {
    throw new ServiceDeskApiError(
      "api.ticketCommand.localDemo.nextStatusUnresolved",
      400,
    );
  }

  return nextStatus;
};

export const requireApprovalStepId = (ticket: DbTicketDetail) => {
  if (ticket.approval_step_id !== null) {
    return ticket.approval_step_id;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.approvalForbidden",
    403,
    { ticketId: ticket.id },
  );
};

export const requireApprovalTicket = (
  context: LocalActionRuntimeContext,
): DbTicketDetail => {
  const ticket = requireTicket(context);
  const isApprovalPhase =
    ticket.assignment_phase === "APPROVAL" || ticket.approval_step_id !== null;

  if (
    ticket.active &&
    ticket.status === "Approval" &&
    isApprovalPhase &&
    ticket.approval_step_id !== null &&
    (context.isAdmin ||
      ticket.assignee_usernames.includes(context.employeeUserName))
  ) {
    return ticket;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.approvalForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};

const isWorkPhase = (ticket: DbTicketDetail) =>
  ticket.assignment_phase === "WORK" || ticket.approval_step_id === null;

const isCurrentWorkAssignee = (
  ticket: DbTicketDetail,
  employeeUserName: string,
) => isWorkPhase(ticket) && ticket.assignee_usernames.includes(employeeUserName);

export const assertCurrentWorkAssignee = (
  context: LocalActionRuntimeContext,
) => {
  const ticket = requireTicket(context);

  if (isCurrentWorkAssignee(ticket, context.employeeUserName)) {
    return ticket;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.assigneeForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};

export const assertWorkAssigneeOrAdmin = (
  context: LocalActionRuntimeContext,
  messageKey = "api.ticketCommand.localDemo.assigneeForbidden",
) => {
  const ticket = requireTicket(context);

  if (context.isAdmin || isCurrentWorkAssignee(ticket, context.employeeUserName)) {
    return ticket;
  }

  throw new ServiceDeskApiError(messageKey, 403, {
    ticketId: ticket.id,
    username: context.employeeUserName,
  });
};

export const assertRequester = (context: LocalActionRuntimeContext) => {
  const ticket = requireTicket(context);

  if (ticket.requester_username === context.employeeUserName) {
    return ticket;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.requesterForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};

export const assertRequesterOrAdmin = (context: LocalActionRuntimeContext) => {
  const ticket = requireTicket(context);

  if (context.isAdmin || ticket.requester_username === context.employeeUserName) {
    return ticket;
  }

  throw new ServiceDeskApiError(
    "api.ticketCommand.localDemo.requesterForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};
