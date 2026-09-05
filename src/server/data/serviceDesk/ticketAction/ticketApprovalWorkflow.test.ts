import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceDeskTicketViewRow } from "../ticket/ticketRow";
import type { TicketActionRow } from "./ticketActionRow";

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
  findActiveTicketViewRowById: vi.fn(),
  findActiveTicketViewRowByIdIncludingDraft: vi.fn(),
  findApprovalStepAssigneeUsernames: vi.fn(),
  findCategoryAssignmentUsernames: vi.fn(),
  findNextApprovalStepId: vi.fn(),
}));
const actions = vi.hoisted(() => ({
  createApprovalTicketActionRow: vi.fn(),
  createTicketActionRow: vi.fn(),
  findActiveTicketActionRowByTicketIdAndNo: vi.fn(),
  findActiveTicketActionRowsByTicketId: vi.fn(),
  findNextTicketActionNo: vi.fn(),
  softDeleteTicketActionRow: vi.fn(),
}));
const updates = vi.hoisted(() => ({
  updateTicketApprovalRoutingById: vi.fn(),
  updateTicketAssigneesById: vi.fn(),
  updateTicketPlanningById: vi.fn(),
  updateTicketStatusById: vi.fn(),
  updateTicketMergeStateById: vi.fn(),
  updateTicketCloseStateById: vi.fn(),
  updateTicketInitialRoutingById: vi.fn(),
}));
const history = vi.hoisted(() => ({
  createHistoryOfApprovalApproved: vi.fn(),
  createHistoryOfApprovalDeclined: vi.fn(),
  createHistoryOfApprovalRequested: vi.fn(),
  createHistoryOfAssignmentChange: vi.fn(),
  createHistoryOfAssignmentResolvedByRule: vi.fn(),
  createHistoryOfCommentCreated: vi.fn(),
  createHistoryOfNoteCreated: vi.fn(),
  createHistoryOfPlanningChange: vi.fn(),
  createHistoryOfStatusChange: vi.fn(),
  createHistoryOfTicketCanceled: vi.fn(),
  createHistoryOfTicketMerged: vi.fn(),
  createHistoryOfTicketRejected: vi.fn(),
}));
const historyService = vi.hoisted(() => ({ createTicketHistory: vi.fn() }));
const workSessions = vi.hoisted(() => ({
  finishRunningWorkSessionsByTicketId: vi.fn(),
}));

vi.mock("@/server/shared/supabase/portalApiClient", () => transaction);
vi.mock("../ticket/ticketRepository", () => tickets);
vi.mock("../ticket/ticketUpdateRepository", () => updates);
vi.mock("./ticketActionRepository", () => actions);
vi.mock("../ticketHistory/ticketHistoryEventService", () => history);
vi.mock("../ticketHistory/ticketHistoryService", () => historyService);
vi.mock("../workSession", () => workSessions);

import { executeTicketApprovalAction } from "./ticketActionService";

function approvalTicket(
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
    tk_due_at: "2026-01-10T00:00:00.000Z",
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

const approvalActionRow: TicketActionRow = {
  tka_ticket_id: "ticket-1",
  tka_action_no: 4,
  tka_action_type: "APPROVE",
  tka_content: "Approved",
  tka_metadata: { source: "ticketActionTool" },
  tka_files: [],
  tka_images: [],
  tka_owner_username: "approver",
  tka_active: true,
  tka_created_at: "2026-01-01T01:00:00.000Z",
  tka_updated_at: null,
};

describe("approval decision workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tickets.findActiveTicketViewRowById.mockResolvedValue(approvalTicket());
    actions.createApprovalTicketActionRow.mockResolvedValue(approvalActionRow);
    updates.updateTicketApprovalRoutingById.mockResolvedValue(
      approvalTicket(),
    );
  });

  it("rejects a non-approver before creating mutable or audit state", async () => {
    await expect(
      executeTicketApprovalAction({
        ticketId: "ticket-1",
        action: "approve",
        currentUserName: "outsider",
        payload: { content: "Approved" },
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(actions.createApprovalTicketActionRow).not.toHaveBeenCalled();
    expect(updates.updateTicketApprovalRoutingById).not.toHaveBeenCalled();
    expect(history.createHistoryOfApprovalApproved).not.toHaveBeenCalled();
  });

  it("advances to the next approval step with its approvers and matching history", async () => {
    tickets.findNextApprovalStepId.mockResolvedValue(8);
    tickets.findApprovalStepAssigneeUsernames.mockResolvedValue([
      "next-approver",
    ]);

    await executeTicketApprovalAction({
      ticketId: "ticket-1",
      action: "approve",
      currentUserName: "approver",
      payload: { content: "Approved" },
    });

    expect(updates.updateTicketApprovalRoutingById).toHaveBeenCalledWith(
      "ticket-1",
      {
        approvalStepId: 8,
        assigneeUsernames: ["next-approver"],
        status: "Approval",
        currentApprovalStepId: 7,
        currentApproverUsername: "approver",
        isAdmin: false,
      },
      { query: transaction.query },
    );
    expect(history.createHistoryOfApprovalApproved).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalStepId: 7,
        nextApprovalStepId: 8,
      }),
      { query: transaction.query },
    );
    expect(history.createHistoryOfApprovalRequested).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalStepId: 8,
        assigneeUsernames: ["next-approver"],
      }),
      { query: transaction.query },
    );
  });

  it("moves a final approval into Assigned and records rule-based work assignment", async () => {
    tickets.findNextApprovalStepId.mockResolvedValue(null);
    tickets.findCategoryAssignmentUsernames.mockResolvedValue([
      "worker-a",
      "worker-b",
    ]);

    await executeTicketApprovalAction({
      ticketId: "ticket-1",
      action: "approve",
      currentUserName: "approver",
      payload: { content: "Approved" },
    });

    expect(updates.updateTicketApprovalRoutingById).toHaveBeenCalledWith(
      "ticket-1",
      expect.objectContaining({
        approvalStepId: null,
        assigneeUsernames: ["worker-a", "worker-b"],
        status: "Assigned",
      }),
      { query: transaction.query },
    );
    expect(history.createHistoryOfAssignmentResolvedByRule).toHaveBeenCalledWith(
      expect.objectContaining({
        fromAssigneeUsernames: ["approver"],
        toAssigneeUsernames: ["worker-a", "worker-b"],
        metadata: {
          previousStatus: "Approval",
          nextStatus: "Assigned",
        },
      }),
      { query: transaction.query },
    );
    expect(history.createHistoryOfApprovalRequested).not.toHaveBeenCalled();
  });

  it("clears approval routing on decline and records the reason", async () => {
    actions.createApprovalTicketActionRow.mockResolvedValue({
      ...approvalActionRow,
      tka_action_type: "DECLINE",
      tka_content: "Insufficient detail",
    });

    await executeTicketApprovalAction({
      ticketId: "ticket-1",
      action: "decline",
      currentUserName: "approver",
      payload: { content: "  Insufficient detail  " },
    });

    expect(updates.updateTicketApprovalRoutingById).toHaveBeenCalledWith(
      "ticket-1",
      {
        approvalStepId: null,
        assigneeUsernames: [],
        status: "Declined",
        currentApprovalStepId: 7,
        currentApproverUsername: "approver",
        isAdmin: false,
      },
      { query: transaction.query },
    );
    expect(history.createHistoryOfApprovalDeclined).toHaveBeenCalledWith(
      expect.objectContaining({
        fromStatus: "Approval",
        toStatus: "Declined",
        reason: "Insufficient detail",
      }),
      { query: transaction.query },
    );
  });
});
