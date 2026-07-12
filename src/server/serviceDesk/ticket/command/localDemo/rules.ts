import type { TicketStatus } from "@/domain/serviceDesk";

import type { TicketActionApiType, TicketActionExecutionMode } from "../types";

const ALL_NON_DRAFT_TICKET_STATUSES: readonly TicketStatus[] = [
  "Approval",
  "Declined",
  "Assigned",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
  "Closed",
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
  comment: ALL_NON_DRAFT_TICKET_STATUSES,
  note: ALL_NON_DRAFT_TICKET_STATUSES.filter((status) => status !== "Closed"),
  approve: ["Approval"],
  decline: ["Approval"],
  assign: ["Assigned", "Working", "Pending"],
  assignManager: ["Approval", "Assigned", "Working", "Pending"],
  adjust: ["Assigned", "Working", "Pending"],
  adjustManager: [
    "Approval",
    "Assigned",
    "Working",
    "Pending",
    "Resolved",
    "Closed",
  ],
  merge: ["Assigned", "Working", "Pending", "Resolved"],
  mergeManager: [
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  reject: ["Assigned", "Working", "Pending"],
  rejectManager: ["Assigned", "Working", "Pending"],
  reopen: ["Resolved"],
  resubmit: ["Declined", "Rejected"],
  assignSelf: ["Assigned", "Working", "Pending"],
  cancel: ["Approval", "Declined", "Assigned", "Working", "Pending", "Rejected"],
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
    case "assignManager":
      return currentStatus === "Pending" ? "Working" : undefined;
    case "reject":
    case "rejectManager":
      return currentStatus === "Rejected" ? undefined : "Rejected";
    case "merge":
    case "mergeManager":
      return currentStatus === "Closed" ? undefined : "Closed";
    case "reopen":
      return currentStatus === "Resolved" ? "Working" : undefined;
    case "cancel":
      return "Closed";
    default:
      return undefined;
  }
}
