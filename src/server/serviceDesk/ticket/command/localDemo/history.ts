import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";

import {
  LocalActionEffect,
  LocalActionHandler,
  LocalActionRuntimeContext,
} from "../types";
import { getMaxHistoryNo, toHistoryMetadata } from "../utils";
import { requireNextStatus, requireTicket } from "./ticketContext";

const buildHistoryBase = ({
  ticketId,
  employeeUserName,
  actionNo,
  createdAt,
  isInternal = false,
}: LocalActionRuntimeContext): Pick<
  DbTicketHistory,
  "ticket_id" | "history_no" | "actor_id" | "action_no" | "created_at"
> => ({
  ticket_id: ticketId,
  history_no: getMaxHistoryNo(ticketId, isInternal),
  actor_id: employeeUserName,
  action_no: actionNo.toString(),
  created_at: createdAt,
});

export const buildHistory = (
  context: LocalActionRuntimeContext,
  history: LocalActionEffect["history"],
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
      action: "UPDATED",
      from_value: ticket.status,
      to_value: nextStatus,
      metadata: toHistoryMetadata(context.content),
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
      action: "CREATED",
      metadata: toHistoryMetadata(content),
    },
  });
