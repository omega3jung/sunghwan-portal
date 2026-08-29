import { describe, expect, it } from "vitest";

import type { TicketUser } from "@/domain/serviceDesk";

import type { DbTicketSummary } from "./ticket";
import {
  camelTicketSummaryMapper,
  snakeTicketSummaryMapper,
} from "./ticketMapper";

const approver: TicketUser = {
  username: "approver",
  name: { en: { first: "Approver", last: "User" } },
  image: null,
};

const worker: TicketUser = {
  username: "worker",
  name: { en: { first: "Worker", last: "User" } },
  image: null,
};

function createDbTicketSummary(
  patch: Partial<DbTicketSummary> = {},
): DbTicketSummary {
  return {
    id: "ticket-1",
    tenant_id: "tenant-1",
    tenant_name: { en: "Tenant" },
    ticket_number: "T-1",
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: null,
    requester_username: "requester",
    requester: {
      username: "requester",
      name: { en: { first: "Request", last: "User" } },
      email: "requester@example.com",
      image: null,
    },
    requester_department_id: null,
    requester_department_name: null,
    status: "Approval",
    close_reason: null,
    priority: "medium",
    risk_level: "medium",
    assignee_usernames: [],
    assignees: [],
    merged_into_ticket_id: null,
    merged_into_ticket_no: null,
    last_comment_at: null,
    last_commenter_email: null,
    last_user_activity_at: null,
    last_user_activity_email: null,
    closed_at: null,
    work_minutes: 0,
    due_at: "2026-08-10T00:00:00.000Z",
    owner: false,
    assigned: false,
    active: true,
    scope: "PORTAL",
    category_id: "category-1",
    category_name: { en: "Category" },
    category_parent_id: null,
    approval_step_id: "step-1",
    approval_step_name: "Approval",
    subject: "Printer issue",
    age: 1,
    ...patch,
  };
}

describe("ticket assignment DTO mapping", () => {
  it("projects legacy shared assignees into the approval phase", () => {
    const [ticket] = camelTicketSummaryMapper([
      createDbTicketSummary({
        assignment_phase: undefined,
        approval_step_id: "step-1",
        assignee_usernames: [" approver ", "", "approver-2"],
        assignees: [approver],
        assigned: true,
      }),
    ]);

    expect(ticket).toMatchObject({
      assignmentPhase: "APPROVAL",
      approvalAssigneeUsernames: ["approver", "approver-2"],
      workAssigneeUsernames: [],
      approvalAssignees: [approver],
      workAssignees: [],
      isCurrentApprover: true,
      isCurrentWorker: false,
    });
  });

  it("projects legacy shared assignees into work when no approval step exists", () => {
    const [ticket] = camelTicketSummaryMapper([
      createDbTicketSummary({
        status: "Working",
        approval_step_id: null,
        assignee_usernames: ["worker"],
        assignees: [worker],
        assigned: true,
      }),
    ]);

    expect(ticket).toMatchObject({
      assignmentPhase: "WORK",
      approvalAssigneeUsernames: [],
      workAssigneeUsernames: ["worker"],
      approvalAssignees: [],
      workAssignees: [worker],
      isCurrentApprover: false,
      isCurrentWorker: true,
    });
  });

  it("prefers explicit phase-specific projections and serializes only current assignees", () => {
    const [ticket] = camelTicketSummaryMapper([
      createDbTicketSummary({
        assignment_phase: "WORK",
        approval_step_id: "legacy-step",
        approval_assignee_usernames: ["approver"],
        work_assignee_usernames: ["worker"],
        approval_assignees: [approver],
        work_assignees: [worker],
        assigned_approver: false,
        assigned_worker: true,
        assignee_usernames: ["stale-legacy-user"],
        assignees: [approver],
      }),
    ]);

    expect(ticket).toMatchObject({
      assignmentPhase: "WORK",
      approvalAssigneeUsernames: ["approver"],
      workAssigneeUsernames: ["worker"],
      isCurrentApprover: false,
      isCurrentWorker: true,
    });

    const [serialized] = snakeTicketSummaryMapper([ticket]);
    expect(serialized).toMatchObject({
      assignment_phase: "WORK",
      assignee_usernames: ["worker"],
      assignees: [worker],
      assigned: true,
    });
  });
});
