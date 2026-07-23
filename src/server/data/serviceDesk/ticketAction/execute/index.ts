import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";

import type {
  NormalizedTicketActionPayload,
  TicketActionExecutionMode,
  TicketGeneralActionPath,
} from "../ticketActionRules";
import { executeAdjustTicketAction } from "./adjustTicketAction";
import { executeAssignSelfTicketAction } from "./assignSelfTicketAction";
import { executeAssignTicketAction } from "./assignTicketAction";
import { executeCancelTicketAction } from "./cancelTicketAction";
import { executeCommentTicketAction } from "./commentTicketAction";
import { executeMergeTicketAction } from "./mergeTicketAction";
import { executeNoteTicketAction } from "./noteTicketAction";
import { executeRejectTicketAction } from "./rejectTicketAction";
import { executeReopenTicketAction } from "./reopenTicketAction";
import { executeResubmitTicketAction } from "./resubmitTicketAction";

export async function applyTicketActionEffect({
  action,
  actionMode,
  ticket,
  targetTicket,
  ticketId,
  actionNo,
  currentUserName,
  isAdmin,
  payload,
  query,
}: {
  action: TicketGeneralActionPath;
  actionMode: TicketActionExecutionMode;
  ticket: ServiceDeskTicketViewRow;
  targetTicket: ServiceDeskTicketViewRow | null;
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  isAdmin: boolean;
  payload: NormalizedTicketActionPayload;
  query: ServiceDeskQueryExecutor;
}) {
  switch (action) {
    case "comment":
      return executeCommentTicketAction({
        ticketId,
        actionNo,
        currentUserName,
        payload,
        query,
      });

    case "note":
      return executeNoteTicketAction({
        ticketId,
        actionNo,
        currentUserName,
        payload,
        query,
      });

    case "assign":
      return executeAssignTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        actionMode,
        query,
      });

    case "assignSelf":
      return executeAssignSelfTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        query,
      });

    case "adjust":
      return executeAdjustTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        query,
      });

    case "reject":
      return executeRejectTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        actionMode,
        query,
      });

    case "merge":
      return executeMergeTicketAction({
        ticket,
        targetTicket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        query,
      });

    case "reopen":
      return executeReopenTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        isAdmin,
        payload,
        actionMode,
        query,
      });

    case "resubmit":
      return executeResubmitTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        payload,
        query,
      });

    case "cancel":
      return executeCancelTicketAction({
        ticket,
        ticketId,
        actionNo,
        currentUserName,
        payload,
        actionMode,
        query,
      });
  }
}

export * from "./adjustTicketAction";
export * from "./approveTicket";
export * from "./assignSelfTicketAction";
export * from "./assignTicketAction";
export * from "./cancelTicketAction";
export * from "./commentTicketAction";
export * from "./declineTicket";
export * from "./mergeTicketAction";
export * from "./noteTicketAction";
export * from "./rejectTicketAction";
export * from "./reopenTicketAction";
export * from "./resubmitTicketAction";
