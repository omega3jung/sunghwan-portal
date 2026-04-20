import type { TicketActionType } from "@/domain/serviceDesk";

import type { TicketActionFormMode } from "./types";

export const ACTION_TYPE_BY_MODE: Record<
  TicketActionFormMode,
  TicketActionType
> = {
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  assignManager: "ASSIGN",
  reject: "REJECT",
  rejectManager: "REJECT",
  merge: "MERGE",
  mergeManager: "MERGE",
  adjust: "ADJUST",
  adjustManager: "ADJUST",
  reportResolved: "REPORT_RESOLVED",
  reviewRejected: "REVIEW_REJECTED",
  assignMyself: "ASSIGN_MYSELF",
};

export function mapActionModeToActionType(mode: TicketActionFormMode) {
  return ACTION_TYPE_BY_MODE[mode];
}
