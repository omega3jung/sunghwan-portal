import type { TicketActionType } from "@/domain/serviceDesk";

import type { TicketActionMode } from "./types";

/** Maps UI action modes to the canonical action types persisted by the domain. */
export const ACTION_TYPE_BY_MODE: Record<TicketActionMode, TicketActionType> = {
  approve: "APPROVE",
  decline: "DECLINE",
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  assignSelf: "ASSIGN_SELF",
  reject: "REJECT",
  merge: "MERGE",
  adjust: "ADJUST",
  reopen: "REOPEN",
  resubmit: "RESUBMIT",
  cancel: "CANCEL",
};

/** Maps persisted action types to translation keys used in history and action views. */
export const ACTION_LABEL_KEY_BY_TYPE: Record<TicketActionType, string> = {
  APPROVE: "action.approve",
  DECLINE: "action.decline",
  COMMENT: "action.comment",
  NOTE: "action.note",
  ASSIGN: "action.assign",
  ASSIGN_SELF: "action.assignToMe",
  REJECT: "action.reject",
  MERGE: "action.merge",
  ADJUST: "action.adjustPlan",
  REOPEN: "action.reopenIssue",
  RESUBMIT: "action.resubmitRequest",
  CANCEL: "action.cancelTicket",
};

/** Maps UI action modes to translation keys used by dialogs and buttons. */
export const ACTION_LABEL_KEY_BY_MODE: Record<TicketActionMode, string> = {
  approve: "action.approve",
  decline: "action.decline",
  comment: "action.comment",
  note: "action.note",
  assign: "action.assign",
  assignSelf: "action.assignToMe",
  reject: "action.reject",
  merge: "action.merge",
  adjust: "action.adjustPlan",
  reopen: "action.reopenIssue",
  resubmit: "action.resubmitRequest",
  cancel: "action.cancelTicket",
};

/** Converts a UI action mode to the canonical command action type. */
export function mapActionModeToActionType(mode: TicketActionMode) {
  return ACTION_TYPE_BY_MODE[mode];
}

/** Defines the stable cache or persistence key for get ticket action type label data. */
export function getTicketActionTypeLabelKey(actionType: TicketActionType) {
  return ACTION_LABEL_KEY_BY_TYPE[actionType];
}

/** Defines the stable cache or persistence key for get ticket action mode label data. */
export function getTicketActionModeLabelKey(mode: TicketActionMode) {
  return ACTION_LABEL_KEY_BY_MODE[mode];
}
