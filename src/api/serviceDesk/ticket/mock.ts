import {
  camelTicketDetailMapper,
  DbTicketDetail,
} from "@/api/serviceDesk/ticket/mapper";
import {
  TicketDetail,
  TicketStatus,
  TicketSummary,
} from "@/domain/serviceDesk";

import { CreateTicketInput, DateInput, UpdateTicketInput } from "./write";

export function toTicketMockSummaryResource(
  ticket: DbTicketDetail | TicketDetail,
): TicketSummary {
  const detail = toTicketMockDetailResource(ticket);

  return {
    id: detail.id,
    ticketNumber: detail.ticketNumber,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    requesterId: detail.requesterId,
    status: detail.status,
    closeReason: detail.closeReason,
    priority: detail.priority,
    riskLevel: detail.riskLevel,
    assigneeIds: detail.assigneeIds,
    mergedIntoTicketId: detail.mergedIntoTicketId ?? null,
    lastCommentAt: detail.lastCommentAt,
    lastCommenterEmail: detail.lastCommenterEmail,
    trackTimeMinutes: detail.trackTimeMinutes,
    dueAt: detail.dueAt,
    owner: detail.owner,
    assigned: detail.assigned,
    active: detail.active,
    scope: detail.scope,
    categoryName: detail.categoryId,
    approvalStepName: detail.approvalStepId,
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
  const status: TicketStatus = "Open";

  return {
    id,
    ticketNumber: `MOCK-${id}`,
    createdAt: now,
    updatedAt: now,
    requesterId: input.requester.id,
    status,
    closeReason: undefined,
    priority: normalizePriority(input.priority) ?? "medium",
    riskLevel: "medium",
    assigneeIds: [],
    mergedIntoTicketId: null,
    trackTimeMinutes: 0,
    dueAt: toIsoString(input.dueDate),
    owner: true,
    assigned: false,
    active: true,
    scope: "PORTAL",
    categoryId: input.category ?? "",
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
