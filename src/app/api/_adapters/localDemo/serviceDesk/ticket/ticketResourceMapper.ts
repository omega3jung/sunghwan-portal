import {
  TicketDetail,
  TicketStatus,
  TicketSummary,
} from "@/domain/serviceDesk";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";
import {
  CreateTicketInput,
  DateInput,
  UpdateTicketInput,
} from "@/lib/application/contracts/serviceDesk";

export function toTicketMockSummaryResource(
  ticket: DbTicketDetail | TicketDetail,
): TicketSummary {
  const detail = toTicketMockDetailResource(ticket);

  return {
    id: detail.id,
    tenantId: detail.tenantId,
    ticketNumber: detail.ticketNumber,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    requesterUsername: detail.requesterUsername,
    status: detail.status,
    closeReason: detail.closeReason,
    priority: detail.priority,
    riskLevel: detail.riskLevel,
    assignmentPhase: detail.assignmentPhase,
    approvalAssigneeUsernames: detail.approvalAssigneeUsernames,
    workAssigneeUsernames: detail.workAssigneeUsernames,
    isCurrentApprover: detail.isCurrentApprover,
    isCurrentWorker: detail.isCurrentWorker,
    mergedIntoTicketId: detail.mergedIntoTicketId ?? null,
    mergedIntoTicketNo: detail.mergedIntoTicketNo ?? null,
    lastCommentAt: detail.lastCommentAt,
    lastCommenterEmail: detail.lastCommenterEmail,
    lastUserActivityAt: detail.lastUserActivityAt,
    lastUserActivityEmail: detail.lastUserActivityEmail,
    closedAt: detail.closedAt,
    workMinutes: detail.workMinutes,
    dueAt: detail.dueAt,
    owner: detail.owner,
    active: detail.active,
    scope: detail.scope,
    categoryId: detail.categoryId,
    categoryName: detail.categoryName,
    categoryParentId: detail.categoryParentId,
    approvalStepId: detail.approvalStepId,
    approvalStepName: detail.approvalStepId ?? undefined,
    subject: detail.subject,
    age: calculateTicketAge(detail.createdAt),
  };
}

export function toTicketMockDetailResource(
  ticket: DbTicketDetail | TicketDetail,
): TicketDetail {
  if (isDbTicketDetail(ticket)) {
    return camelTicketDetailMapper([ticket])[0];
  }

  return ticket;
}

export function toTicketMockDetail(
  input: CreateTicketInput | UpdateTicketInput,
  id = createMockId(),
): TicketDetail {
  const now = new Date().toISOString();
  const status: TicketStatus = "Assigned";

  return {
    id,
    tenantId: null,
    ticketNumber: `MOCK-${id}`,
    createdAt: now,
    updatedAt: now,
    requesterUsername: input.requester.id,
    status,
    closeReason: undefined,
    priority: normalizePriority(input.priority) ?? "medium",
    riskLevel: "medium",
    assignmentPhase: "WORK",
    approvalAssigneeUsernames: [],
    workAssigneeUsernames: [],
    isCurrentApprover: false,
    isCurrentWorker: false,
    hasBeenWorker: false,
    mergedIntoTicketId: null,
    mergedIntoTicketNo: null,
    workMinutes: 0,
    dueAt: toIsoString(input.dueAt),
    owner: true,
    active: true,
    scope: "PORTAL",
    categoryId: input.category ?? "",
    categoryName: { en: "" },
    approvalStepId: null,
    subject: input.subject,
    content: input.body,
    email: input.email,
    files: [],
    images: [],
  };
}

function calculateTicketAge(createdAt: DateInput) {
  const createdTime = new Date(createdAt).getTime();
  const diffInMs = Date.now() - createdTime;

  if (!Number.isFinite(diffInMs) || diffInMs <= 0) {
    return 0;
  }

  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

function isDbTicketDetail(
  ticket: DbTicketDetail | TicketDetail,
): ticket is DbTicketDetail {
  return "ticket_number" in ticket;
}

function normalizePriority(priority: string | null) {
  if (!priority) {
    return null;
  }

  const normalized = priority.toLowerCase();

  if (
    normalized === "urgent" ||
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low"
  ) {
    return normalized;
  }

  return null;
}

function toIsoString(value: DateInput) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function createMockId() {
  return Date.now().toString();
}
