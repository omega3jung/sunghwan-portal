import { ApiError } from "@/lib/application/api";
import type { TicketMutateRequestPayload } from "@/lib/application/contracts/serviceDesk";
import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { allDepartmentsMock } from "@/mocks/domain/organization/departments";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";

import {
  type LocalTicketAccessContext,
  requireLocalDemoCategoryAccess,
} from "./access";
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

  targetMock.unshift(nextTicket);

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
