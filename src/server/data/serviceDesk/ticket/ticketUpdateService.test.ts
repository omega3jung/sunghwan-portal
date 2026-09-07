import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceDeskTicketViewRow } from "./ticketRow";

const transaction = vi.hoisted(() => {
  const query = vi.fn();
  return {
    query,
    withPortalApiTransaction: vi.fn(
      async (work: (query: ReturnType<typeof vi.fn>) => Promise<unknown>) =>
        work(query),
    ),
  };
});
const tickets = vi.hoisted(() => ({
  findApprovalStepAssigneeUsernames: vi.fn(),
  findCategoryAssignmentUsernames: vi.fn(),
  findNextApprovalStepId: vi.fn(),
  hasTicketWorkAssignmentHistory: vi.fn(),
}));
const updates = vi.hoisted(() => ({
  findActiveRequesterUpdateCategorySnapshotById: vi.fn(),
  findRequesterUpdateTicketViewRowById: vi.fn(),
  updateRequesterTicketRowById: vi.fn(),
}));
const history = vi.hoisted(() => ({ createTicketHistory: vi.fn() }));

vi.mock("@/server/shared/supabase/portalApiClient", () => transaction);
vi.mock("./ticketRepository", () => tickets);
vi.mock("./ticketUpdateRepository", () => updates);
vi.mock("../ticketHistory", () => history);

import { updateRequesterTicket } from "./ticketUpdateService";

function ticketRow(
  overrides: Partial<ServiceDeskTicketViewRow> = {},
): ServiceDeskTicketViewRow {
  return {
    tk_id: "ticket-1",
    tk_tenant_id: 20,
    tn_name: { en: "Customer" },
    tk_ticket_no: "T-2026-0001",
    tk_created_at: "2026-01-01T00:00:00.000Z",
    tk_updated_at: null,
    tk_requester_username: "requester",
    tk_requester: {
      username: "requester",
      name: { en: { first: "Request", last: "User" } },
      email: "requester@example.com",
      image: null,
    },
    tk_requester_department_id: 3,
    tk_requester_department_name: { en: "Operations" },
    tk_status: "Approval",
    tk_priority: "medium",
    tk_risk_level: "medium",
    tk_assignee_usernames: ["approver"],
    tk_assignees: [],
    tk_work_minutes: 0,
    tka_last_comment_at: null,
    tka_last_comment_email: null,
    tka_last_user_activity_at: null,
    tka_last_user_activity_email: null,
    tk_close_reason: null,
    tk_merged_into_ticket_id: null,
    tk_merged_into_ticket_no: null,
    tkh_closed_at: null,
    tk_due_at: "2026-09-10T00:00:00.000Z",
    cat_scope: "PORTAL",
    cat_id: 10,
    cat_name: { en: "Printer" },
    cat_parent_id: null,
    tk_approval_step_id: 7,
    tk_subject: "Printer unavailable",
    tk_content: "The printer is offline.",
    tk_email: { to: [], cc: [], bcc: [] },
    tk_files: [],
    tk_images: [],
    ...overrides,
  };
}

const category = {
  cat_id: 10,
  cat_tenant_id: 20,
  cat_scope: "PORTAL" as const,
  tenant_company_id: 22,
  cat_parent_id: null,
  cat_default_priority: "high" as const,
  cat_default_risk_level: "low" as const,
  cat_default_sla_days: 1,
};
const baseInput = {
  categoryId: "10",
  subject: "Printer unavailable",
  content: "The printer is offline.",
  dueAt: "2026-09-10T00:00:00.000Z",
  email: { to: [], cc: [], bcc: [] },
  files: [],
  images: [],
};

describe("requester ticket update routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const current = ticketRow();
    updates.findRequesterUpdateTicketViewRowById.mockResolvedValue(current);
    updates.findActiveRequesterUpdateCategorySnapshotById.mockResolvedValue(
      category,
    );
    updates.updateRequesterTicketRowById.mockResolvedValue(current);
    tickets.hasTicketWorkAssignmentHistory.mockResolvedValue(false);
  });

  it("preserves approval routing for due-date and email-only changes", async () => {
    await updateRequesterTicket(
      "ticket-1",
      {
        ...baseInput,
        dueAt: "2026-09-11T00:00:00.000Z",
        email: { to: ["notify@example.com"], cc: [], bcc: [] },
      },
      "requester",
      { companyId: 22, userScope: "CLIENT" },
    );

    expect(tickets.findNextApprovalStepId).not.toHaveBeenCalled();
    expect(tickets.findCategoryAssignmentUsernames).not.toHaveBeenCalled();
    expect(updates.updateRequesterTicketRowById).toHaveBeenCalledWith(
      "ticket-1",
      expect.objectContaining({
        tk_status: "Approval",
        tk_approval_step_id: 7,
        tk_assignee_usernames: ["approver"],
      }),
      { query: transaction.query },
    );
    expect(history.createTicketHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "ROUTING_PRESERVED",
        metadata: expect.objectContaining({
          changedFields: ["dueAt", "email"],
          routingSensitiveChanged: false,
          preservedRouting: true,
        }),
      }),
      { query: transaction.query },
    );
  });

  it("recalculates assignment and audit metadata after a routing-sensitive edit", async () => {
    const updated = ticketRow({
      tk_subject: "Printer and scanner unavailable",
      tk_status: "Assigned",
      tk_approval_step_id: null,
      tk_assignee_usernames: ["worker"],
    });
    tickets.findNextApprovalStepId.mockResolvedValue(null);
    tickets.findCategoryAssignmentUsernames.mockResolvedValue(["worker"]);
    updates.updateRequesterTicketRowById.mockResolvedValue(updated);

    await updateRequesterTicket(
      "ticket-1",
      {
        ...baseInput,
        subject: "Printer and scanner unavailable",
      },
      "requester",
      { companyId: 22, userScope: "CLIENT" },
    );

    expect(updates.updateRequesterTicketRowById).toHaveBeenCalledWith(
      "ticket-1",
      expect.objectContaining({
        tk_status: "Assigned",
        tk_approval_step_id: null,
        tk_assignee_usernames: ["worker"],
        tk_priority: "medium",
        tk_risk_level: "medium",
      }),
      { query: transaction.query },
    );
    expect(history.createTicketHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "ROUTING_RESET",
        metadata: expect.objectContaining({
          changedFields: ["subject"],
          routingSensitiveChanged: true,
          previousApprovalStepId: "7",
          nextApprovalStepId: null,
          previousAssigneeUsernames: ["approver"],
          nextAssigneeUsernames: ["worker"],
        }),
      }),
      { query: transaction.query },
    );
  });
});
