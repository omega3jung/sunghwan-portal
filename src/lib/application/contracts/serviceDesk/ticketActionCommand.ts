import type {
  TicketActionType,
  TicketStatus,
} from "@/domain/serviceDesk";

/** Defines the ticket action type to path policy value used by the Service Desk application boundary. */
export const TICKET_ACTION_TYPE_TO_PATH = {
  APPROVE: "approve",
  DECLINE: "decline",
  COMMENT: "comment",
  NOTE: "note",
  ASSIGN: "assign",
  ASSIGN_SELF: "assignSelf",
  REJECT: "reject",
  MERGE: "merge",
  ADJUST: "adjust",
  REOPEN: "reopen",
  RESUBMIT: "resubmit",
  CANCEL: "cancel",
} as const satisfies Record<TicketActionType, string>;

/** Represents ticket action path within the Service Desk application boundary. */
export type TicketActionPath =
  (typeof TICKET_ACTION_TYPE_TO_PATH)[TicketActionType];

/** Defines the ticket action path to type policy value used by the Service Desk application boundary. */
export const TICKET_ACTION_PATH_TO_TYPE = {
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
} as const satisfies Record<TicketActionPath, TicketActionType>;

/** Defines the ticket action paths policy value used by the Service Desk application boundary. */
export const TICKET_ACTION_PATHS = Object.values(
  TICKET_ACTION_TYPE_TO_PATH,
) as TicketActionPath[];

const TICKET_ACTION_PATH_SET = new Set<TicketActionPath>(TICKET_ACTION_PATHS);

/** Represents ticket approval action path within the Service Desk application boundary. */
export type TicketApprovalActionPath = Extract<
  TicketActionPath,
  "approve" | "decline"
>;

/** Represents ticket general action path within the Service Desk application boundary. */
export type TicketGeneralActionPath = Exclude<
  TicketActionPath,
  TicketApprovalActionPath
>;

/** Returns whether ticket action path applies in the Service Desk application boundary. */
export function isTicketActionPath(action: string): action is TicketActionPath {
  return TICKET_ACTION_PATH_SET.has(action as TicketActionPath);
}

/** Returns whether ticket approval action path applies in the Service Desk application boundary. */
export function isTicketApprovalActionPath(
  action: string,
): action is TicketApprovalActionPath {
  return action === "approve" || action === "decline";
}

/** Returns whether ticket general action path applies in the Service Desk application boundary. */
export function isTicketGeneralActionPath(
  action: string,
): action is TicketGeneralActionPath {
  return isTicketActionPath(action) && !isTicketApprovalActionPath(action);
}

/** Represents ticket action command attachment within the Service Desk application boundary. */
export type TicketActionCommandAttachment = {
  id: string;
  name: string;
  size: number;
  url?: string;
};

/** Request contract for ticket action command operations at the Service Desk application boundary. */
export type TicketActionCommandRequest = {
  id?: string;
  actionType?: TicketActionType;
  content: string;
  files?: TicketActionCommandAttachment[];
  images?: TicketActionCommandAttachment[];
  assigneeUsernames?: string[];
  categoryId?: string;
  targetTicketId?: string;
  priority?: string;
  riskLevel?: string;
  dueAt?: string;
};

/** Represents ticket action command payload within the Service Desk application boundary. */
export type TicketActionCommandPayload = TicketActionCommandRequest & {
  id: string;
  actionType: TicketActionType;
  files: TicketActionCommandAttachment[];
  images: TicketActionCommandAttachment[];
};

/** Request contract for ticket approval action command operations at the Service Desk application boundary. */
export type TicketApprovalActionCommandRequest = Pick<
  TicketActionCommandRequest,
  "content"
> &
  Partial<
    Pick<
      TicketActionCommandRequest,
      "actionType" | "files" | "images"
    >
  >;

/** Represents ticket action execution mode within the Service Desk application boundary. */
export type TicketActionExecutionMode =
  | TicketActionPath
  | "assignAdminOverride"
  | "adjustAdminOverride"
  | "mergeAdminOverride"
  | "rejectAdminOverride";

const COMMENTABLE_TICKET_STATUSES: readonly TicketStatus[] = [
  "Approval",
  "Declined",
  "Assigned",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
];

const ADMIN_OVERRIDE_ACTION_MODE_BY_PATH: Partial<
  Record<TicketGeneralActionPath, TicketActionExecutionMode>
> = {
  assign: "assignAdminOverride",
  adjust: "adjustAdminOverride",
  merge: "mergeAdminOverride",
  reject: "rejectAdminOverride",
};

const EXECUTABLE_STATUSES_BY_MODE: Record<
  TicketActionExecutionMode,
  readonly TicketStatus[]
> = {
  approve: ["Approval"],
  decline: ["Approval"],
  comment: COMMENTABLE_TICKET_STATUSES,
  note: COMMENTABLE_TICKET_STATUSES,
  assign: ["Assigned", "Working", "Pending"],
  assignAdminOverride: ["Approval", "Assigned", "Working", "Pending"],
  assignSelf: ["Assigned", "Working", "Pending"],
  adjust: ["Assigned", "Working", "Pending"],
  adjustAdminOverride: [
    "Approval",
    "Assigned",
    "Working",
    "Pending",
    "Resolved",
    "Closed",
  ],
  reject: ["Assigned", "Working", "Pending"],
  rejectAdminOverride: ["Assigned", "Working", "Pending"],
  merge: ["Assigned", "Working", "Pending", "Resolved"],
  mergeAdminOverride: [
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  reopen: ["Resolved"],
  resubmit: ["Declined", "Rejected"],
  cancel: ["Approval", "Declined", "Assigned", "Working", "Pending", "Rejected"],
};

/** Resolves ticket action execution mode according to the Service Desk application boundary policy. */
export function resolveTicketActionExecutionMode(
  action: TicketActionPath,
  isAdmin = false,
): TicketActionExecutionMode {
  if (!isAdmin || isTicketApprovalActionPath(action)) {
    return action;
  }

  return ADMIN_OVERRIDE_ACTION_MODE_BY_PATH[action] ?? action;
}

/** Returns whether ticket action execution allowed applies in the Service Desk application boundary. */
export function isTicketActionExecutionAllowed(
  actionMode: TicketActionExecutionMode,
  status: TicketStatus,
): boolean {
  return EXECUTABLE_STATUSES_BY_MODE[actionMode].includes(status);
}

/** Resolves ticket action next status according to the Service Desk application boundary policy. */
export function resolveTicketActionNextStatus(
  actionMode: TicketActionExecutionMode,
  currentStatus: TicketStatus,
): TicketStatus | undefined {
  switch (actionMode) {
    case "decline":
      return currentStatus === "Approval" ? "Declined" : undefined;
    case "assign":
    case "assignAdminOverride":
      return currentStatus === "Pending" ? "Working" : undefined;
    case "reject":
    case "rejectAdminOverride":
      return currentStatus === "Rejected" ? undefined : "Rejected";
    case "merge":
    case "mergeAdminOverride":
      return currentStatus === "Closed" ? undefined : "Closed";
    case "reopen":
      return currentStatus === "Resolved" ? "Working" : undefined;
    case "cancel":
      return "Closed";
    default:
      return undefined;
  }
}
