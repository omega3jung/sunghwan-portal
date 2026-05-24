import type { TicketStatus } from "@/domain/serviceDesk";

import type { TicketActionApiType, TicketActionExecutionMode } from "../types";

const ALL_LIVE_TICKET_STATUSES: readonly TicketStatus[] = [
  "Open",
  "Approved",
  "Declined",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
  "Reopen",
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
  assign: ["Open", "Approved", "Working", "Reopen"],
  assignManager: [
    "Open",
    "Approved",
    "Declined",
    "Working",
    "Rejected",
    "Reopen",
  ],
  adjust: ["Open", "Approved", "Working", "Pending", "Rejected", "Reopen"],
  adjustManager: [
    "Open",
    "Approved",
    "Declined",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Reopen",
    "Closed",
  ],
  merge: ["Working", "Pending", "Resolved"],
  mergeManager: [
    "Open",
    "Approved",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  reject: ["Working", "Pending"],
  rejectManager: ["Open", "Approved", "Working", "Pending"],
  reopen: ["Resolved"],
  resubmit: ["Rejected"],
  assignSelf: ["Open", "Approved", "Working"],
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
    case "assign":
      return currentStatus === "Working" ? undefined : "Working";
    case "assignManager":
      if (currentStatus === "Declined" || currentStatus === "Rejected") {
        return "Reopen";
      }

      return currentStatus === "Working" ? undefined : "Working";
    case "reject":
    case "rejectManager":
      return currentStatus === "Rejected" ? undefined : "Rejected";
    case "merge":
    case "mergeManager":
      return currentStatus === "Closed" ? undefined : "Closed";
    case "reopen":
      return currentStatus === "Resolved" ? "Reopen" : undefined;
    case "resubmit":
      return currentStatus === "Rejected" ? "Open" : undefined;
    case "assignSelf":
      return currentStatus === "Working" ? undefined : "Working";
    default:
      return undefined;
  }
}
