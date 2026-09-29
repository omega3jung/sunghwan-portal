import type { TicketActionType } from "@/domain/serviceDesk";

import type { TicketActionMode } from "./types";

const TOAST_KEY_BY_ACTION = {
  APPROVE: "actionTool.toast.approve",
  DECLINE: "actionTool.toast.decline",
  COMMENT: "actionTool.toast.comment",
  NOTE: "actionTool.toast.note",
  ASSIGN: "actionTool.toast.assign",
  ASSIGN_SELF: "actionTool.toast.assignSelf",
  REJECT: "actionTool.toast.reject",
  MERGE: "actionTool.toast.merge",
  ADJUST: "actionTool.toast.adjust",
  REOPEN: "actionTool.toast.reopen",
  RESUBMIT: "actionTool.toast.resubmit",
  CANCEL: "actionTool.toast.cancel",
} as const satisfies Record<TicketActionType, `actionTool.toast.${TicketActionMode}`>;

/** Localizes feedback for the submitted command, including automatic actions. */
export function getTicketActionToastMessages(
  actionType: TicketActionType,
  t: (key: string) => string,
) {
  const key = TOAST_KEY_BY_ACTION[actionType];
  return {
    loading: t(`${key}.loading`),
    success: t(`${key}.success`),
    error: t(`${key}.error`),
  };
}
