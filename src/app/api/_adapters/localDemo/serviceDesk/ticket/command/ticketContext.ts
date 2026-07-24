import { ApiError } from "@/lib/application/api";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

import { getLocalDemoNextStatus } from "./rules";
import { LocalActionRuntimeContext, TicketActionExecutionMode } from "./types";

export const requireTicket = ({
  ticket,
  ticketId,
}: LocalActionRuntimeContext): DbTicketDetail => {
  if (!ticket) {
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.ticketNotFound",
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
    throw new ApiError(
      "serviceDesk.ticketCommand.localDemo.nextStatusUnresolved",
      400,
    );
  }

  return nextStatus;
};

export const requireApprovalStepId = (ticket: DbTicketDetail) => {
  if (ticket.approval_step_id !== null) {
    return ticket.approval_step_id;
  }

  throw new ApiError(
    "serviceDesk.ticketCommand.localDemo.approvalForbidden",
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

  throw new ApiError(
    "serviceDesk.ticketCommand.localDemo.approvalForbidden",
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

  throw new ApiError(
    "serviceDesk.ticketCommand.localDemo.assigneeForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};

export const assertWorkAssigneeOrAdmin = (
  context: LocalActionRuntimeContext,
  messageKey = "serviceDesk.ticketCommand.localDemo.assigneeForbidden",
) => {
  const ticket = requireTicket(context);

  if (context.isAdmin || isCurrentWorkAssignee(ticket, context.employeeUserName)) {
    return ticket;
  }

  throw new ApiError(messageKey, 403, {
    ticketId: ticket.id,
    username: context.employeeUserName,
  });
};

export const assertRequester = (context: LocalActionRuntimeContext) => {
  const ticket = requireTicket(context);

  if (ticket.requester_username === context.employeeUserName) {
    return ticket;
  }

  throw new ApiError(
    "serviceDesk.ticketCommand.localDemo.requesterForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};

export const assertRequesterOrAdmin = (context: LocalActionRuntimeContext) => {
  const ticket = requireTicket(context);

  if (
    context.isAdmin ||
    ticket.requester_username === context.employeeUserName
  ) {
    return ticket;
  }

  throw new ApiError(
    "serviceDesk.ticketCommand.localDemo.requesterForbidden",
    403,
    {
      ticketId: ticket.id,
      username: context.employeeUserName,
    },
  );
};
