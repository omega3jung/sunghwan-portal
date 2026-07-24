import type { Attach, TicketAttachmentMetadata } from "@/domain/serviceDesk";
import type { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";
import { allDepartmentsMock } from "@/mocks/domain/organization/departments";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";
import {
  clientCategorySettingsMock,
  internalCategorySettingsMock,
} from "@/mocks/domain/serviceDesk/categories";

import { serviceDeskScenariosMock } from "./scenariosMock";
import type { TicketMockInput } from "./types";

const categoryTenantIds = buildCategoryTenantIds();
const tenantNamesById = new Map(
  [...internalCategorySettingsMock, ...clientCategorySettingsMock].map(
    (tenant) => [String(tenant.tenant_id), tenant.tenant_name],
  ),
);
const employeesByUsername = new Map(
  allEmployeesMock.map((employee) => [employee.e_username, employee]),
);
const departmentsById = new Map(
  allDepartmentsMock.map((department) => [department.d_id, department]),
);

const toDbTicketDetail = (ticket: TicketMockInput): DbTicketDetail => {
  const tenantId = resolveTicketTenantId(ticket.cat_id);
  const assignees = ticket.tk_assignee_usernames.flatMap((username) => {
    const employee = employeesByUsername.get(username);
    return employee
      ? [
          {
            username,
            name: employee.e_name,
            image: employee.e_image_url ?? null,
          },
        ]
      : [];
  });
  const isApprovalPhase = ticket.tk_approval_step_id !== null;
  const requester = employeesByUsername.get(ticket.tk_requester_username);
  const requesterDepartment = requester
    ? departmentsById.get(requester.e_department_id)
    : undefined;

  return {
  id: ticket.tk_id,
  tenant_id: tenantId,
  tenant_name: tenantNamesById.get(tenantId) ?? null,
  ticket_number: ticket.tk_ticket_no,
  created_at: ticket.tk_created_at,
  updated_at: ticket.tk_updated_at,
  requester_username: ticket.tk_requester_username,
  requester: ticket.tk_requester,
  requester_department_id: requester
    ? String(requester.e_department_id)
    : null,
  requester_department_name: requesterDepartment?.d_name ?? null,
  status: ticket.tk_status,
  close_reason: ticket.tk_close_reason,
  priority: ticket.tk_priority,
  risk_level: ticket.tk_risk_level,
  assignment_phase: isApprovalPhase ? "APPROVAL" : "WORK",
  approval_assignees: isApprovalPhase ? assignees : [],
  work_assignees: isApprovalPhase ? [] : assignees,
  approval_assignee_usernames: isApprovalPhase
    ? ticket.tk_assignee_usernames
    : [],
  work_assignee_usernames: isApprovalPhase
    ? []
    : ticket.tk_assignee_usernames,
  assignees,
  assignee_usernames: ticket.tk_assignee_usernames,
  merged_into_ticket_id: ticket.tk_merged_into_ticket_id,
  merged_into_ticket_no: ticket.tk_merged_into_ticket_no,
  last_comment_at: ticket.tka_last_comment_at,
  last_commenter_email: ticket.tka_last_comment_email,
  last_user_activity_at: ticket.tka_last_user_activity_at,
  last_user_activity_email: ticket.tka_last_user_activity_email,
  work_minutes: ticket.tk_work_minutes,
  due_at: ticket.tk_due_at,
  owner: false,
  assigned: false,
  active: ticket.tk_active,
  scope: ticket.cat_scope,
  category_id: ticket.cat_id,
  category_name: ticket.cat_name,
  approval_step_id: ticket.tk_approval_step_id,
  subject: ticket.tk_subject,
  content: ticket.tk_content,
  email: ticket.tk_email,
  files: ticket.tk_files.map(toTicketAttachmentMetadata),
  images: ticket.tk_images.map(toTicketAttachmentMetadata),
  };
};

/** Canonical ticket seed. Visibility is projected from tenant and scope at read time. */
export const ticketsMock: DbTicketDetail[] = serviceDeskScenariosMock.map(
  (scenario) => toDbTicketDetail(scenario.ticket),
);

/** @deprecated Use ticketsMock. */
export const internalTicketsMock = ticketsMock;

function buildCategoryTenantIds() {
  const tenantIdsByCategory = new Map<string, Set<string>>();

  for (const tenant of [
    ...internalCategorySettingsMock,
    ...clientCategorySettingsMock,
  ]) {
    for (const category of tenant.category) {
      registerCategory(category.category_id, tenant.tenant_id);

      for (const subCategory of category.sub_category) {
        registerCategory(subCategory.category_id, tenant.tenant_id);
      }
    }
  }

  return tenantIdsByCategory;

  function registerCategory(
    categoryId: string | number,
    tenantId: string | number,
  ) {
    const key = String(categoryId);
    const tenantIds = tenantIdsByCategory.get(key) ?? new Set<string>();
    tenantIds.add(String(tenantId));
    tenantIdsByCategory.set(key, tenantIds);
  }
}

function resolveTicketTenantId(categoryId: string): string {
  const tenantIds = categoryTenantIds.get(categoryId);

  if (!tenantIds || tenantIds.size !== 1) {
    throw new Error(
      `[ServiceDeskMock] Category ${categoryId} must resolve to exactly one tenant.`,
    );
  }

  return [...tenantIds][0];
}

function toTicketAttachmentMetadata(
  attachment: Attach,
): TicketAttachmentMetadata {
  const demoUrl = normalizeDemoUrl(attachment);

  return {
    originalName: attachment.name,
    replacedName: demoUrl.split("/").pop() ?? "demo-file",
    extension: demoUrl.split(".").pop() ?? "txt",
    size: 0,
    type:
      attachment.type === "image" ? "image/png" : "application/octet-stream",
    demoUrl,
    replaced: true,
    reason: "SECURITY_DEMO_REPLACEMENT",
  };
}

function normalizeDemoUrl(attachment: Attach) {
  if (/^\/files\/demo-[a-z0-9-]+\.[a-z0-9]+$/i.test(attachment.url)) {
    return attachment.url;
  }

  return attachment.type === "image"
    ? "/files/demo-png.png"
    : "/files/demo-txt.txt";
}
