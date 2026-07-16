import type { resolveApprovedTicketRouting } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/createRouting";
import { DbTicketHistory } from "@/lib/application/contracts/serviceDesk";

import { requireNextStatus, requireTicket } from "./ticketContext";
import {
  LocalActionHandler,
  LocalActionHistory,
  LocalActionRuntimeContext,
} from "./types";
import { getMaxHistoryNo, toHistoryMetadata } from "./utils";

type ApprovedTicketRouting = Awaited<
  ReturnType<typeof resolveApprovedTicketRouting>
>;
type LocalTicket = NonNullable<LocalActionRuntimeContext["ticket"]>;

const buildHistoryBase = ({
  ticketId,
  employeeUserName,
  actionNo,
  createdAt,
  historyNoOffset = 0,
  isInternal = false,
}: LocalActionRuntimeContext): Pick<
  DbTicketHistory,
  | "ticket_id"
  | "history_no"
  | "source"
  | "actor_username"
  | "action_no"
  | "created_at"
> => ({
  ticket_id: ticketId,
  history_no: getMaxHistoryNo(ticketId, isInternal) + historyNoOffset,
  source: "USER_ACTION",
  actor_username: employeeUserName,
  action_no: actionNo,
  created_at: createdAt,
});

export const buildHistory = (
  context: LocalActionRuntimeContext,
  history: LocalActionHistory,
): DbTicketHistory => ({
  ...buildHistoryBase(context),
  ...history,
});

export const createStatusHistory: LocalActionHandler = (context) => {
  const ticket = requireTicket(context);
  const nextStatus = requireNextStatus(context);

  return {
    history: {
      type: "STATUS",
      event: "STATUS_UPDATED",
      from_value: { status: ticket.status },
      to_value: { status: nextStatus },
      metadata: toHistoryMetadata(context.content),
    },
  };
};

export const normalizeApprovalStepId = (approvalStepId: string | null) => {
  if (approvalStepId === null) {
    return null;
  }

  const numericApprovalStepId = Number(approvalStepId);

  return Number.isFinite(numericApprovalStepId)
    ? numericApprovalStepId
    : approvalStepId;
};

export const createRoutingHistory = (
  ticket: LocalTicket,
  routing: ApprovedTicketRouting,
): LocalActionHistory => {
  if (routing.approvalStepId !== null) {
    return {
      type: "APPROVAL",
      source: "APPROVAL_RULE",
      event: "APPROVAL_REQUESTED",
      from_value: null,
      to_value: {
        approvalStepId: normalizeApprovalStepId(routing.approvalStepId),
        assigneeUsernames: routing.assigneeUsernames,
      },
      metadata: {
        nextApprovalStepId: normalizeApprovalStepId(routing.approvalStepId),
        nextAssigneeUsernames: routing.assigneeUsernames,
      },
    };
  }

  return {
    type: "ASSIGNMENT",
    source: "ASSIGNMENT_RULE",
    event: "ASSIGNMENT_RESOLVED",
    from_value: {
      status: ticket.status,
      assigneeUsernames: ticket.assignee_usernames,
    },
    to_value: {
      status: routing.status,
      assigneeUsernames: routing.assigneeUsernames,
    },
    metadata: {
      previousStatus: ticket.status,
      nextStatus: routing.status,
      previousAssigneeUsernames: ticket.assignee_usernames,
      nextAssigneeUsernames: routing.assigneeUsernames,
    },
  };
};

export const createMessageHistory =
  (
    type: Extract<DbTicketHistory["type"], "COMMENT" | "NOTE">,
  ): LocalActionHandler =>
  ({ content }) => ({
    history: {
      type,
      event: type === "COMMENT" ? "COMMENT_CREATED" : "NOTE_CREATED",
      metadata: toHistoryMetadata(content),
    },
  });
