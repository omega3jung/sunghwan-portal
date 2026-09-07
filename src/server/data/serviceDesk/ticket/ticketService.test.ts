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
  createTicketRow: vi.fn(),
  findActiveDraftTicketIdByRequesterUsername: vi.fn(),
  findActiveTicketViewRowById: vi.fn(),
  findActiveTicketViewRows: vi.fn(),
  findActiveTicketViewRowsBySearch: vi.fn(),
  findApprovalStepAssigneeUsernames: vi.fn(),
  findCategoryAssignmentUsernames: vi.fn(),
  findEmployeeDepartmentIdByUsername: vi.fn(),
  findExpiredResolvedTicketViewRows: vi.fn(),
  findNextApprovalStepId: vi.fn(),
  findNextTicketNumber: vi.fn(),
  hasTicketWorkAssignmentHistory: vi.fn(),
}));
const updates = vi.hoisted(() => ({
  closeResolvedTicketById: vi.fn(),
  findActiveRequesterUpdateCategorySnapshotById: vi.fn(),
  startAssignedTicketWorkById: vi.fn(),
  submitDraftTicketRowById: vi.fn(),
  updateTicketInitialRoutingById: vi.fn(),
}));
const history = vi.hoisted(() => ({
  createHistoryOfApprovalRequested: vi.fn(),
  createHistoryOfAssignmentResolvedByRule: vi.fn(),
  createHistoryOfStatusChange: vi.fn(),
  createHistoryOfSystemResolutionClose: vi.fn(),
  createHistoryOfTicketCreate: vi.fn(),
}));
const workSessions = vi.hoisted(() => ({
  finishRunningWorkSessionsByTicketId: vi.fn(),
}));

vi.mock("@/server/shared/supabase/portalApiClient", () => transaction);
vi.mock("./ticketRepository", () => tickets);
vi.mock("./ticketUpdateRepository", () => updates);
vi.mock("../ticketHistory", () => history);
vi.mock("../workSession", () => workSessions);

import {
  closeExpiredResolvedTickets,
  createTicket,
  startTicketWork,
} from "./ticketService";

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
const input = {
  categoryId: 10,
  subject: "Printer unavailable",
  body: "The third-floor printer is offline.",
  dueAt: new Date("2099-01-10T00:00:00.000Z"),
  email: { to: [], cc: [], bcc: [] },
  files: [],
  images: [],
};

function ticketRow(
  overrides: Partial<ServiceDeskTicketViewRow> = {},
): ServiceDeskTicketViewRow {
  return {
    tk_id: "ticket-1",
    tk_tenant_id: 20,
    tn_name: { en: "Customer" },
    tk_ticket_no: "T-2099-0001",
    tk_created_at: "2099-01-01T00:00:00.000Z",
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
    tk_status: "Assigned",
    tk_priority: "high",
    tk_risk_level: "low",
    tk_assignee_usernames: ["worker"],
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
    tk_due_at: "2099-01-10T00:00:00.000Z",
    cat_scope: "PORTAL",
    cat_id: 10,
    cat_name: { en: "Printer" },
    cat_parent_id: null,
    tk_approval_step_id: null,
    tk_subject: "Printer unavailable",
    tk_content: "The third-floor printer is offline.",
    tk_email: { to: [], cc: [], bcc: [] },
    tk_files: [],
    tk_images: [],
    ...overrides,
  };
}

describe("ticket submission routing workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tickets.findNextTicketNumber.mockResolvedValue("T-2099-0001");
    tickets.findEmployeeDepartmentIdByUsername.mockResolvedValue(3);
    tickets.findActiveDraftTicketIdByRequesterUsername.mockResolvedValue(null);
    tickets.hasTicketWorkAssignmentHistory.mockResolvedValue(false);
    updates.findActiveRequesterUpdateCategorySnapshotById.mockResolvedValue(
      category,
    );
  });

  it("gives the first approval step precedence and records approval routing", async () => {
    const created = ticketRow({
      tk_status: "Approval",
      tk_approval_step_id: 7,
      tk_assignee_usernames: [],
    });
    const routed = ticketRow({
      tk_status: "Approval",
      tk_approval_step_id: 7,
      tk_assignee_usernames: ["approver"],
    });
    tickets.findNextApprovalStepId.mockResolvedValue(7);
    tickets.findApprovalStepAssigneeUsernames.mockResolvedValue(["approver"]);
    tickets.createTicketRow.mockResolvedValue(created);
    updates.updateTicketInitialRoutingById.mockResolvedValue(routed);

    const result = await createTicket(input, {
      requesterUsername: "requester",
      principal: { companyId: 22, userScope: "CLIENT" },
    });

    expect(result).toMatchObject({
      id: "ticket-1",
      status: "Approval",
      approval_step_id: "7",
      approval_assignee_usernames: ["approver"],
    });
    expect(tickets.findCategoryAssignmentUsernames).not.toHaveBeenCalled();
    expect(tickets.createTicketRow).toHaveBeenCalledWith(
      expect.objectContaining({
        tk_tenant_id: 20,
        tk_priority: "high",
        tk_risk_level: "low",
        tk_status: "Approval",
        tk_approval_step_id: 7,
      }),
      { query: transaction.query },
    );
    expect(history.createHistoryOfTicketCreate).toHaveBeenCalled();
    expect(history.createHistoryOfApprovalRequested).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "ticket-1",
        approvalStepId: 7,
        assigneeUsernames: ["approver"],
      }),
      { query: transaction.query },
    );
    expect(
      history.createHistoryOfAssignmentResolvedByRule,
    ).not.toHaveBeenCalled();
  });

  it("falls back to category assignment and records the resolved assignees", async () => {
    const created = ticketRow();
    const routed = ticketRow({ tk_assignee_usernames: ["worker-a", "worker-b"] });
    tickets.findNextApprovalStepId.mockResolvedValue(null);
    tickets.findCategoryAssignmentUsernames.mockResolvedValue([
      "worker-a",
      "worker-b",
    ]);
    tickets.createTicketRow.mockResolvedValue(created);
    updates.updateTicketInitialRoutingById.mockResolvedValue(routed);

    await createTicket(input, {
      requesterUsername: "requester",
      principal: { companyId: 22, userScope: "CLIENT" },
    });

    expect(updates.updateTicketInitialRoutingById).toHaveBeenCalledWith(
      "ticket-1",
      {
        approvalStepId: null,
        assigneeUsernames: ["worker-a", "worker-b"],
        status: "Assigned",
      },
      { query: transaction.query },
    );
    expect(history.createHistoryOfAssignmentResolvedByRule).toHaveBeenCalledWith(
      expect.objectContaining({
        fromAssigneeUsernames: [],
        toAssigneeUsernames: ["worker-a", "worker-b"],
      }),
      { query: transaction.query },
    );
  });

  it("rejects an unresolved route before creating a visible ticket or history", async () => {
    tickets.findNextApprovalStepId.mockResolvedValue(null);
    tickets.findCategoryAssignmentUsernames.mockResolvedValue([]);

    await expect(
      createTicket(input, {
        requesterUsername: "requester",
        principal: { companyId: 22, userScope: "CLIENT" },
      }),
    ).rejects.toMatchObject({ status: 409 });

    expect(tickets.createTicketRow).not.toHaveBeenCalled();
    expect(updates.submitDraftTicketRowById).not.toHaveBeenCalled();
    expect(history.createHistoryOfTicketCreate).not.toHaveBeenCalled();
  });
});

describe("ticket lifecycle service orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tickets.hasTicketWorkAssignmentHistory.mockResolvedValue(false);
  });

  it("starts work and records the status change in the same transaction", async () => {
    tickets.findActiveTicketViewRowById.mockResolvedValue(ticketRow());
    updates.startAssignedTicketWorkById.mockResolvedValue(
      ticketRow({ tk_status: "Working" }),
    );

    const result = await startTicketWork("ticket-1", "worker");

    expect(result.status).toBe("Working");
    expect(updates.startAssignedTicketWorkById).toHaveBeenCalledWith(
      "ticket-1",
      { assigneeUsername: "worker" },
      { query: transaction.query },
    );
    expect(history.createHistoryOfStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "ticket-1",
        actorUsername: "worker",
        fromStatus: "Assigned",
        toStatus: "Working",
      }),
      { query: transaction.query },
    );
  });

  it("rejects a non-assignee without mutating ticket or history", async () => {
    tickets.findActiveTicketViewRowById.mockResolvedValue(ticketRow());

    await expect(startTicketWork("ticket-1", "other-worker")).rejects.toMatchObject({
      status: 403,
    });
    expect(updates.startAssignedTicketWorkById).not.toHaveBeenCalled();
    expect(history.createHistoryOfStatusChange).not.toHaveBeenCalled();
  });

  it("keeps repeated start-work idempotent after the ticket has advanced", async () => {
    tickets.findActiveTicketViewRowById.mockResolvedValue(
      ticketRow({ tk_status: "Working" }),
    );

    const result = await startTicketWork("ticket-1", "worker");
    expect(result.status).toBe("Working");
    expect(updates.startAssignedTicketWorkById).not.toHaveBeenCalled();
    expect(history.createHistoryOfStatusChange).not.toHaveBeenCalled();
  });

  it("closes only successfully updated expired tickets and finishes running sessions", async () => {
    const now = new Date("2026-09-04T00:00:00.000Z");
    tickets.findExpiredResolvedTicketViewRows.mockResolvedValue([
      ticketRow({ tk_id: "expired-1", tk_status: "Resolved" }),
      ticketRow({ tk_id: "stale-read", tk_status: "Resolved" }),
    ]);
    updates.closeResolvedTicketById
      .mockResolvedValueOnce(ticketRow({ tk_id: "expired-1", tk_status: "Closed" }))
      .mockResolvedValueOnce(null);

    await expect(closeExpiredResolvedTickets(now)).resolves.toEqual({
      closedCount: 1,
      ticketIds: ["expired-1"],
    });
    expect(tickets.findExpiredResolvedTicketViewRows).toHaveBeenCalledWith(
      { now: now.toISOString(), graceDays: 7 },
      { query: transaction.query },
    );
    expect(workSessions.finishRunningWorkSessionsByTicketId).toHaveBeenCalledWith(
      "expired-1",
      now.toISOString(),
      { query: transaction.query },
    );
    expect(history.createHistoryOfSystemResolutionClose).toHaveBeenCalledWith(
      {
        ticketId: "expired-1",
        fromStatus: "Resolved",
        resolvedGraceDays: 7,
      },
      { query: transaction.query },
    );
  });

  it("propagates a lifecycle side-effect failure to the transaction boundary", async () => {
    tickets.findExpiredResolvedTicketViewRows.mockResolvedValue([
      ticketRow({ tk_id: "expired-1", tk_status: "Resolved" }),
    ]);
    updates.closeResolvedTicketById.mockResolvedValue(
      ticketRow({ tk_id: "expired-1", tk_status: "Closed" }),
    );
    history.createHistoryOfSystemResolutionClose.mockRejectedValue(
      new Error("history write failed"),
    );

    await expect(
      closeExpiredResolvedTickets(new Date("2026-09-04T00:00:00.000Z")),
    ).rejects.toThrow("history write failed");
  });
});
