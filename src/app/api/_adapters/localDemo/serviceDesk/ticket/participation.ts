import type { TicketParticipation } from "@/lib/application/contracts/serviceDesk/ticketParticipation";
import { canAccessTicketNote } from "@/lib/application/serviceDesk/ticketNoteAccess";
import { allCompaniesMock } from "@/mocks/domain/organization/companies";
import { resolveDemoAuth } from "@/mocks/domain/user";

import { getActiveLocalEmployeesByCompanyId, getServiceDeskCategoryContext } from "../eligibility";
import { getLocalDemoApprovalSteps } from "../settings/state";
import { canAccessLocalDemoTicket, type LocalTicketAccessContext } from "./access";
import { resolveApprovalStepAssignees, resolveAssignmentAssignees } from "./createRouting";
import { getLocalDemoHistories, getLocalDemoTickets } from "./state";

/** Same observable projection as the approved SQL; not a visibility predicate. */
export async function getLocalTicketParticipation(
  ticketId: string,
  effectiveUsername: string,
): Promise<TicketParticipation | null> {
  const ticket = getLocalDemoTickets().find((item) => item.id === ticketId && item.active);
  if (!ticket) return null;
  const username = effectiveUsername.trim();
  const result: TicketParticipation = {
    ticketRelation: null,
    isApprovalParticipant: false,
    isAssignmentParticipant: false,
    isAdmin: username !== "" && resolveDemoAuth(username)?.role === "ADMIN",
  };
  if (!username) return result;

  result.ticketRelation = ticket.requester_username === username ? "Requester"
    : ticket.assignee_usernames.includes(username) ? "CurrentAssignee"
    : hasAssigneeHistory(ticketId, username) ? "PreviousAssignee" : null;

  const category = await getServiceDeskCategoryContext(ticket.category_id);
  // Category.active is intentionally irrelevant to existing Ticket participation.
  if (!category?.tenant.operational) return result;

  const steps = getLocalDemoApprovalSteps(category.tenant.isOwnerTenant)
    .find((item) => String(item.category_id) === category.mainCategoryId)?.approval_step ?? [];
  const eligibleEmployees = getActiveLocalEmployeesByCompanyId(category.tenant.companyId);
  result.isApprovalParticipant = steps.some((approvalStep) =>
    resolveApprovalStepAssignees({ approvalStep, eligibleEmployees, requesterUsername: ticket.requester_username }).includes(username),
  );
  const activeOwners = allCompaniesMock.filter((item) => item.company_portal_owner && item.company_active);
  if (category.scope !== "PORTAL" || activeOwners.length === 1) {
    result.isAssignmentParticipant = (await resolveAssignmentAssignees(category)).includes(username);
  }
  return result;
}

/** Identity and Admin role come from the existing effective LOCAL auth context. */
export async function canAccessLocalTicketNote(ticketId: string, access: LocalTicketAccessContext) {
  const ticket = getLocalDemoTickets().find((item) => item.id === ticketId && item.active);
  if (!ticket || !canAccessLocalDemoTicket(ticket, access)) return false;
  return canAccessTicketNote({
    canReadTicket: true,
    participation: await getLocalTicketParticipation(ticketId, access.username),
  });
}

function hasAssigneeHistory(ticketId: string, username: string) {
  return getLocalDemoHistories().some((history) => {
    if (history.ticket_id !== ticketId) return false;
    const evidence: unknown[] = [];
    if (["ASSIGNMENT_RESOLVED", "ASSIGNMENT_UPDATED", "ROUTING_RESET"].includes(history.event)) {
      evidence.push(field(history.from_value, "assigneeUsernames"));
    }
    if (["APPROVAL_REQUESTED", "ASSIGNMENT_RESOLVED", "ASSIGNMENT_UPDATED", "ROUTING_RESET", "TICKET_SUBMITTED"].includes(history.event)) {
      evidence.push(field(history.to_value, "assigneeUsernames"));
    }
    if (["ASSIGNMENT_RESOLVED", "ASSIGNMENT_UPDATED", "ROUTING_RESET", "TICKET_REOPENED"].includes(history.event)) {
      evidence.push(field(history.metadata, "previousAssigneeUsernames"));
    }
    if (["APPROVAL_REQUESTED", "ASSIGNMENT_RESOLVED", "ASSIGNMENT_UPDATED", "ROUTING_RESET", "TICKET_REOPENED"].includes(history.event)) {
      evidence.push(field(history.metadata, "nextAssigneeUsernames"));
    }
    return evidence.some((value) => Array.isArray(value) && value.includes(username));
  });
}

function field(value: unknown, key: string): unknown {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)[key] : undefined;
}
