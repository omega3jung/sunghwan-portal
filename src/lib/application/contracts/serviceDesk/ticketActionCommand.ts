import type {
  TicketActionType,
  TicketStatus,
} from "@/domain/serviceDesk";

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

export type TicketActionPath =
  (typeof TICKET_ACTION_TYPE_TO_PATH)[TicketActionType];

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

export const TICKET_ACTION_PATHS = Object.values(
  TICKET_ACTION_TYPE_TO_PATH,
) as TicketActionPath[];

const TICKET_ACTION_PATH_SET = new Set<TicketActionPath>(TICKET_ACTION_PATHS);

export type TicketApprovalActionPath = Extract<
  TicketActionPath,
  "approve" | "decline"
>;

export type TicketGeneralActionPath = Exclude<
  TicketActionPath,
  TicketApprovalActionPath
>;

export function isTicketActionPath(action: string): action is TicketActionPath {
  return TICKET_ACTION_PATH_SET.has(action as TicketActionPath);
}

export function isTicketApprovalActionPath(
  action: string,
): action is TicketApprovalActionPath {
  return action === "approve" || action === "decline";
}

export function isTicketGeneralActionPath(
  action: string,
): action is TicketGeneralActionPath {
  return isTicketActionPath(action) && !isTicketApprovalActionPath(action);
}

export type TicketActionCommandAttachment = {
  id: string;
  name: string;
  size: number;
  url?: string;
};

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

export type TicketActionCommandPayload = TicketActionCommandRequest & {
  id: string;
  actionType: TicketActionType;
  files: TicketActionCommandAttachment[];
  images: TicketActionCommandAttachment[];
};

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

export function resolveTicketActionExecutionMode(
  action: TicketActionPath,
  isAdmin = false,
): TicketActionExecutionMode {
  if (!isAdmin || isTicketApprovalActionPath(action)) {
    return action;
  }

  return ADMIN_OVERRIDE_ACTION_MODE_BY_PATH[action] ?? action;
}

export function isTicketActionExecutionAllowed(
  actionMode: TicketActionExecutionMode,
  status: TicketStatus,
): boolean {
  return EXECUTABLE_STATUSES_BY_MODE[actionMode].includes(status);
}

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
