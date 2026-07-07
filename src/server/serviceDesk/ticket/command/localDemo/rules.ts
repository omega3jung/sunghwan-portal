import type { TicketStatus } from "@/domain/serviceDesk";

import type { TicketActionApiType, TicketActionExecutionMode } from "../types";

const ALL_LIVE_TICKET_STATUSES: readonly TicketStatus[] = [
  "Approval",
  "Declined",
  "Assigned",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
  "Reopened",
];

const MANAGER_ACTION_MODE_BY_PATH: Partial<
  Record<TicketActionApiType, TicketActionExecutionMode>
> = {
  assign: "assignManager",
  adjust: "adjustManager",
  merge: "mergeManager",
  reject: "rejectManager",
};

const EXECUTABLE_STATUSES_BY_MODE: Record<
  TicketActionExecutionMode,
  readonly TicketStatus[]
> = {
  comment: ALL_LIVE_TICKET_STATUSES,
  note: ALL_LIVE_TICKET_STATUSES,
  approve: ["Approval"],
  decline: ["Approval"],
  assign: ["Assigned", "Working", "Reopened"],
  assignManager: [
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Rejected",
    "Reopened",
  ],
  adjust: ["Assigned", "Working", "Pending", "Rejected", "Reopened"],
  adjustManager: [
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Reopened",
    "Closed",
  ],
  merge: ["Working", "Pending", "Resolved"],
  mergeManager: [
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  reject: ["Working", "Pending"],
  rejectManager: ["Assigned", "Working", "Pending"],
  reopen: ["Resolved"],
  resubmit: ["Rejected"],
  assignSelf: ["Assigned", "Working"],
};

export function resolveLocalDemoExecutionMode(
  action: TicketActionApiType,
  isAdmin?: boolean,
): TicketActionExecutionMode {
  if (!isAdmin) {
    return action;
  }

  return MANAGER_ACTION_MODE_BY_PATH[action] ?? action;
}

export function isLocalDemoExecutionAllowed(
  actionMode: TicketActionExecutionMode,
  status: TicketStatus,
): boolean {
  return EXECUTABLE_STATUSES_BY_MODE[actionMode].includes(status);
}

export function getLocalDemoNextStatus(
  actionMode: TicketActionExecutionMode,
  currentStatus: TicketStatus,
): TicketStatus | undefined {
  switch (actionMode) {
    case "decline":
      return currentStatus === "Approval" ? "Declined" : undefined;
    case "assign":
      return currentStatus === "Working" ? undefined : "Working";
    case "assignManager":
      if (currentStatus === "Declined" || currentStatus === "Rejected") {
        return "Reopened";
      }

      return currentStatus === "Working" ? undefined : "Working";
    case "reject":
    case "rejectManager":
      return currentStatus === "Rejected" ? undefined : "Rejected";
    case "merge":
    case "mergeManager":
      return currentStatus === "Closed" ? undefined : "Closed";
    case "reopen":
      return currentStatus === "Resolved" ? "Reopened" : undefined;
    case "resubmit":
      return currentStatus === "Rejected" ? "Assigned" : undefined;
    case "assignSelf":
      return currentStatus === "Working" ? undefined : "Working";
    default:
      return undefined;
  }
}
