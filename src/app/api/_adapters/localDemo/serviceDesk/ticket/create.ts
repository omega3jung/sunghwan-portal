import { ApiError } from "@/lib/application/api";
import type { TicketMutateRequestPayload } from "@/lib/application/contracts/serviceDesk";
import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

import { resolveCategorySnapshot } from "./category";
import { resolveCreateTicketRouting } from "./createRouting";
import { getLocalDemoTickets } from "./state";
import {
  createTicketId,
  createTicketNumber,
  resolveNextTicketSequence,
  resolveTicketYear,
} from "./ticketNumber";
import { resolvePriorityValue, resolveRiskLevelValue } from "./ticketValue";

export const localCreateTicket = async ({
  isInternal,
  requesterUsername,
  input,
}: {
  isInternal: boolean;
  requesterUsername: string | null;
  input: TicketMutateRequestPayload;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const resolvedRequesterId = normalizeRequesterId(requesterUsername);

  if (!resolvedRequesterId) {
    throw new ApiError(
      "serviceDesk.tickets.localDemo.requesterRequired",
      400,
    );
  }

  const category = resolveCategorySnapshot({
    isInternal,
    categoryId: String(input.categoryId),
  });

  const routing = await resolveCreateTicketRouting({
    isInternal,
    categoryId: category.id,
    parentCategoryId: category.parentId,
    requesterUsername: resolvedRequesterId,
  });

  const now = new Date().toISOString();
  const year = resolveTicketYear(targetMock, now);
  const nextSequence = resolveNextTicketSequence(targetMock, year);
  const nextTicket: DbTicketDetail = {
    id: createTicketId(year, nextSequence),
    ticket_number: createTicketNumber(year, nextSequence),
    created_at: now,
    updated_at: now,
    requester_username: resolvedRequesterId,
    status: routing.status,
    close_reason: null,
    priority: resolvePriorityValue(
      input.priority,
      category.defaultPriority ?? "medium",
    ),
    risk_level: resolveRiskLevelValue(
      input.riskLevel,
      category.defaultRiskLevel ?? "medium",
    ),
    assignee_usernames: routing.assigneeUsernames,
    merged_into_ticket_id: null,
    merged_into_ticket_no: null,
    work_minutes: 0,
    last_comment_at: null,
    last_commenter_email: null,
    last_user_activity_at: null,
    last_user_activity_email: null,
    due_at: input.dueAt,
    owner: false,
    assigned: false,
    active: true,
    scope: category.scope,
    category_id: category.id,
    category_name: category.name,
    approval_step_id: routing.approvalStepId,
    subject: input.subject,
    content: input.body,
    email: input.email,
    files: input.files,
    images: input.images,
  };

  targetMock.unshift(nextTicket);

  return camelTicketDetailMapper([nextTicket])[0];
};

function normalizeRequesterId(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}
