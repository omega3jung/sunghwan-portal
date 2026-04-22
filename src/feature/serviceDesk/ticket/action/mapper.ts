import type { TicketActionType } from "@/domain/serviceDesk";

import type { TicketActionMode } from "./types";

export const ACTION_TYPE_BY_MODE: Record<
  TicketActionMode,
  TicketActionType
> = {
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  assignSelf: "ASSIGN_SELF",
  reject: "REJECT",
  merge: "MERGE",
  adjust: "ADJUST",
  reopen: "REOPEN",
  resubmit: "RESUBMIT",
};

export const ACTION_LABEL_KEY_BY_TYPE: Record<TicketActionType, string> = {
  COMMENT: "action.comment",
  NOTE: "action.note",
  ASSIGN: "action.assign",
  ASSIGN_SELF: "action.assignToMe",
  REJECT: "action.reject",
  MERGE: "action.merge",
  ADJUST: "action.adjustPlan",
  REOPEN: "action.reopenIssue",
  RESUBMIT: "action.resubmitRequest",
};

export const ACTION_LABEL_KEY_BY_MODE: Record<TicketActionMode, string> = {
  comment: "action.comment",
  note: "action.note",
  assign: "action.assign",
  assignSelf: "action.assignToMe",
  reject: "action.reject",
  merge: "action.merge",
  adjust: "action.adjustPlan",
  reopen: "action.reopenIssue",
  resubmit: "action.resubmitRequest",
};

export function mapActionModeToActionType(mode: TicketActionMode) {
  return ACTION_TYPE_BY_MODE[mode];
}

export function getTicketActionTypeLabelKey(actionType: TicketActionType) {
  return ACTION_LABEL_KEY_BY_TYPE[actionType];
}

export function getTicketActionModeLabelKey(mode: TicketActionMode) {
  return ACTION_LABEL_KEY_BY_MODE[mode];
}
