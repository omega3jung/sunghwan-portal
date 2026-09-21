import { ApiError } from "@/lib/application/api";
import type { TicketMutateRequestPayload } from "@/lib/application/contracts/serviceDesk";
import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";
import { DbTicketDetail, DbTicketHistory } from "@/lib/application/contracts/serviceDesk";
import { assertTicketDueAtMeetsSla } from "@/lib/application/serviceDesk/ticketSlaPolicy";
import { allDepartmentsMock } from "@/mocks/domain/organization/departments";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";

import {
  type LocalTicketAccessContext,
  requireLocalDemoCategoryAccess,
} from "./access";
import { resolveCategorySnapshot } from "./category";
import { normalizeApprovalStepId } from "./command/history";
import { resolveCreateTicketRouting } from "./createRouting";
import { getLocalDemoHistories, getLocalDemoTickets } from "./state";
import {
  createTicketId,
  createTicketNumber,
  resolveNextTicketSequence,
  resolveTicketYear,
} from "./ticketNumber";
import { resolvePriorityValue, resolveRiskLevelValue } from "./ticketValue";

/** Creates ticket in the server-side LOCAL ticket adapter mutable state. */
export const localCreateTicket = async ({
  isInternal,
  access,
  requesterUsername,
  input,
}: {
  isInternal: boolean;
  access: LocalTicketAccessContext;
  requesterUsername: string | null;
  input: TicketMutateRequestPayload;
}) => {
  const targetMock = getLocalDemoTickets();
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
  requireLocalDemoCategoryAccess(category, access);
  assertTicketDueAtMeetsSla(input.dueAt, category.defaultSlaDays);

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
    tenant_id: category.tenantId,
    tenant_name: category.tenantName,
    ticket_number: createTicketNumber(year, nextSequence),
    created_at: now,
    updated_at: now,
    requester_username: resolvedRequesterId,
    requester: resolveRequester(resolvedRequesterId),
    ...resolveRequesterDepartment(resolvedRequesterId),
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

  const historyBase = {
    ticket_id: nextTicket.id,
    actor_username: resolvedRequesterId,
    actor_name: nextTicket.requester.name,
    action_no: null,
    created_at: now,
  };
  const histories: DbTicketHistory[] = [
    {
      ...historyBase,
      history_no: 1,
      type: "TICKET",
      source: "USER_ACTION",
      event: "TICKET_SUBMITTED",
      from_value: null,
      to_value: {
        ticketNumber: nextTicket.ticket_number,
        categoryId: Number(category.id),
        status: routing.status,
      },
      metadata: null,
    },
    routing.approvalStepId !== null
      ? {
          ...historyBase,
          history_no: 2,
          type: "APPROVAL",
          source: "APPROVAL_RULE",
          event: "APPROVAL_REQUESTED",
          from_value: null,
          to_value: {
            approvalStepId: normalizeApprovalStepId(routing.approvalStepId),
            assigneeUsernames: routing.assigneeUsernames,
          },
          metadata: {
            nextApprovalStepId: normalizeApprovalStepId(routing.approvalStepId),
            nextAssigneeUsernames: routing.assigneeUsernames,
          },
        }
      : {
          ...historyBase,
          history_no: 2,
          type: "ASSIGNMENT",
          source: "ASSIGNMENT_RULE",
          event: "ASSIGNMENT_RESOLVED",
          from_value: { assigneeUsernames: [] },
          to_value: { assigneeUsernames: routing.assigneeUsernames },
          metadata: {
            previousAssigneeUsernames: [],
            nextAssigneeUsernames: routing.assigneeUsernames,
          },
        },
  ];

  targetMock.unshift(nextTicket);
  getLocalDemoHistories().push(...histories);

  return camelTicketDetailMapper([nextTicket])[0];
};

function resolveRequester(username: string) {
  const employee = allEmployeesMock.find(
    (candidate) => candidate.e_username === username,
  );

  return {
    username,
    name:
      employee?.e_name ?? {
      en: { first: username, middle: "", last: "" },
      },
    email: employee?.e_email ?? null,
    image: employee?.e_image_url ?? null,
  };
}

function resolveRequesterDepartment(username: string) {
  const employee = allEmployeesMock.find(
    (candidate) => candidate.e_username === username,
  );
  const department = employee
    ? allDepartmentsMock.find(
        (candidate) => candidate.d_id === employee.e_department_id,
      )
    : undefined;

  return {
    requester_department_id: employee
      ? String(employee.e_department_id)
      : null,
    requester_department_name: department?.d_name ?? null,
  };
}

function normalizeRequesterId(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}
