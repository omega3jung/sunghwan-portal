import { TicketDetail, TicketSummary } from "@/domain/serviceDesk";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";
import { DateInput } from "@/lib/application/contracts/serviceDesk";

/**
 * Projects a LOCAL persistence-shaped ticket through the same application DTO
 * mapper used by API payloads, then narrows it to list fields. This keeps UI
 * contracts independent of whether the source is fixture state or REMOTE rows.
 */
export function toTicketMockSummaryResource(
  ticket: DbTicketDetail | TicketDetail,
): TicketSummary {
  const detail = toTicketMockDetailResource(ticket);

  return {
    id: detail.id,
    tenantId: detail.tenantId,
    tenantName: detail.tenantName,
    ticketNumber: detail.ticketNumber,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    requesterUsername: detail.requesterUsername,
    requester: detail.requester,
    requesterDepartmentId: detail.requesterDepartmentId,
    requesterDepartmentName: detail.requesterDepartmentName,
    status: detail.status,
    closeReason: detail.closeReason,
    priority: detail.priority,
    riskLevel: detail.riskLevel,
    assignmentPhase: detail.assignmentPhase,
    approvalAssignees: detail.approvalAssignees,
    workAssignees: detail.workAssignees,
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

/** Projects ticket mock detail resource for the server-side LOCAL ticket adapter. */
export function toTicketMockDetailResource(
  ticket: DbTicketDetail | TicketDetail,
): TicketDetail {
  // LOCAL handlers may already hold an application DTO; avoid remapping it.
  if (isDbTicketDetail(ticket)) {
    return camelTicketDetailMapper([ticket])[0];
  }

  return ticket;
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
